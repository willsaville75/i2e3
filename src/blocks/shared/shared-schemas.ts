/**
 * Shared schema definitions in TypeScript
 * Pure data schemas only - defaults are defined in each block
 */

import { 
  spacing, 
  gradient 
} from './tokens'

// Get token values as arrays for enum properties
const spacingValues = Object.keys(spacing).map(String)
const gradientValues = Object.keys(gradient)

// Layout Schema (JSON Schema format)
export const layoutSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Layout Settings",
  "description": "Layout and spacing configuration for blocks",
  "properties": {
    "blockSettings": {
      "type": "object",
      "title": "Block Settings",
      "description": "Overall block layout configuration",
      "properties": {
        "blockWidth": {
          "type": "boolean",
          "title": "Apply Full Width",
          "description": "When enabled, removes the block's maximum width constraint",
          "default": false
        },
        "height": {
          "type": "string",
          "title": "Block Height",
          "description": "Height of the block",
          "enum": ["auto", "screen", "half", "third", "quarter"],
          "default": "auto"
        },
        "margin": {
          "type": "object",
          "title": "Block Margin",
          "description": "Spacing around the block",
          "properties": {
            "top": {
              "type": "string",
              "title": "Top Margin",
              "enum": spacingValues,
              "default": "0"
            },
            "bottom": {
              "type": "string",
              "title": "Bottom Margin",
              "enum": spacingValues,
              "default": "0"
            }
          }
        }
      }
    },
    "contentSettings": {
      "type": "object",
      "title": "Content Settings",
      "description": "Content alignment and spacing configuration",
      "properties": {
        "contentAlignment": {
          "type": "object",
          "title": "Content Alignment",
          "description": "How content is aligned within the block",
          "properties": {
            "horizontal": {
              "type": "string",
              "title": "Horizontal Alignment",
              "enum": ["left", "center", "right"],
              "default": "center"
            },
            "vertical": {
              "type": "string",
              "title": "Vertical Alignment",
              "enum": ["top", "center", "bottom"],
              "default": "center"
            }
          }
        },
        "textAlignment": {
          "type": "string",
          "title": "Text Alignment",
          "description": "Text alignment within content",
          "enum": ["left", "center", "right", "justify"],
          "default": "center"
        },
        "contentWidth": {
          "type": "string",
          "title": "Content Width",
          "description": "Maximum width constraint for content",
          "enum": ["narrow", "wide", "full"],
          "default": "wide"
        },
        "padding": {
          "type": "object",
          "title": "Content Padding",
          "description": "Internal spacing around content",
          "properties": {
            "top": {
              "type": "string",
              "title": "Top Padding",
              "enum": spacingValues,
              "default": "lg"
            },
            "bottom": {
              "type": "string",
              "title": "Bottom Padding",
              "enum": spacingValues,
              "default": "lg"
            },
            "left": {
              "type": "string",
              "title": "Left Padding",
              "enum": spacingValues,
              "default": "md"
            },
            "right": {
              "type": "string",
              "title": "Right Padding",
              "enum": spacingValues,
              "default": "md"
            }
          }
        }
      }
    }
  }
}

// Background Schema (JSON Schema format)
export const backgroundSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Background Settings",
  "description": "Background styling options",
  "properties": {
    "type": {
      "type": "string",
      "title": "Background Type",
      "enum": ["color", "gradient", "image", "video"],
      "default": "color"
    },
    "color": {
      "type": "string",
      "title": "Background Color",
      "enum": ["blue", "red", "green", "yellow", "purple", "pink", "gray", "black", "white"],
      "default": "blue"
    },
    "colorIntensity": {
      "type": "string",
      "title": "Color Intensity",
      "enum": ["light", "medium", "dark"],
      "default": "medium"
    },
    "gradient": {
      "type": "object",
      "title": "Gradient Settings",
      "properties": {
        "direction": {
          "type": "string",
          "title": "Gradient Direction",
          "enum": gradientValues,
          "default": "toRight"
        },
        "fromColor": {
          "type": "string",
          "title": "From Color",
          "default": "#667eea"
        },
        "toColor": {
          "type": "string",
          "title": "To Color",
          "default": "#764ba2"
        }
      }
    },
    "image": {
      "type": "object",
      "title": "Image Settings",
      "properties": {
        "url": {
          "type": "string",
          "title": "Image URL"
        },
        "mobileUrl": {
          "type": "string",
          "title": "Mobile Image URL"
        },
        "position": {
          "type": "string",
          "title": "Image Position",
          "enum": ["center", "top", "bottom", "left", "right"],
          "default": "center"
        },
        "size": {
          "type": "string",
          "title": "Image Size",
          "enum": ["cover", "contain", "auto"],
          "default": "cover"
        }
      }
    },
    "video": {
      "type": "object",
      "title": "Video Settings",
      "properties": {
        "url": {
          "type": "string",
          "title": "Video URL"
        },
        "poster": {
          "type": "string",
          "title": "Poster Image URL"
        }
      }
    },
    "overlay": {
      "type": "object",
      "title": "Overlay Settings",
      "properties": {
        "enabled": {
          "type": "boolean",
          "title": "Enable Overlay",
          "default": false
        },
        "color": {
          "type": "string",
          "title": "Overlay Color",
          "default": "#000000"
        },
        "opacity": {
          "type": "number",
          "title": "Overlay Opacity",
          "minimum": 0,
          "maximum": 1,
          "default": 0.5
        },
        "blur": {
          "type": "boolean",
          "title": "Enable Blur",
          "default": false
        }
      }
    }
  }
}; 