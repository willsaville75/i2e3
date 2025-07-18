export function scrollToBlock(blockId: string) {
  // Find the block element
  const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
  
  if (blockElement) {
    // Scroll the block into view with smooth animation
    blockElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
    
    // Add a highlight effect
    blockElement.classList.add('highlight-block');
    
    // Remove the highlight after animation
    setTimeout(() => {
      blockElement.classList.remove('highlight-block');
    }, 2000);
  }
} 