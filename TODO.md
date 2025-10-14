# Voira - Voice Agents with Custom knowledge and Custom Avatars
Complete platform managing voice agents for your business with your own custom knowledge and custom avatars, with the tools that you use.


## Core Features
- Voice Agents - Voice agents are the agents that you can use to interact with your customers.
- Custom Knowledge - Custom knowledge is the knowledge that you can use to train your agent.
- Custom Avatars - Custom avatars are the avatars that you can use to interact with your customers.
- Tools - Tools are the actions that the agent can perform.
- MCP Servers

## Backend
Knowledge Base 
- Website links
- Local files

Vector Store - Weaviate
- Search

Livekit
- Voice Agent
- MCP Servers

## Frontend
Implement with placeholders and simulations - Happy path

Landing page (users can choose an agent and test)
- Test Voice Agents (CTA button)
    - Calendar Agent (Inbound - Trigger from UI and converse)
    - Claims Agent (Outbound calls to user's number - Get the phone and trigger the backend)
    - Avatar Agent (Inbound - show an avatar with general info agent)

Onboard a dental practice - 
- Enter website (optional) -> scrape the content and get's it
- If no website, offer to create a website using Lovable
- Enter name (either extracted from website which can be edited)
- Knowledge Base - Upload files - Ingest it into Weaviate Backend
- Configure phone number to receive calls
- Configure outbound phone number to make calls
- Select calender (one of three) and Connect
    - Login with your Google Calendar
    - Login with Calendly
    - Login with Microsoft Outlook Calendar
- Select Email provider and Login
    - Login with Gmail 
    - Login with Outlook


- Next.js 
- React
- Tailwind CSS
- Shadcn UI
- Lucide Icons
- Framer Motion

