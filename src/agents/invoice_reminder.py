import logging
import json
import os
from openai.types.beta.realtime.session import TurnDetection
from datetime import datetime, timedelta
import pandas as pd

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

# Import db_utils for user data access
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from db_utils import get_user_data

logger = logging.getLogger("invoice_reminder_agent")
load_dotenv(".env.local")

MCP_SERVER_URL = os.getenv("MCP_SERVER_URL")
COMPANY_NAME = "Jacks' Dental Practice"
MODEL = "gpt-realtime-mini"
VOICE = "marin"
TIMEZONE = "Europe/Amsterdam or Central European Time"

DEFAULT_INSTRUCTIONS = f"""Always respond in English. 
You are a helpful voice AI assistant for {COMPANY_NAME} with access to tools to manage invoice reminders and payment collections. 
The user is interacting with you via voice, even if you perceive the conversation as text. 
Always respond in English.
You can look up outstanding invoices, send payment reminders, and update payment status.
Say a few seconds to the user while checking invoice information and processing requests.
Always work in the timezone - {TIMEZONE}
Pass in corresponding arguments to execute the tool. 
You are a billing assistant with {COMPANY_NAME}. 
Current date time: {datetime.now().strftime('%A, %B %d, %Y %H:%M:%S')}
First check if there are any outstanding invoices for the user, then proceed with appropriate actions.
Confirm payment details with the user before updating any payment status.
After processing payment or sending reminders, confirm with the user and end the call.
Invoice information belongs to the company {COMPANY_NAME} and maintain confidentiality.
After processing payments, send a confirmation email to user's email (Look up user's email and confirm with the user). 
Email to send:
subject: Payment confirmation - {COMPANY_NAME}
As an intelligent AI Agent, I have processed your payment for invoice number ..
Thank you for your payment.

"""

class InvoiceReminderAgent(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=DEFAULT_INSTRUCTIONS,
        )

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
            job_ctx = get_job_context()
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
    async def lookup_outstanding_invoices(
        context: RunContext,
        customer_phone: str = None
    ) -> dict:
        """Look up outstanding invoices for a customer by phone number."""
        try:
            # Extract phone number from room context if not provided
            if not customer_phone:
                room_parts = context.room.split("Call-")
                if len(room_parts) > 1:
                    customer_phone = room_parts[1]
                else:
                    return {"error": "No phone number provided"}
            
            # Get user data
            user_data = get_user_data()
            user = user_data[user_data['phone_number'] == customer_phone]
            
            if user.empty:
                return {"error": "Customer not found", "phone": customer_phone}
            
            # Mock invoice data - in real implementation, this would come from a database
            mock_invoices = [
                {
                    "invoice_id": "INV-001",
                    "amount": 150.00,
                    "due_date": (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d'),
                    "status": "overdue",
                    "description": "Dental cleaning and checkup"
                },
                {
                    "invoice_id": "INV-002", 
                    "amount": 75.00,
                    "due_date": (datetime.now() + timedelta(days=3)).strftime('%Y-%m-%d'),
                    "status": "pending",
                    "description": "X-ray services"
                }
            ]
            
            return {
                "customer": user.iloc[0].to_dict(),
                "outstanding_invoices": mock_invoices,
                "total_outstanding": sum(inv["amount"] for inv in mock_invoices)
            }
            
        except Exception as e:
            logging.error(f"Error looking up invoices: {e}")
            return {"error": f"Failed to lookup invoices: {str(e)}"}

    @function_tool()
    async def send_payment_reminder(
        context: RunContext,
        invoice_id: str,
        reminder_type: str = "gentle"
    ) -> dict:
        """Send a payment reminder for a specific invoice."""
        try:
            # Mock reminder sending - in real implementation, this would send actual emails/SMS
            reminder_templates = {
                "gentle": "This is a friendly reminder that your invoice {invoice_id} is due for payment.",
                "urgent": "URGENT: Your invoice {invoice_id} is overdue. Please make payment immediately.",
                "final": "FINAL NOTICE: Your invoice {invoice_id} is significantly overdue. Please contact us immediately."
            }
            
            message = reminder_templates.get(reminder_type, reminder_templates["gentle"]).format(invoice_id=invoice_id)
            
            # In real implementation, this would:
            # 1. Send email to customer
            # 2. Log the reminder in the system
            # 3. Update reminder count
            
            return {
                "success": True,
                "invoice_id": invoice_id,
                "reminder_type": reminder_type,
                "message_sent": message,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Error sending payment reminder: {e}")
            return {"error": f"Failed to send reminder: {str(e)}"}

    @function_tool()
    async def process_payment(
        context: RunContext,
        invoice_id: str,
        payment_amount: float,
        payment_method: str = "credit_card"
    ) -> dict:
        """Process a payment for a specific invoice."""
        try:
            # Mock payment processing - in real implementation, this would integrate with payment gateway
            if payment_amount <= 0:
                return {"error": "Invalid payment amount"}
            
            # Simulate payment processing
            payment_id = f"PAY-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            return {
                "success": True,
                "payment_id": payment_id,
                "invoice_id": invoice_id,
                "amount": payment_amount,
                "method": payment_method,
                "timestamp": datetime.now().isoformat(),
                "confirmation_number": f"CONF-{payment_id}"
            }
            
        except Exception as e:
            logging.error(f"Error processing payment: {e}")
            return {"error": f"Failed to process payment: {str(e)}"}

    @function_tool()
    async def update_invoice_status(
        context: RunContext,
        invoice_id: str,
        new_status: str
    ) -> dict:
        """Update the status of an invoice."""
        try:
            valid_statuses = ["pending", "paid", "overdue", "cancelled"]
            if new_status not in valid_statuses:
                return {"error": f"Invalid status. Must be one of: {valid_statuses}"}
            
            # Mock status update - in real implementation, this would update the database
            return {
                "success": True,
                "invoice_id": invoice_id,
                "old_status": "pending",  # Would get from database
                "new_status": new_status,
                "updated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Error updating invoice status: {e}")
            return {"error": f"Failed to update status: {str(e)}"}

    @function_tool()
    async def lookup_user(
        context: RunContext,
    ) -> dict:
        """Look up a user's email and info to send an email."""
        try:
            room_parts = context.room.split("-")
            if len(room_parts) > 1:
                user_data = get_user_data()
                user = user_data[user_data['phone_number'] == room_parts[1]]
                if not user.empty:
                    return user.iloc[0].to_dict()
            return {"name": "John Doe", "email": "john.doe@example.com"}
        except Exception as e:
            logging.error(f"Error looking up user: {e}")
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

    try:
        # Load user data from job metadata
        metadata = json.loads(ctx.job.metadata)
    except Exception as e:
        metadata = {}
    
    user_name = metadata.get("user_name", "Guest")
    
    # Logging setup
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    users = get_user_data()
    user = ctx.room.name.split("-")

    # Set up the voice AI pipeline using OpenAI Realtime API
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
            mcp.MCPServerHTTP(
                url=MCP_SERVER_URL
            )
        ],
        userdata=user[1] if len(user) > 1 else 'guest'
    )

    # Metrics collection, to measure pipeline performance
    usage_collector = metrics.UsageCollector()

    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent):
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)

    async def log_usage():
        summary = usage_collector.get_summary()
        logger.info(f"Usage: {summary}")

    ctx.add_shutdown_callback(log_usage)

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=InvoiceReminderAgent(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            # For telephony applications, use `BVCTelephony` for best results
            noise_cancellation=noise_cancellation.BVCTelephony(),
        ),
    )

    await session.generate_reply(
        instructions=f"""Greet the user and offer your assistance with invoice and payment matters. 
        You should start by speaking in English.
        Always respond in English. Welcome to {COMPANY_NAME} billing department."""
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))