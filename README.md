<a href="https://livekit.io/">
  <img src="./.github/assets/livekit-mark.png" alt="LiveKit logo" width="100" height="100">
</a>

# Voira - LiveKit Agents Python with Weaviate RAG and Beyond Presence, AssemblyAI, Cartesia, OpenAI, and MCP Servers (ACI/Gate22)

## TL;DR

Build production-ready voice AI agents in minutes. Voira combines LiveKit Agents for Python with a Next.js web embed, Weaviate-powered RAG, and turnkey telephony to deliver real-time, low-latency conversations grounded in your data. Swap LLM/STT/TTS models, ingest tenant-scoped documents, and deploy with a single Dockerfile.

A complete starter project for building voice AI apps with [LiveKit Agents for Python](https://github.com/livekit/agents) and [LiveKit Cloud](https://cloud.livekit.io/), featuring integrated RAG (Retrieval-Augmented Generation) capabilities with Weaviate Cloud.

The starter project includes:

- A voice AI assistant with **RAG-powered knowledge base search**, ready for extension and customization
- **Document ingestion via NextJS API** with tenant-specific collections in Weaviate Cloud
- A voice AI pipeline with [models](https://docs.livekit.io/agents/models) from OpenAI, Cartesia, and AssemblyAI served through LiveKit Cloud
  - Easily integrate your preferred [LLM](https://docs.livekit.io/agents/models/llm/), [STT](https://docs.livekit.io/agents/models/stt/), and [TTS](https://docs.livekit.io/agents/models/tts/) instead, or swap to a realtime model like the [OpenAI Realtime API](https://docs.livekit.io/agents/models/realtime/openai)
- **Weaviate Cloud integration** for vector database and semantic search
- Eval suite based on the LiveKit Agents [testing & evaluation framework](https://docs.livekit.io/agents/build/testing/)
- [LiveKit Turn Detector](https://docs.livekit.io/agents/build/turns/turn-detector/) for contextually-aware speaker detection, with multilingual support
- [Background voice cancellation](https://docs.livekit.io/home/cloud/noise-cancellation/)
- Integrated [metrics and logging](https://docs.livekit.io/agents/build/metrics/)
- A Dockerfile ready for [production deployment](https://docs.livekit.io/agents/ops/deployment/)

This starter app is compatible with any [custom web/mobile frontend](https://docs.livekit.io/agents/start/frontend/) or [SIP-based telephony](https://docs.livekit.io/agents/start/telephony/).

## RAG & Document Ingestion

Voira includes built-in support for Retrieval-Augmented Generation (RAG) using Weaviate Cloud:

- **NextJS Ingestion API**: Upload documents (`.txt`, `.md`) via `/api/ingest` endpoint
- **Tenant Isolation**: Each tenant gets their own collection (`Documents_{tenantId}`)
- **Automatic Vectorization**: Uses OpenAI `text-embedding-3-small` for embeddings
- **Agent Integration**: Voice agent can search knowledge base during conversations
- **Semantic Search**: Find relevant information using natural language queries

### Quick Start

1. Set up Weaviate Cloud and add credentials to `.env.local`:
   ```bash
   WEAVIATE_URL=https://your-cluster.weaviate.network
   WEAVIATE_API_KEY=your-api-key
   OPENAI_API_KEY=your-openai-key
   ```

2. Ingest documents via the API:
   ```bash
   curl -X POST http://localhost:3000/api/ingest \
     -H "Content-Type: application/json" \
     -d '{
       "tenantId": "my_company",
       "documents": [{"filename": "services.txt", "content": "We offer..."}]
     }'
   ```

3. The agent will automatically search the knowledge base when relevant

See [docs/ingestion_example.md](docs/ingestion_example.md) for detailed usage examples and [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for configuration details.

## Dev Setup

Clone the repository and install dependencies to a virtual environment:

```console
cd voira
uv sync
```

Sign up for [LiveKit Cloud](https://cloud.livekit.io/) then set up the environment by copying `.env.example` to `.env.local` and filling in the required keys:

- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

You can load the LiveKit environment automatically using the [LiveKit CLI](https://docs.livekit.io/home/cli/cli-setup):

```bash
lk cloud auth
lk app env -w -d .env.local
```

## Run the agent

Before your first run, you must download certain models such as [Silero VAD](https://docs.livekit.io/agents/build/turns/vad/) and the [LiveKit turn detector](https://docs.livekit.io/agents/build/turns/turn-detector/):

```console
uv run python src/agent.py download-files
```

Next, run this command to speak to your agent directly in your terminal:

```console
uv run python src/agent.py console
```

To run the agent for use with a frontend or telephony, use the `dev` command:

```console
uv run python src/agent.py dev
```

In production, use the `start` command:

```console
uv run python src/agent.py start
```

## Frontend & Telephony

Get started quickly with our pre-built frontend starter apps, or add telephony support:

| Platform | Link | Description |
|----------|----------|-------------|
| **Web** | [`livekit-examples/agent-starter-react`](https://github.com/livekit-examples/agent-starter-react) | Web voice AI assistant with React & Next.js |
| **iOS/macOS** | [`livekit-examples/agent-starter-swift`](https://github.com/livekit-examples/agent-starter-swift) | Native iOS, macOS, and visionOS voice AI assistant |
| **Flutter** | [`livekit-examples/agent-starter-flutter`](https://github.com/livekit-examples/agent-starter-flutter) | Cross-platform voice AI assistant app |
| **React Native** | [`livekit-examples/voice-assistant-react-native`](https://github.com/livekit-examples/voice-assistant-react-native) | Native mobile app with React Native & Expo |
| **Android** | [`livekit-examples/agent-starter-android`](https://github.com/livekit-examples/agent-starter-android) | Native Android app with Kotlin & Jetpack Compose |
| **Web Embed** | [`livekit-examples/agent-starter-embed`](https://github.com/livekit-examples/agent-starter-embed) | Voice AI widget for any website |
| **Telephony** | [📚 Documentation](https://docs.livekit.io/agents/start/telephony/) | Add inbound or outbound calling to your agent |

For advanced customization, see the [complete frontend guide](https://docs.livekit.io/agents/start/frontend/).

## Tests and evals

This project includes a complete suite of evals, based on the LiveKit Agents [testing & evaluation framework](https://docs.livekit.io/agents/build/testing/). To run them, use `pytest`.

```console
uv run pytest
```

## Using this template repo for your own project

Once you've started your own project based on this repo, you should:

1. **Check in your `uv.lock`**: This file is currently untracked for the template, but you should commit it to your repository for reproducible builds and proper configuration management. (The same applies to `livekit.toml`, if you run your agents in LiveKit Cloud)

2. **Remove the git tracking test**: Delete the "Check files not tracked in git" step from `.github/workflows/tests.yml` since you'll now want this file to be tracked. These are just there for development purposes in the template repo itself.

3. **Add your own repository secrets**: You must [add secrets](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-what-your-workflow-does/using-secrets-in-github-actions) for `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` so that the tests can run in CI.

## Deploying to production

### Backend Deployment (Python Agent)

The Python agent is production-ready and includes a working `Dockerfile`. To deploy it to LiveKit Cloud or another environment, see the [deploying to production](https://docs.livekit.io/agents/ops/deployment/) guide.

### Frontend Deployment (Next.js on Vercel)

The Next.js frontend can be easily deployed to Vercel:

**Quick Deploy:**

1. **Import to Vercel**: [vercel.com/new](https://vercel.com/new)
2. **Root Directory**: Set to `frontend` ⚠️
3. **Environment Variables**: Add these in Vercel dashboard:
   ```bash
   LIVEKIT_URL=wss://your-project.livekit.cloud
   LIVEKIT_API_KEY=your-api-key
   LIVEKIT_API_SECRET=your-secret
   WEAVIATE_URL=https://your-cluster.weaviate.network
   WEAVIATE_API_KEY=your-weaviate-key
   OPENAI_API_KEY=sk-your-openai-key
   ```
4. **Deploy**: Click Deploy and wait ~2 minutes

For detailed deployment instructions, troubleshooting, and best practices, see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md).

**Architecture After Deployment:**
```
Users → Vercel (Next.js Frontend)
         ├─→ LiveKit Cloud (Voice Agent Backend)
         ├─→ Weaviate Cloud (RAG/Vector DB)
         └─→ OpenAI (Embeddings)
```

## Self-hosted LiveKit

You can also self-host LiveKit instead of using LiveKit Cloud. See the [self-hosting](https://docs.livekit.io/home/self-hosting/) guide for more information. If you choose to self-host, you'll need to also use [model plugins](https://docs.livekit.io/agents/models/#plugins) instead of LiveKit Inference and will need to remove the [LiveKit Cloud noise cancellation](https://docs.livekit.io/home/cloud/noise-cancellation/) plugin.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.