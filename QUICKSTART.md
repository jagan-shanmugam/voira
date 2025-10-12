# 🚀 RAG Quick Start Guide

Get your document ingestion and RAG-powered agent running in 5 minutes!

## Prerequisites

- Weaviate Cloud account ([Sign up free](https://console.weaviate.cloud/))
- OpenAI API key ([Get key](https://platform.openai.com/api-keys))
- LiveKit Cloud account ([Sign up](https://cloud.livekit.io/))

## Step 1: Configure Environment (2 min)

### Backend Configuration

Create or edit `.env.local` in project root:

```bash
# Weaviate Cloud
WEAVIATE_URL=https://your-cluster.weaviate.network
WEAVIATE_API_KEY=your-weaviate-api-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# LiveKit (use CLI: lk app env -w -d .env.local)
LIVEKIT_URL=wss://your-livekit.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

### Frontend Configuration

Create `frontend/.env.local`:

```bash
# Same Weaviate & OpenAI credentials
WEAVIATE_URL=https://your-cluster.weaviate.network
WEAVIATE_API_KEY=your-weaviate-api-key
OPENAI_API_KEY=sk-your-openai-key
```

## Step 2: Start Services (1 min)

```bash
# Terminal 1: Frontend
cd frontend
pnpm install  # first time only
pnpm dev

# Terminal 2: Backend Agent
cd ..
uv run python src/agent.py download-files  # first time only
uv run python src/agent.py dev
```

## Step 3: Ingest Test Document (1 min)

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "demo",
    "documents": [
      {
        "filename": "services.txt",
        "content": "We offer teeth cleaning for $150, teeth whitening for $400, and fillings starting at $200. Our office hours are Monday through Friday 8 AM to 6 PM, and Saturday 9 AM to 2 PM. We accept most major insurance plans."
      }
    ]
  }'
```

**Expected Output:**
```json
{"success": true, "inserted": 1, "collectionName": "Documents_demo"}
```

## Step 4: Test Agent (1 min)

1. Open your frontend at `http://localhost:3000`
2. Connect with room name: `room-demo`
3. Ask: **"What are your office hours?"**
4. Agent should respond with office hours from the document!

## Verify It's Working

### Check Logs

**Agent should show:**
```
INFO:agent:RAG initialized for tenant: demo
INFO:agent:Searching knowledge base for: office hours
INFO:agent:Found knowledge base results
```

### Check Weaviate

1. Go to [Weaviate Console](https://console.weaviate.cloud/)
2. Select your cluster
3. Look for collection: `Documents_demo`
4. Verify it has 1 object

## Common Commands

### Ingest Multiple Documents

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "demo",
    "documents": [
      {"filename": "services.txt", "content": "..."},
      {"filename": "policies.md", "content": "..."},
      {"filename": "pricing.txt", "content": "..."}
    ]
  }'
```

### Test Different Tenants

```bash
# Ingest for tenant "practice1"
curl ... -d '{"tenantId": "practice1", ...}'

# Connect with room: room-practice1
# Agent will search Documents_practice1 collection
```

## Test Queries

Try asking the agent:

- ✅ "What services do you offer?"
- ✅ "How much does teeth cleaning cost?"
- ✅ "What are your office hours?"
- ✅ "What insurance do you accept?"
- ✅ "Tell me about your policies"

## Troubleshooting

### "Missing required environment variables"
→ Check `.env.local` files exist in correct directories

### "Connection error" or "Failed to initialize"
→ Verify Weaviate URL and API key are correct

### "Collection does not exist"
→ Ingest documents first via `/api/ingest`

### Agent not searching knowledge base
→ Check logs for "RAG initialized" message

### No results from search
→ Verify tenant ID matches between ingestion and agent session

## Next Steps

- 📖 Read [docs/ingestion_example.md](docs/ingestion_example.md) for detailed examples
- ⚙️ See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for all configuration options
- 📋 Check [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical details

## File Types Supported

Currently:
- ✅ `.txt` - Plain text files
- ✅ `.md` - Markdown files

Coming soon:
- ⏳ `.pdf` - PDF documents
- ⏳ `.docx` - Word documents
- ⏳ `.csv` - CSV files

## Architecture

```
Frontend (NextJS)
    ↓ POST /api/ingest
Weaviate Cloud
    ├─ Documents_tenant1/
    ├─ Documents_tenant2/
    └─ Documents_demo/
    ↑ search query
Agent (Python + LiveKit)
```

## Support

- 🐛 Issues: Check logs and troubleshooting guide
- 📚 Docs: See [README.md](README.md) and [docs/](docs/) folder
- 💬 Community: [LiveKit Discord](https://livekit.io/discord)

---

**Status**: ✅ Implementation Complete  
**Time to Deploy**: ~5 minutes  
**Ready for Production**: After testing

