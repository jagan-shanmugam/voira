from livekit.agents import Agent, ChatContext, ChatMessage, AgentSession
from livekit import agents
import logging

class RAGVoiceAgent(Agent):
    def __init__(self, chat_ctx: ChatContext):
        super().__init__(
            chat_ctx=chat_ctx,
            instructions="""You are a helpful AI assistant with access to a knowledge base. 
            Use the provided context to answer questions accurately. If the context doesn't 
            contain relevant information, say so clearly."""
        )
        self.weaviate_rag = WeaviateRAG()
    
    async def on_user_turn_completed(
        self, 
        turn_ctx: ChatContext, 
        new_message: ChatMessage
    ) -> None:
        """Perform RAG lookup after user completes their turn"""
        user_query = new_message.text_content()
        logging.info(f"Performing RAG lookup for: {user_query}")
        
        # Retrieve relevant context from Weaviate
        rag_content = await self.weaviate_rag.retrieve_context(user_query)
        
        if rag_content:
            # Inject context into chat for next LLM generation
            turn_ctx.add_message(
                role="assistant",
                content=f"""Relevant context from knowledge base:{rag_content}
                Use this context to answer the user's question: "{user_query}" """
            )
            logging.info("RAG context added to conversation")
        else:
            logging.info("No relevant context found")

async def entrypoint(ctx: agents.JobContext):
    """Main agent entry point"""
    await ctx.connect(auto_subscribe=agents.AutoSubscribe.SUBSCRIBE_ALL)
    
    # Initialize agent session with your preferred STT, LLM, TTS
    session = AgentSession(
        stt=deepgram.STT(),  # Your STT provider
        llm=openai.LLM(),    # Your LLM provider  
        tts=cartesia.TTS(),  # Your TTS provider
        vad=silero.VAD(),    # Voice activity detection
    )
    
    # Start session with RAG-enabled agent
    initial_ctx = ChatContext()
    await session.start(
        room=ctx.room,
        agent=RAGVoiceAgent(chat_ctx=initial_ctx)
    )
    
    # Optional: Generate initial greeting
    await session.generate_reply(
        instructions="Greet the user and explain you have access to a knowledge base."
    )
