import React from 'react';
import type { ChatMessage } from '../hooks/useIndyChat';

interface IndyMessageMetadataProps {
  metadata: NonNullable<ChatMessage['metadata']>;
  onFollowUpClick: (question: string) => void;
}

export const IndyMessageMetadata: React.FC<IndyMessageMetadataProps> = () => {
  return (
    <div className="mt-3 space-y-2 text-xs">
      
      {/* Removed verbose metadata sections for cleaner chat experience */}
      
      {/* All metadata sections removed for cleanest chat experience */}
    </div>
  );
}; 