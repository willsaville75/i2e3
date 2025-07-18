// Utility function to detect content type for rendering
export const getContentType = (content: string): 'html' | 'markdown' | 'text' => {
  // Check for HTML tags
  if (/<[^>]*>/.test(content)) {
    return 'html';
  }
  
  // Check for markdown syntax
  if (
    /^#{1,6}\s/.test(content) || // Headers
    /\*\*.*\*\*/.test(content) || // Bold
    /\*.*\*/.test(content) || // Italic
    /\[.*\]\(.*\)/.test(content) || // Links
    /^[-*+]\s/.test(content) || // Unordered lists
    /^\d+\.\s/.test(content) || // Ordered lists
    /```/.test(content) || // Code blocks
    /`.*`/.test(content) || // Inline code
    /^>/.test(content) // Blockquotes
  ) {
    return 'markdown';
  }
  
  return 'text';
}; 