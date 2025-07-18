/**
 * Conversation Memory Manager
 * Tracks conversation history, user preferences, and context
 */

export interface ConversationTurn {
  id: string;
  timestamp: Date;
  userInput: string;
  agentResponse: string;
  agentUsed: string;
  actionTaken?: {
    type: string;
    details: any;
  };
  confidence: number;
  blockContext?: {
    blockType: string;
    blockId?: string;
  };
}

export interface UserPreferences {
  preferredResponseStyle: 'concise' | 'detailed' | 'friendly';
  commonRequests: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  favoriteFeatures: string[];
  lastActiveBlock?: string;
}

export interface ConversationContext {
  sessionId: string;
  history: ConversationTurn[];
  userPreferences: UserPreferences;
  currentBlock?: {
    blockType: string;
    blockId?: string;
    blockData?: any;
  };
  pageContext?: {
    title?: string;
    route?: string;
    totalBlocks?: number;
  };
  lastAction?: {
    type: string;
    timestamp: Date;
    success: boolean;
    details: any;
  };
}

/**
 * In-memory conversation storage (in production, this would be Redis/database)
 */
class ConversationMemoryStore {
  private conversations: Map<string, ConversationContext> = new Map();
  private readonly MAX_HISTORY_LENGTH = 20;
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  /**
   * Get or create conversation context
   */
  getContext(sessionId: string): ConversationContext {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, {
        sessionId,
        history: [],
        userPreferences: {
          preferredResponseStyle: 'friendly',
          commonRequests: [],
          skillLevel: 'intermediate',
          favoriteFeatures: []
        }
      });
    }
    
    return this.conversations.get(sessionId)!;
  }

  /**
   * Add conversation turn to history
   */
  addTurn(sessionId: string, turn: Omit<ConversationTurn, 'id' | 'timestamp'>): void {
    const context = this.getContext(sessionId);
    
    const newTurn: ConversationTurn = {
      id: `${sessionId}-${Date.now()}`,
      timestamp: new Date(),
      ...turn
    };
    
    context.history.push(newTurn);
    
    // Keep history manageable
    if (context.history.length > this.MAX_HISTORY_LENGTH) {
      context.history = context.history.slice(-this.MAX_HISTORY_LENGTH);
    }
    
    // Update user preferences based on patterns
    this.updateUserPreferences(context, turn);
  }

  /**
   * Update current block context
   */
  updateBlockContext(sessionId: string, blockContext: ConversationContext['currentBlock']): void {
    const context = this.getContext(sessionId);
    context.currentBlock = blockContext;
    
    // Track block usage for preferences
    if (blockContext?.blockType) {
      context.userPreferences.lastActiveBlock = blockContext.blockType;
    }
  }

  /**
   * Update page context
   */
  updatePageContext(sessionId: string, pageContext: ConversationContext['pageContext']): void {
    const context = this.getContext(sessionId);
    context.pageContext = pageContext;
  }

  /**
   * Record action taken
   */
  recordAction(sessionId: string, action: ConversationContext['lastAction']): void {
    const context = this.getContext(sessionId);
    context.lastAction = action;
  }

  /**
   * Get conversation summary for AI context
   */
  getConversationSummary(sessionId: string, lastNTurns: number = 5): string {
    const context = this.getContext(sessionId);
    
    if (context.history.length === 0) {
      return "Starting fresh conversation.";
    }
    
    const recentTurns = context.history.slice(-lastNTurns);
    const summary = recentTurns.map(turn => 
      `User: ${turn.userInput}\nIndy: ${turn.agentResponse.substring(0, 100)}...`
    ).join('\n\n');
    
    return `Recent conversation:\n${summary}`;
  }

  /**
   * Get user preferences summary
   */
  getUserPreferencesSummary(sessionId: string): string {
    const context = this.getContext(sessionId);
    const prefs = context.userPreferences;
    
    const parts = [
      `Response style: ${prefs.preferredResponseStyle}`,
      `Skill level: ${prefs.skillLevel}`,
      `Last active block: ${prefs.lastActiveBlock || 'none'}`
    ];
    
    if (prefs.commonRequests.length > 0) {
      parts.push(`Common requests: ${prefs.commonRequests.slice(0, 3).join(', ')}`);
    }
    
    return parts.join('\n');
  }

  /**
   * Clean up old sessions
   */
  cleanupOldSessions(): void {
    const now = Date.now();
    
    for (const [sessionId, context] of this.conversations.entries()) {
      const lastActivity = context.history.length > 0 
        ? context.history[context.history.length - 1].timestamp.getTime()
        : 0;
        
      if (now - lastActivity > this.SESSION_TIMEOUT) {
        this.conversations.delete(sessionId);
      }
    }
  }

  /**
   * Update user preferences based on conversation patterns
   */
  private updateUserPreferences(context: ConversationContext, turn: Omit<ConversationTurn, 'id' | 'timestamp'>): void {
    const prefs = context.userPreferences;
    
    // Track common requests
    const request = turn.userInput.toLowerCase();
    if (!prefs.commonRequests.includes(request) && turn.agentUsed !== 'runIndyConversationAgent') {
      prefs.commonRequests.push(request);
      
      // Keep only top 10 common requests
      if (prefs.commonRequests.length > 10) {
        prefs.commonRequests = prefs.commonRequests.slice(-10);
      }
    }
    
    // Detect skill level based on request complexity
    if (request.includes('advanced') || request.includes('complex') || request.includes('custom')) {
      prefs.skillLevel = 'advanced';
    } else if (request.includes('help') || request.includes('how') || request.includes('what')) {
      if (prefs.skillLevel === 'advanced') {
        prefs.skillLevel = 'intermediate';
      } else if (prefs.skillLevel === 'intermediate') {
        prefs.skillLevel = 'beginner';
      }
    }
    
    // Track favorite features
    if (turn.confidence > 0.8 && turn.agentUsed !== 'runIndyConversationAgent') {
      const feature = turn.agentUsed.replace('runIndy', '').replace('Agent', '');
      if (!prefs.favoriteFeatures.includes(feature)) {
        prefs.favoriteFeatures.push(feature);
      }
    }
  }
}

// Global instance
export const conversationMemory = new ConversationMemoryStore();

// Cleanup old sessions every 10 minutes
setInterval(() => {
  conversationMemory.cleanupOldSessions();
}, 10 * 60 * 1000); 