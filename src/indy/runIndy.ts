/**
 * Client-side helper that forwards Indy chat requests to the backend API.
 *
 * We previously executed agents directly in the browser, which required the
 * OpenAI key to be exposed client-side. That is **insecure** and caused Indy
 * chat to fail because the key is only available on the server.
 *
 * This new implementation sends the user input to our Express API
 * (`/api/indy/generate`). The server will orchestrate the right agent and talk
 * to OpenAI using the secure server-side key, then return the result. This
 * keeps secrets out of the browser while re-using the existing backend logic
 * that already works for block generation tests.
 */
export interface IndyResponse {
  success?: boolean;
  blockData?: any;
  agentUsed?: string;
  userInput: string;
  error?: string;
  [key: string]: any;
}

export async function runIndyClient(userInput: string, agentType: string): Promise<IndyResponse> {
  try {
    // Basic payload understood by the /api/indy/generate route
    const payload = {
      userInput,
      blockType: agentType === 'page' ? 'page' : 'hero', // default mapping
      tokens: {},
    };

    const res = await fetch('/api/indy/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Server error (${res.status}): ${text}`);
    }

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data as IndyResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message, userInput } as IndyResponse;
  }
}

// Keep the old name for backward compatibility
export { runIndyClient as runIndy }; 