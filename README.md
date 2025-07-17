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
│   ├── edit-mode/               # Edit mode provider, controls, and AI chat panel
│   ├── edit-panel/              # Properties panel and form components
│   ├── indy/                    # AI orchestration agents and utilities
│   ├── store/                   # Zustand state management
│   ├── utils/                   # Shared utility functions
│   └── services/                # Business logic services
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
   
   # Start backend (Express) on port 3002
   npm run dev:api
   
   # Or run both together
   npm run dev:all
   ```

## Core Components

### Frontend (Vite + React)
- **Blocks System** - Modular, AI-ready UI components with schemas
- **AI Chat** - AI-powered interface for creating and editing blocks
- **Stores** - Zustand-based state management for blocks and chat

### Backend (Express API)
- **AI Routes** - Direct AI generation endpoints
- **Indy Routes** - Orchestrated AI workflows
- **CMS Routes** - Database-driven content management

## Features

- AI-powered block generation and editing
- TypeScript-first architecture
- Modular block system with JSON schemas
- Real-time AI chat interface
- Database-driven CMS with Prisma
- Dynamic site routing

## Development

The project uses a dual-server setup:
- Frontend: Vite dev server (port 3000)
- Backend: Express API server (port 3002)

All AI operations are handled through the `/api/indy` endpoints with full orchestration support. 