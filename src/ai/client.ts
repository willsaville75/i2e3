// OpenAI client with environment variable loading
// Note: dotenv.config() is called in src/api/server.ts, so we don't need to call it again here

// Cache the configuration to avoid repeated environment variable access
let cachedConfig: OpenAIConfig | null = null;

// Cache the OpenAI client to avoid repeated module imports and client creation
let cachedClient: any = null;
let cachedOpenAIModule: any = null;

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  baseURL?: string;
  timeout?: number;
  models?: {
    fast: string;
    complex: string;
    default: string;
  };
}

/**
 * Gets OpenAI configuration from environment variables (with caching)
 */
export function getOpenAIConfig(): OpenAIConfig {
  const startTime = Date.now();
  console.log(`🔐 Config: Starting getOpenAIConfig (${Date.now() - startTime}ms)`);
  
  // Return cached config if available
  if (cachedConfig) {
    console.log(`⚡ Config: Using cached config (${Date.now() - startTime}ms)`);
    return cachedConfig;
  }
  
  // Detect the current environment
  const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
  const isBrowser = typeof window !== 'undefined';
  console.log(`🌍 Config: Environment detected - Node: ${isNode}, Browser: ${isBrowser} (${Date.now() - startTime}ms)`);
  
  // Prefer secure server-side environment variables, but allow Vite client-side
  // env vars (prefixed with VITE_) as a fallback when running in the browser
  // during development. NEVER expose production secrets in client bundles.

  console.log(`🔑 Config: Looking for API key (${Date.now() - startTime}ms)`);
  const apiKey = (typeof process !== 'undefined' && process.env.OPENAI_API_KEY)
    // @ts-ignore – import.meta may not exist in Node
    || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_API_KEY);
  console.log(`🔑 Config: API key ${apiKey ? 'found' : 'not found'} (${Date.now() - startTime}ms)`);
  
  if (!apiKey) {
    const environment = isNode ? 'server' : (isBrowser ? 'browser' : 'unknown');
    const errorMsg = [
      `OPENAI_API_KEY environment variable is required (running in ${environment}).`,
      '',
      'Please ensure:',
      isNode ? '1. You have a .env file in the project root' : '1. The API server is running on port 3001',
      isNode ? '2. It contains: OPENAI_API_KEY=your_actual_api_key' : '2. You are using the API endpoints, not calling OpenAI directly',
      isNode ? '3. You have restarted the API server after adding the key' : '3. For dev, add VITE_OPENAI_API_KEY to .env if needed',
      '',
      isBrowser ? 'Frontend should use API endpoints like /api/indy/generate' : 'For the frontend, use VITE_OPENAI_API_KEY in the .env file'
    ].join('\n');
    
    console.error(errorMsg);
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  
  // Helper to read env values in both Node (process.env) and Vite (import.meta.env)
  const readEnv = (key: string, viteKey?: string): string | undefined => {
    if (typeof process !== 'undefined') {
      const v = (process.env as Record<string, string | undefined>)[key];
      if (v) return v;
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined') {
      // @ts-ignore
      const v = import.meta.env?.[viteKey || key];
      if (v) return v;
    }
    return undefined;
  };

  console.log(`⚙️  Config: Building config object (${Date.now() - startTime}ms)`);
  cachedConfig = {
    apiKey,
    model: readEnv('OPENAI_MODEL', 'VITE_OPENAI_MODEL') || readEnv('OPENAI_MODEL_DEFAULT', 'VITE_OPENAI_MODEL_DEFAULT') || 'gpt-4o',
    baseURL: readEnv('OPENAI_BASE_URL', 'VITE_OPENAI_BASE_URL'),
    timeout: (() => {
      const v = readEnv('OPENAI_TIMEOUT', 'VITE_OPENAI_TIMEOUT');
      return v ? parseInt(v) : 10000; // Reduced from 30s to 10s for faster failures
    })(),
    models: {
      fast: readEnv('OPENAI_MODEL_FAST', 'VITE_OPENAI_MODEL_FAST') || 'gpt-4o',
      complex: readEnv('OPENAI_MODEL_COMPLEX', 'VITE_OPENAI_MODEL_COMPLEX') || 'gpt-4-turbo',
      default: readEnv('OPENAI_MODEL_DEFAULT', 'VITE_OPENAI_MODEL_DEFAULT') || 'gpt-4o'
    }
  };
  console.log(`✅ Config: getOpenAIConfig completed and cached (${Date.now() - startTime}ms)`);
  return cachedConfig;
}

/**
 * Checks if OpenAI is properly configured
 */
export function isOpenAIConfigured(): boolean {
  const hasServerKey = typeof process !== 'undefined' && !!process.env.OPENAI_API_KEY;
  // @ts-ignore
  const hasClientKey = typeof import.meta !== 'undefined' && !!import.meta.env?.VITE_OPENAI_API_KEY;
  return hasServerKey || hasClientKey;
}

/**
 * Creates and returns an OpenAI client instance (with caching)
 */
export async function createOpenAIClient() {
  const startTime = Date.now();
  console.log(`🔑 Client: Getting OpenAI config (${Date.now() - startTime}ms)`);
  
  // Return cached client if available
  if (cachedClient) {
    console.log(`⚡ Client: Using cached OpenAI client (${Date.now() - startTime}ms)`);
    return cachedClient;
  }
  
  const config = getOpenAIConfig();
  
  try {
    console.log(`📦 Client: Importing OpenAI module (${Date.now() - startTime}ms)`);
    let OpenAI;
    if (cachedOpenAIModule) {
      console.log(`⚡ Client: Using cached OpenAI module (${Date.now() - startTime}ms)`);
      OpenAI = cachedOpenAIModule;
    } else {
      const imported = await import('openai');
      OpenAI = imported.default;
      cachedOpenAIModule = OpenAI;
      console.log(`📦 Client: OpenAI module imported and cached (${Date.now() - startTime}ms)`);
    }
    console.log(`🏗️  Client: Creating OpenAI instance (${Date.now() - startTime}ms)`);
    
    // OPTIMIZATION: Create OpenAI client with connection pooling
    cachedClient = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      // timeout: config.timeout, // Remove this - not supported
      // OPTIMIZATION: Configure HTTP agent for better connection reuse
      httpAgent: (() => {
        // Only configure HTTP agent in Node.js environment
        if (typeof process !== 'undefined' && process.versions && process.versions.node) {
          try {
            const https = require('https');
            
            // Create HTTPS agent with aggressive connection pooling
            const httpsAgent = new https.Agent({
              keepAlive: true,
              keepAliveMsecs: 30000,    // Keep connections alive for 30s
              maxSockets: 10,           // Reduce max sockets
              maxFreeSockets: 5,        // Reduce free sockets
              timeout: 10000,           // 10s timeout
              freeSocketTimeout: 15000  // 15s free socket timeout
            });
            
            console.log('✅ OpenAI HTTP agent configured for connection pooling');
            return httpsAgent;
          } catch (error) {
            console.warn('⚠️  Could not configure HTTP agent, using defaults:', error instanceof Error ? error.message : 'Unknown error');
            return undefined;
          }
        }
        return undefined;
      })()
    });
    
    console.log(`✅ Client: OpenAI client created and cached (${Date.now() - startTime}ms)`);
    return cachedClient;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to initialize OpenAI client: ${error.message}`);
    }
    throw new Error('Failed to initialize OpenAI client. Make sure the openai package is installed.');
  }
}

/**
 * Gets the default model from configuration
 */
export function getDefaultModel(): string {
  return getOpenAIConfig().model || 'gpt-4o';
}

/**
 * Gets the appropriate model for different operation types
 */
export function getModelForOperation(operation: 'fast' | 'complex' | 'default'): string {
  const config = getOpenAIConfig();
  return config.models?.[operation] || config.model || 'gpt-4o';
}

/**
 * Gets the fast model for simple operations like block generation
 */
export function getFastModel(): string {
  return getModelForOperation('fast');
}

/**
 * Gets the complex model for advanced operations like page planning
 */
export function getComplexModel(): string {
  return getModelForOperation('complex');
} 