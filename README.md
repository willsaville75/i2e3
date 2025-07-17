# I2E - AI-First Site Builder

A TypeScript-first AI-powered website builder with Vite + React frontend and Express backend.

## Project Structure

```
i2e/
├── src/
│   ├── ai/                      # OpenAI integration and AI utilities
│   ├── api/                     # Express API server routes
│   ├── blocks/                  # Block system - schemas, components, AI metadata
│   ├── components/              # React UI components
│   ├── indy/                    # AI orchestration agents and utilities
│   ├── stores/                  # Zustand state management
│   └── test-pages/              # Test pages for development
├── scripts/                     # Development and utility scripts
├── docs/                        # Documentation
└── index.tsx                    # Main React entry point
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Add your OpenAI API key to .env
   ```

3. Start development servers:
   ```bash
   # Start frontend (Vite) on port 3000
   npm run dev
   
   # In another terminal, start backend (Express) on port 3001
   npm run dev:api
   
   # Or run both together
   npm run dev:all
   ```

## Core Components

### Frontend (Vite + React)
- **Blocks System** - Modular, AI-ready UI components with schemas
- **Indy Chat** - AI-powered interface for creating and editing blocks
- **Stores** - Zustand-based state management for blocks and chat

### Backend (Express API)
- **AI Routes** - Direct AI generation endpoints
- **Indy Routes** - Orchestrated AI workflows
- **Pages Routes** - Block registry and metadata

### AI Integration
- **Agents** - Specialized AI agents for different tasks (create, update, etc.)
- **Orchestration** - Intelligent routing of requests to appropriate agents
- **Context Preparation** - Smart context compression for efficient AI calls

## Development

The project uses:
- **TypeScript** - Full type safety across frontend and backend
- **Vite** - Fast development server with HMR
- **Express** - Modern ES modules API server
- **Tailwind CSS** - Utility-first styling via CDN
- **Zustand** - Lightweight state management
- **OpenAI** - GPT-4 for content generation

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run dev:api` - Start Express API server
- `npm run dev:all` - Start both servers concurrently
- `npm run build` - Build production frontend
- `npm run preview` - Preview production build

## API Endpoints

The I2E system provides a unified AI-powered API for intelligent content generation:

### `/api/indy/generate` - Intelligent Content Generation
- **Purpose**: AI-driven content generation with intelligent agent selection
- **Method**: POST
- **Input**: User intent, block type, current data, tokens
- **Output**: Generated block data with metadata
- **Features**: 
  - Intelligent agent selection (createAgent, updateAgent, etc.)
  - Context-aware content generation
  - Support for create, update, and replace operations
  - Optimized for conversational interfaces

**Example:**
```bash
curl -X POST http://localhost:3002/api/indy/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userInput": "create a hero about basketball",
    "blockType": "hero",
    "currentData": null,
    "tokens": {}
  }'
```

## Performance

The I2E AI site builder has been optimized for fast response times:

- **Response Time**: 3-4 seconds (down from 10+ seconds)
- **AI Processing**: ~2-3 seconds (optimal)
- **Backend Overhead**: ~100ms (minimal)
- **Network Latency**: ~500ms (acceptable)

### Key Optimizations
1. **Single AI Call**: Eliminated redundant AI calls through rule-based routing
2. **Connection Pooling**: Optimized HTTP connections to prevent TCP exhaustion
3. **Port Separation**: Clean separation between frontend (3001) and API (3002)
4. **Caching**: OpenAI client and configuration caching
5. **Monitoring**: Comprehensive timing logs for performance tracking

### Development Setup
```bash
# Terminal 1: Start API server
npx tsx watch src/api/server.ts

# Terminal 2: Start frontend
npm run dev
```

The frontend will be available at `http://localhost:3001` and will proxy API requests to the backend on port 3002.

## Architecture

The codebase follows a feature-based organization:
- Each block is self-contained with its schema, component, and AI hints
- AI agents are modular and can be composed for complex workflows
- Utilities are centralized to avoid duplication
- All imports use consistent paths from src/ 