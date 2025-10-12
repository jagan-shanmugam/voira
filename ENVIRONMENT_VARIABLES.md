# Environment Variables Configuration

This document describes the environment variables required for the Voira application.

## Required Environment Variables

### Weaviate Cloud Configuration

These variables are required for document ingestion and RAG (Retrieval-Augmented Generation) functionality.

**Frontend (.env.local in `/frontend`):**
```bash
WEAVIATE_URL=https://your-cluster.weaviate.network
WEAVIATE_API_KEY=your-weaviate-api-key
OPENAI_API_KEY=your-openai-api-key
```

**Backend (.env.local in root):**
```bash
WEAVIATE_URL=https://your-cluster.weaviate.network
WEAVIATE_API_KEY=your-weaviate-api-key
OPENAI_API_KEY=your-openai-api-key
```

#### How to get these:

1. **Weaviate Cloud Credentials:**
   - Sign up at [Weaviate Cloud Console](https://console.weaviate.cloud/)
   - Create a new cluster
   - Copy the cluster URL (e.g., `https://your-cluster.weaviate.network`)
   - Copy the API key from the cluster details

2. **OpenAI API Key:**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (starts with `sk-`)

### LiveKit Configuration

Required for the voice agent functionality.

```bash
LIVEKIT_URL=wss://your-livekit-server.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
```

#### How to get these:

1. Sign up at [LiveKit Cloud](https://cloud.livekit.io/)
2. Create a project
3. Use the LiveKit CLI to export environment variables:
   ```bash
   lk cloud auth
   lk app env -w -d .env.local
   ```

### MCP Server Configuration (Optional)

For Model Context Protocol servers:

```bash
MCP_SERVER_URL=http://your-mcp-server-url
```

## Setup Instructions

### Backend Setup

1. Create `.env.local` in the project root:
   ```bash
   cp .env.local.example .env.local  # if example exists
   ```

2. Fill in the required values in `.env.local`

3. The agent will automatically detect and use these variables

### Frontend Setup

1. Create `.env.local` in the `frontend` directory:
   ```bash
   cd frontend
   touch .env.local
   ```

2. Add the required Weaviate and OpenAI variables

3. Restart the Next.js development server

## Variable Usage

### Document Ingestion Flow

1. **Frontend**: NextJS API route (`/api/ingest`) uses:
   - `WEAVIATE_URL` - Connect to Weaviate Cloud
   - `WEAVIATE_API_KEY` - Authenticate with Weaviate
   - `OPENAI_API_KEY` - Generate embeddings for documents

2. **Backend**: Python agent (`src/agent.py` and `src/db_utils.py`) uses:
   - `WEAVIATE_URL` - Connect to Weaviate Cloud
   - `WEAVIATE_API_KEY` - Authenticate with Weaviate
   - `OPENAI_API_KEY` - Generate embeddings for queries

### Collection Naming Convention

Collections are automatically created per tenant:
- Format: `Documents_{tenantId}`
- Example: `Documents_dental_practice_001`

## Troubleshooting

### "Missing required environment variables" error

- Verify all three Weaviate/OpenAI variables are set
- Check for typos in variable names
- Ensure the `.env.local` file is in the correct directory
- Restart the application after adding variables

### Connection errors

- Verify the Weaviate URL is correct and accessible
- Check that the API key is valid and not expired
- Ensure your IP is allowed in Weaviate Cloud (if IP restrictions are enabled)

### "Collection does not exist" warnings

- This is normal if no documents have been ingested yet
- Ingest documents via the `/api/ingest` endpoint first
- Collections are created automatically on first document upload

## Security Notes

- **Never commit `.env.local` files to version control**
- Add `.env.local` to `.gitignore`
- Use different API keys for development and production
- Rotate API keys regularly
- Use environment-specific keys in CI/CD pipelines

