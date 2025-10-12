from db_utils import get_user_data

import logging
import json
import os
from openai.types.beta.realtime.session import TurnDetection

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    MetricsCollectedEvent,
    RoomInputOptions,
    WorkerOptions,
    cli,
    metrics,
)
from livekit.plugins import noise_cancellation, silero, openai, assemblyai, cartesia
from livekit.plugins.turn_detector.multilingual import MultilingualModel
from livekit.agents.llm import function_tool
from livekit.agents import mcp, RunContext, get_job_context
from livekit import api, rtc

from datetime import datetime

logger = logging.getLogger("agent")
# Set logger to debug

load_dotenv(".env.local")

MCP_SERVER_URL = os.getenv("MCP_SERVER_URL")
# if not MCP_SERVER_URL:
#     raise ValueError("MCP_SERVER_URL is not set")

COMPANY_NAME = "Jacks' Dental Practice"
MODEL = "gpt-realtime-mini"
VOICE = "marin"
TIMESLOT = "30 mins"
TIMEZONE = "Europe/Amsterdam or Central European Time"

DEFAULT_INSTRUCTIONS = f"""Always respond in English. 
You are a helpful voice AI assistant with access to tools to manage calendars of dental practice {COMPANY_NAME}. Use the tools to respond to the user's request.
The user is interacting with you via voice, even if you perceive the conversation as text. 
Always respond in English.
You can search the calendar and book appointments. Say a few seconds to the user while checking and booking an appointment.
Always search in the timezone - {TIMEZONE}
Pass in corresponding arguments to execute the tool. 
You are a receptionist with {COMPANY_NAME}. 
Current date time: {datetime.now().strftime('%A, %B %d, %Y %H:%M:%S')}
First search if the appointment asked by the user is available, do not book conflicting appointments.
Confirm explicitly the date, time with the user before booking an appointment.
After booking the appointment, confirm with the user and end the call.
Calender belongs to the company {COMPANY_NAME} and do not let the calling user know the details of the other appointments.
If the timeslot is booked, do not book conflicting appointments on that time slot.
After booking an appointment, send a confirmation email to user's email (Look up user's email and confirm with the user). 
Email to send:
subject: Appointment confirmation - {COMPANY_NAME}
As an intelligent AI Agent, I have booked your appointment at ..
Looking forward to meeting you.

"""

async def hangup_call():
    ctx = get_job_context()
    if ctx is None:
        # Not running in a job context
        return
    
    await ctx.api.room.delete_room(
        api.DeleteRoomRequest(
            room=ctx.room.name,
        )
    )

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=DEFAULT_INSTRUCTIONS,
        )

    # To add tools, use the @function_tool decorator.
    # Here's an example that adds a simple weather tool.
    # You also have to add `from livekit.agents.llm import function_tool, RunContext` to the top of this file
    # to hang up the call as part of a function call
    @function_tool()
    async def end_call(context: RunContext):
      """Use this tool when the task has been completed and the call should end."""
      logging.info("Tool called: end_call")
      
      try:
          # 1. Let agent finish speaking current response
          await context.wait_for_playout()
          logging.info("Agent finished speaking")
          
          # 2. Optional: Say goodbye before ending
          await context.session.say("Thank you for calling! Goodbye!", allow_interruptions=False)
          
          # 3. Get JobContext to access room information
          job_ctx = get_job_context()  # This is the correct way to access room
          room_name = job_ctx.room.name
          logging.info(f"Attempting to delete room: {room_name}")
          
          # 4. Use the API client from JobContext (recommended approach)
          await job_ctx.api.room.delete_room(api.DeleteRoomRequest(room=room_name))
          logging.info(f"Successfully deleted room: {room_name}")
          
      except Exception as e:
          logging.error(f"Error during end_call: {e}", exc_info=True)
          
          # Fallback: try to close session gracefully
          try:
              if context and context.session:
                  await context.session.aclose()
                  logging.info("Fallback session close completed")
          except Exception as close_error:
              logging.error(f"Fallback session close failed: {close_error}")
              
    @function_tool()
    async def lookup_user(
        context: RunContext,
    ) -> dict:
        """Look up a user's email and info to send an email."""
        # FIX
        ph = context.room.split("-")
        if ph > 1:
          user_data = get_user_data()
          user = user_data[user_data['phone_number'] == ph[1]]
          return user.to_dict()
        else:
          return {"name": "John Doe", "email": "john.doe@example.com"}

    @function_tool()
    async def update_email(
        context: RunContext,
    ) -> dict:
        """Update the user's email by confirming the security pin."""
        # FIX
        
        ph = context.room.split("-")
        if ph > 1:
          user_data = get_user_data()
          user = user_data[user_data['phone_number'] == ph[1]]
          return user.to_dict()
        else:
          return {"name": "John Doe", "email": "john.doe@example.com"}


    @function_tool()
    async def transfer_call(self, ctx: RunContext):
        """Transfer the call to a human agent, called after confirming with the user"""

        transfer_to = "+15105550123"
        participant_identity = "+15105550123"

        # let the message play fully before transferring
        await ctx.session.generate_reply(
            instructions="Inform the user that you're transferring them to a different agent."
        )

        job_ctx = get_job_context()
        try:
            await job_ctx.api.sip.transfer_sip_participant(
                api.TransferSIPParticipantRequest(
                    room_name=job_ctx.room.name,
                    participant_identity=participant_identity,
                    # to use a sip destination, use `sip:user@host` format
                    transfer_to=f"tel:{transfer_to}",
                )
            )
        except Exception as e:
            print(f"error transferring call: {e}")
            # give the LLM that context
            return "could not transfer call"


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
     # Join the room and connect to the user
    await ctx.connect()

    # logger.debug(f"Job Context {vars(ctx)}")

    try:
      # Load user data from job metadata
      metadata = json.loads(ctx.job.metadata)
    except Exception as e:
      metadata = {}
    user_name = metadata.get("user_name", "Guest")
    # user_name = "Jack"
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    users = get_user_data()
    user = ctx.room.name.split("-")

    # Set up a voice AI pipeline using OpenAI, Cartesia, AssemblyAI, and the LiveKit turn detector
    # session = AgentSession(
    #     # Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
    #     # See all available models at https://docs.livekit.io/agents/models/stt/
    #     stt=assemblyai.STT(
    #             # model="assemblyai/universal-streaming:en",
    #             end_of_turn_confidence_threshold=0.7,
    #             min_end_of_turn_silence_when_confident=160,
    #             max_turn_silence=2400,
    #             ),
    #     # A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
    #     # See all available models at https://docs.livekit.io/agents/models/llm/
    #     llm="openai/gpt-4o-mini",
    #     # Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
    #     # See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
    #     # tts="cartesia/sonic-2:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
    #     tts=cartesia.TTS(
    #         model="cartesia/sonic-turbo",
    #         language="en",
    #     ),
    #     # VAD and turn detection are used to determine when the user is speaking and when the agent should respond
    #     # See more at https://docs.livekit.io/agents/build/turns
    #     turn_detection=MultilingualModel(),
    #     vad=ctx.proc.userdata["vad"],
    #     # allow the LLM to generate a response while waiting for the end of turn
    #     # See more at https://docs.livekit.io/agents/build/audio/#preemptive-generation
    #     preemptive_generation=True,
    #     mcp_servers=[
    #       mcp.MCPServerStdio(command="uvx", args="osm-mcp-server"),
    #       mcp.MCPServerHTTP(url=MCP_SERVER_URL)
    #     ]
    # )

    # To use a realtime model instead of a voice pipeline, use the following session setup instead.
    # (Note: This is for the OpenAI Realtime API. For other providers, see https://docs.livekit.io/agents/models/realtime/))
    # 1. Install livekit-agents[openai]
    # 2. Set OPENAI_API_KEY in .env.local
    # 3. Add `from livekit.plugins import openai` to the top of this file
    # 4. Use the following session setup instead of the version above
    session = AgentSession(
        llm=openai.realtime.RealtimeModel(
            model=MODEL,
            voice=VOICE,
            temperature=0.6,
            turn_detection=TurnDetection(
                    type="server_vad",  # Faster than semantic_vad
                    threshold=0.6,        # Slightly higher for telephony
                    prefix_padding_ms=200,  # Reduced from default 300ms
                    silence_duration_ms=400,  # Reduced from default 500ms
                    create_response=True,
                    interrupt_response=True,
                )
        ),
        preemptive_generation=True,
        mcp_servers=[
          # mcp.MCPServerStdio(command="uvx", args="osm-mcp-server"),
          mcp.MCPServerHTTP(
              url=MCP_SERVER_URL
          )
        ],
        userdata=user[1] if len(user) > 1 else 'guest'
    )

    # Metrics collection, to measure pipeline performance
    # For more information, see https://docs.livekit.io/agents/build/metrics/
    usage_collector = metrics.UsageCollector()

    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent):
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)

    async def log_usage():
        summary = usage_collector.get_summary()
        logger.info(f"Usage: {summary}")

    ctx.add_shutdown_callback(log_usage)

    # # Add a virtual avatar to the session, if desired
    # # For other providers, see https://docs.livekit.io/agents/models/avatar/
    # avatar = hedra.AvatarSession(
    #   avatar_id="...",  # See https://docs.livekit.io/agents/models/avatar/plugins/hedra
    # )
    # # Start the avatar and wait for it to join
    # await avatar.start(session, room=ctx.room)

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=Assistant(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            # For telephony applications, use `BVCTelephony` for best results
            noise_cancellation=noise_cancellation.BVCTelephony(),
        ),
    )

    await session.generate_reply(
        instructions=f"""Greet the user and offer your assistance. You should start by speaking in English.
        Always respond in English. Welcome to {COMPANY_NAME}."""
    )

    # TODO: Conditional end the call - maintain a state and monitor task completion and end the call


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
