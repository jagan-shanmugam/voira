from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, cli, function_tool, RunContext
from livekit.plugins.openai import realtime
from openai.types.beta.realtime.session import TurnDetection

async def entrypoint(ctx: JobContext):
    await ctx.connect()
    
    agent = Agent(
        instructions="You are a helpful assistant that collects user information"
    )
    
    session = AgentSession(
        llm=realtime.RealtimeModel(
            model="gpt-realtime",
            voice="alloy",
            temperature=0.8,
            turn_detection=TurnDetection(
                type="semantic_vad",  # Better for conversations
                create_response=True
            )
        )
    )
    
    await session.start(agent=agent, room=ctx.room)
    
    # Agent speaks first
    await session.generate_reply(
        instructions="Introduce yourself and ask the user for their name"
    )

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
