// AI call wrapper
import { createOpenAIClient, getDefaultModel, isOpenAIConfigured } from './client';

export interface CallAIInput {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemMessage?: string;
}

export interface CallAIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

/**
 * Main function to call OpenAI API
 */
export async function callAI(input: CallAIInput): Promise<string> {
  const startTime = Date.now();
  console.log(`🚀 AI Call: Starting with model ${input.model || getDefaultModel()} (${Date.now() - startTime}ms)`);
  
  const { 
    prompt, 
    model = getDefaultModel(), 
    maxTokens = 1000, 
    temperature = 0.7,
    systemMessage = 'You are an expert web developer creating structured block configurations for a website builder.'
  } = input;
  
  console.log(`⚙️  AI Call: Config parsed (${Date.now() - startTime}ms)`);
  
  // Check if OpenAI is configured
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI is not configured. Please set OPENAI_API_KEY environment variable.');
  }
  
  console.log(`✅ AI Call: OpenAI configured (${Date.now() - startTime}ms)`);
  
  try {
    console.log(`🔧 AI Call: Creating OpenAI client (${Date.now() - startTime}ms)`);
    const client = await createOpenAIClient();
    console.log(`📡 AI Call: Client created, making API request (${Date.now() - startTime}ms)`);
    console.log(`📝 AI Call: Prompt length: ${prompt.length} chars, Model: ${model}, MaxTokens: ${maxTokens}`);
    
    const apiStartTime = Date.now();
    console.log(`🌐 AI Call: Making actual HTTP request to OpenAI (${Date.now() - startTime}ms)`);
    
    // OPTIMIZATION: Add request timeout and streaming options
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature,
      // OPTIMIZATION: Add streaming for faster response
      stream: false // Keep false for now but add timeout
      // Note: timeout is handled at the HTTP agent level, not here
    });
    
    console.log(`🎯 AI Call: OpenAI HTTP response received in ${Date.now() - apiStartTime}ms (${Date.now() - startTime}ms total)`);
    
    console.log(`🔍 AI Call: Extracting content from response (${Date.now() - startTime}ms)`);
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content received from OpenAI');
    }
    
    console.log(`📏 AI Call: Response content length: ${content.length} chars (${Date.now() - startTime}ms)`);
    console.log(`✅ AI Call: Complete success (${Date.now() - startTime}ms total)`);
    return content;
    
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific OpenAI errors
      if (error.message.includes('rate limit')) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      }
      if (error.message.includes('insufficient_quota')) {
        throw new Error('OpenAI API quota exceeded. Please check your billing.');
      }
      if (error.message.includes('invalid_api_key')) {
        throw new Error('Invalid OpenAI API key. Please check your configuration.');
      }
      throw error;
    }
    
    throw new Error('Unknown error occurred during AI call');
  }
}

/**
 * Enhanced function that returns detailed response information
 */
export async function callAIDetailed(input: CallAIInput): Promise<CallAIResponse> {
  const { 
    prompt, 
    model = getDefaultModel(), 
    maxTokens = 1000, 
    temperature = 0.7,
    systemMessage = 'You are an expert web developer creating structured block configurations for a website builder.'
  } = input;
  
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI is not configured. Please set OPENAI_API_KEY environment variable.');
  }
  
  try {
    const client = await createOpenAIClient();
    
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content received from OpenAI');
    }
    
    return {
      content,
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      } : undefined,
      model: response.model
    };
    
  } catch (error) {
    throw error;
  }
} 