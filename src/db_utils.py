import weaviate
import asyncio
from typing import List
import os

class WeaviateRAG:
    def __init__(self):
        self.client = weaviate.Client(
            url=os.getenv("WEAVIATE_URL"),
            auth_client_secret=weaviate.AuthApiKey(api_key=os.getenv("WEAVIATE_API_KEY")),
            additional_headers={
                "X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY")
            }
        )
        
    async def retrieve_context(self, query: str, limit: int = 3) -> str:
        """Retrieve relevant context from Weaviate using vector search"""
        try:
            result = await asyncio.to_thread(
                self._sync_search, query, limit
            )
            return self._format_results(result)
        except Exception as e:
            print(f"RAG retrieval error: {e}")
            return ""
    
    def _sync_search(self, query: str, limit: int):
        return (
            self.client.query
            .get("Document", ["content", "title", "metadata"])
            .with_near_text({"concepts": [query]})
            .with_limit(limit)
            .do()
        )
    
    def _format_results(self, results) -> str:
        if not results.get("data", {}).get("Get", {}).get("Document"):
            return ""
        
        contexts = []
        for doc in results["data"]["Get"]["Document"]:
            contexts.append(f"Title: {doc.get('title', 'N/A')}\nContent: {doc.get('content', '')}")
        
        return "\n\n---\n\n".join(contexts)


import pandas as pd

def get_user_data(file_path="src/data/user_data.csv"):
    """
    Load user data from CSV into a pandas DataFrame.
    """

    # Get the current file directory and read from there
    df = pd.read_csv(file_path, dtype=str)
    # Make sure 'id' is str
    df['id'] = df['id'].astype(str)
    
    return df
