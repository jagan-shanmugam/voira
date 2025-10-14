import weaviate
from weaviate.classes.query import MetadataQuery
import asyncio
from typing import List, Optional
import os
import pandas as pd
import logging

logger = logging.getLogger(__name__)

# TODO: Future enhancement - Support additional document types (.pdf, .docx, .csv)
# TODO: Future enhancement - Implement document chunking for large files
# TODO: Future enhancement - Implement hybrid search (vector + keyword)

class WeaviateRAG:
    """
    Weaviate RAG client for tenant-specific knowledge base searches.
    Uses Weaviate Cloud with OpenAI text-embedding-3-small vectorizer.
    """
    
    def __init__(self, tenant_id: str):
        """
        Initialize Weaviate RAG client for a specific tenant.
        
        Args:
            tenant_id: Unique identifier for the tenant
        """
        self.tenant_id = tenant_id
        self.collection_name = f"Documents_{tenant_id}"
        self.client = None
        self._initialize_client()
        
    def _initialize_client(self):
        """Initialize Weaviate Cloud client with proper error handling"""
        try:
            weaviate_url = os.getenv("WEAVIATE_URL")
            weaviate_key = os.getenv("WEAVIATE_API_KEY")
            openai_key = os.getenv("OPENAI_API_KEY")
            
            if not all([weaviate_url, weaviate_key, openai_key]):
                raise ValueError("Missing required environment variables: WEAVIATE_URL, WEAVIATE_API_KEY, or OPENAI_API_KEY")
            
            self.client = weaviate.connect_to_weaviate_cloud(
                cluster_url=weaviate_url,
                auth_credentials=weaviate.auth.AuthApiKey(weaviate_key),
                headers={
                    "X-OpenAI-Api-Key": openai_key
                }
            )
            logger.info(f"Connected to Weaviate Cloud for tenant: {self.tenant_id}")
        except Exception as e:
            logger.error(f"Failed to initialize Weaviate client: {e}")
            raise
    
    async def retrieve_context(self, query: str, limit: int = 3) -> str:
        """
        Retrieve relevant context from Weaviate using vector search.
        
        Args:
            query: Search query text
            limit: Maximum number of results to return
            
        Returns:
            Formatted string with relevant document contexts
        """
        try:
            if not self.client:
                logger.error("Weaviate client not initialized")
                return ""
            
            # Check if collection exists
            collection_exists = await asyncio.to_thread(
                lambda: self.client.collections.exists(self.collection_name)
            )
            
            if not collection_exists:
                logger.warning(f"Collection {self.collection_name} does not exist for tenant {self.tenant_id}")
                return ""
            
            # Perform search
            result = await asyncio.to_thread(
                self._sync_search, query, limit
            )
            
            return self._format_results(result)
            
        except Exception as e:
            logger.error(f"RAG retrieval error: {e}", exc_info=True)
            return ""
    
    def _sync_search(self, query: str, limit: int):
        """Synchronous search operation to be run in thread"""
        try:
            collection = self.client.collections.get(self.collection_name)
            
            response = collection.query.near_text(
                query=query,
                limit=limit,
                return_metadata=MetadataQuery(distance=True)
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error in sync search: {e}")
            raise
    
    def _format_results(self, response) -> str:
        """
        Format search results into readable context string.
        
        Args:
            response: Weaviate query response object
            
        Returns:
            Formatted string with document contexts
        """
        if not response or not response.objects:
            return ""
        
        contexts = []
        for obj in response.objects:
            properties = obj.properties
            title = properties.get('title', 'N/A')
            content = properties.get('content', '')
            filename = properties.get('filename', '')
            
            # Include distance/certainty if available
            distance_info = ""
            if hasattr(obj.metadata, 'distance') and obj.metadata.distance is not None:
                distance_info = f" (relevance: {1 - obj.metadata.distance:.2f})"
            
            contexts.append(
                f"Document: {title} ({filename}){distance_info}\n"
                f"Content: {content}"
            )
        
        return "\n\n---\n\n".join(contexts)
    
    def close(self):
        """Close the Weaviate client connection"""
        if self.client:
            try:
                self.client.close()
                logger.info(f"Closed Weaviate connection for tenant: {self.tenant_id}")
            except Exception as e:
                logger.error(f"Error closing Weaviate client: {e}")
    
    def __del__(self):
        """Cleanup on object deletion"""
        self.close()

def get_user_data(file_path="src/data/user_data.csv"):
    """
    Load user data from CSV into a pandas DataFrame.
    """

    try:
        # Get the current file directory and read from there
        df = pd.read_csv(file_path, dtype=str)
        # Make sure 'id' is str
        df['id'] = df['id'].astype(str)
    except FileNotFoundError:
        logger.error(f"File {file_path} not found")
        return pd.DataFrame()
    except Exception as e:
        logger.error(f"Error loading user data: {e}")
        return pd.DataFrame()
    
    return df
