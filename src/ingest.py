import weaviate
import openai
from pathlib import Path
import json
import os

# TODO: Future enhancement - Support additional document types (.pdf, .docx, .csv)
# TODO: This script is deprecated. Use the NextJS API endpoint at /api/ingest instead
# TODO: Migrate this to use Weaviate v4 client API

def ingest_documents(documents_path: str, tenant_id: str):
    """
    DEPRECATED: Use NextJS /api/ingest endpoint instead.
    
    Ingest documents into Weaviate. Create one collection for each tenant.
    Use openAI text-embedding-3-small for the vectorizer.
    """
    client = weaviate.Client(
        url=os.getenv("WEAVIATE_URL"),
        auth_client_secret=weaviate.AuthApiKey(api_key=os.getenv("WEAVIATE_API_KEY")),
        additional_headers={
            "X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY")
        }
    )
    
    # Create schema if not exists
    schema = {
        "class": "Document",
        "description": "A document for RAG",
        "vectorizer": "text2vec-openai",
        "moduleConfig": {
            "text2vec-openai": {
                "model": "text-embedding-3-small",
                "dimensions": 1536
            }
        },
        "properties": [
            {
                "name": "content",
                "dataType": ["text"],
                "description": "Document content"
            },
            {
                "name": "title", 
                "dataType": ["string"],
                "description": "Document title"
            },
            {
                "name": "metadata",
                "dataType": ["text"],
                "description": "Additional metadata"
            }
        ]
    }
    
    # Create class if not exists
    if not client.schema.exists("Document"):
        client.schema.create_class(schema)
    
    # Ingest documents
    for doc_path in Path(documents_path).glob("*.txt"):
        with open(doc_path, 'r') as f:
            content = f.read()
        
        client.data_object.create(
            data_object={
                "content": content,
                "title": doc_path.stem,
                "metadata": f"source: {doc_path.name}"
            },
            class_name="Document"
        )
        print(f"Ingested: {doc_path.name}")

if __name__ == "__main__":
    ingest_documents("./documents")
