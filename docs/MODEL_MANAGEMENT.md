# Model Management

## Performance Optimization (January 2025)

### Problem
The I2E AI site builder was experiencing severe performance issues with UI rendering taking ~10+ seconds after user input, despite OpenAI API calls being fast (~2-3 seconds).

### Root Causes Identified
1. **Double AI calls**: System was making 2 AI calls per request instead of 1
2. **TCP connection exhaustion**: Hundreds of TIME_WAIT connections causing 6-7 second delays
3. **Port conflicts**: API server and Vite dev server competing for same port
4. **Inefficient agent routing**: Complex orchestration with redundant AI-powered classification
5. **Vite proxy overhead**: Additional 2-3 seconds of proxy delay

### Solutions Implemented

#### 1. Eliminated Double AI Calls
- **Before**: Intent classification + block generation = 2 AI calls
- **After**: Simple rule-based routing + single block generation = 1 AI call
- **Code changes**: 
  - Simplified `src/api/routes/indy.ts` with rule-based agent selection
  - Removed AI-powered intent classification
  - Direct routing to `createAgent` or `updateAgent`

#### 2. Fixed TCP Connection Issues
- **Problem**: Connection pool exhaustion with hundreds of TIME_WAIT connections
- **Solution**: Implemented proper HTTP connection pooling
- **Code changes**:
  - Added `keepAlive: true` and connection limits in `src/api/server.ts`
  - Optimized OpenAI client with HTTP agent configuration in `src/ai/client.ts`
  - Added connection reuse and timeout settings

#### 3. Resolved Port Conflicts
- **Problem**: API server and Vite both trying to use port 3001
- **Solution**: Separated ports cleanly
- **Configuration**:
  - Vite dev server: port 3001 (frontend)
  - API server: port 3002 (backend)
  - Updated Vite proxy in `vite.config.ts` to point to port 3002

#### 4. Optimized Agent Orchestration
- **Before**: Complex multi-agent routing with AI-powered decisions
- **After**: AI-driven agent selection with optimized routing
- **Logic**:
  ```typescript
  // AI-driven classification instead of hard-coded rules
  const agentName = classifyIntentToAgent(userInput);
  
  // Supports multiple agent types:
  // - createAgent: For new block creation
  // - updateAgent: For existing block updates  
  // - runIndyBlockAgent: For complex block operations
  // - runIndyPageAgent: For page-level operations
  // - runIndyExecutionAgent: For execution flows
  ```

#### 5. Enhanced Caching
- **OpenAI client caching**: Prevents repeated client instantiation
- **Config caching**: Avoids repeated environment variable reads
- **Module caching**: Reduces import overhead

### Performance Results
- **Before**: 10+ seconds total response time
- **After**: 3-4 seconds total response time
- **Improvement**: 70% faster response times
- **Breakdown**:
  - OpenAI API call: ~2-3 seconds (optimal)
  - Backend processing: ~100ms (minimal overhead)
  - Network/proxy: ~500ms (acceptable)

### Monitoring
The system now includes comprehensive timing logs:
- Frontend: Request initiation to UI update
- Backend: Request validation to response sent
- AI calls: Client creation to response processing
- JSON operations: Serialization timing

### Configuration
Key settings for optimal performance:
- API server port: 3002
- Vite proxy timeout: 60 seconds
- OpenAI client: Connection pooling enabled
- HTTP keep-alive: 30 seconds
- Max concurrent connections: 10

## Current Model Configuration

### Default Models
- **Fast operations**: `gpt-4o` (1.8-3.0 seconds)
- **Complex operations**: `gpt-4-turbo` (3-5 seconds)
- **Default model**: `gpt-4o`

### Model Selection Logic
The system automatically selects the appropriate model based on:
- Operation complexity
- Response time requirements
- Token limits

### Usage Guidelines
- Use `getFastModel()` for simple block generation
- Use `getComplexModel()` for advanced reasoning
- Default model works for most use cases

### Environment Variables
Required environment variables:
```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL_FAST=gpt-4o
OPENAI_MODEL_COMPLEX=gpt-4-turbo
```

### Troubleshooting
Common issues and solutions:
1. **Slow response times**: Check for port conflicts and connection pooling
2. **API timeouts**: Verify OpenAI API key and model availability
3. **Memory issues**: Monitor connection pool size and cleanup 