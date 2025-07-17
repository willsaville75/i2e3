# Focused Updates Guide

## Overview

The enhanced `updateAgent()` now supports **focused updates** that intelligently extract target paths from user intents and only update specific fields. This results in:

- 🚀 Smaller AI prompts (faster responses)
- 🎯 More precise updates
- 💰 Lower token usage
- 🔧 Better control over changes

## How It Works

### 1. Target Path Extraction

When a user says "Change the button text to 'Get Started'", the system:

1. Analyzes the intent using `extractTargetFromIntent()`
2. Identifies the target path: `elements.button.text`
3. Extracts only that portion of the current block data
4. Sends a focused prompt to AI

### 2. Compressed Context

Instead of sending the entire block structure, we use `compressBlockUpdateContextForTarget()` to extract:

- Only the current value at the target path
- Only the relevant schema for that path
- AI hints remain available for context

### 3. Focused AI Response

The AI returns only the new value for the specific path:

```json
// For "elements.button.text":
"Get Started"

// For "background.color":
"purple"

// For "elements.title":
{
  "content": "New Title Here",
  "level": 1
}
```

## Supported Target Paths

### Hero Block

| User Intent Keywords | Target Path | Example |
|---------------------|-------------|---------|
| title, heading, headline | `elements.title` | "Change the title to..." |
| subtitle, tagline, description | `elements.subtitle` | "Update the subtitle..." |
| button text, cta text | `elements.button.text` | "Change button text to..." |
| button color, button style | `elements.button.variant` | "Make the button secondary" |
| button size | `elements.button.size` | "Make the button larger" |
| button link, button url | `elements.button.href` | "Link button to /pricing" |
| background color | `background.color` | "Make background purple" |
| background image | `background.image` | "Add background image" |
| text alignment | `layout.contentSettings.textAlignment` | "Center align the text" |
| padding | `layout.contentSettings.padding` | "Add more padding" |

## Full Updates vs Focused Updates

The system automatically determines when to do a full update:

- **Focused Update**: When user mentions a specific element
- **Full Update**: When user mentions multiple elements or wants overall changes

Examples:

```typescript
// Focused update (only title changes)
"Make the title more exciting"

// Full update (multiple elements)
"Update the title and button to be more engaging"

// Full update (overall change)
"Make the entire hero section more modern"
```

## Integration with IndyAction

The `runIndyAction()` function now returns additional metadata:

```typescript
{
  type: 'UPDATE_BLOCK',
  data: { /* full updated block */ },
  diff: { 
    "elements.button.text": "New Text"  // Just the change
  },
  metadata: {
    target: "elements.button.text",      // What was updated
    intent: "update",
    agentUsed: "updateAgent",
    confidence: 0.9
  }
}
```

## Benefits

### Performance
- **50-80% smaller prompts** for focused updates
- **Faster AI responses** (200 vs 400 max tokens)
- **Lower latency** for users

### Accuracy
- AI focuses on one specific task
- Less chance of unintended changes
- Preserves rest of the block exactly

### Developer Experience
- Clear diffs show exactly what changed
- Easy to implement undo/redo
- Better debugging with target paths

## Example Usage

```typescript
// User message: "Change the button color to green"
const action = await runIndyAction(
  "Change the button color to green",
  currentBlock,
  'hero'
);

// Result:
{
  type: 'UPDATE_BLOCK',
  diff: {
    "elements.button.variant": "green"
  },
  metadata: {
    target: "elements.button.variant"
  }
}
```

## Future Enhancements

1. **Multi-target Updates**: Update multiple specific fields in one request
2. **Custom Target Mappings**: Define target paths for custom block types
3. **Validation**: Ensure AI responses match expected schema for target
4. **Rollback**: Easy undo using diffs 