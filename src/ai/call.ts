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
  const { 
    prompt, 
    model = getDefaultModel(), 
    maxTokens = 1000, 
    temperature = 0.7,
    systemMessage = 'You are an expert web developer creating structured block configurations for a website builder.'
  } = input;
  
  // Check if OpenAI is configured
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
      temperature,
      stream: false
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content received from OpenAI');
    }
    
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