#!/bin/bash

# Test Pipeline Performance Script
# Tests both CREATE and UPDATE operations with timing

API_URL="http://localhost:3001/api/indy/action"
CONTENT_TYPE="Content-Type: application/json"

echo "🔍 Testing Block Creation and Update Pipeline Performance"
echo "========================================================"

# Function to measure API call time
measure_time() {
    local start=$(date +%s%N)
    local response=$(curl -s -X POST $API_URL -H "$CONTENT_TYPE" -d "$1")
    local end=$(date +%s%N)
    local duration=$((($end - $start) / 1000000)) # Convert to milliseconds
    echo "$response" | jq '.'
    echo "⏱️  Response time: ${duration}ms"
    echo ""
}

# Test 1: Create block without specifying type (AI selection)
echo "📦 Test 1: Create block without type (AI selects)"
echo "Request: 'create a section for team members'"
echo "---"
measure_time '{
  "userInput": "create a section for team members",
  "blockId": null,
  "blockType": null,
  "blockData": null
}'

# Test 2: Create block with specific type
echo "📦 Test 2: Create block with specific type"
echo "Request: 'create a hero block with title Welcome'"
echo "---"
measure_time '{
  "userInput": "create a hero block with title Welcome",
  "blockId": null,
  "blockType": "hero",
  "blockData": null
}'

# Test 3: Update existing block
echo "📝 Test 3: Update existing block"
echo "Request: 'change the title to Our Amazing Team'"
echo "---"
# First create a block to update
BLOCK_ID="test-block-123"
CURRENT_DATA='{
  "elements": {
    "title": {
      "content": "Original Title",
      "elementType": "title"
    }
  }
}'

measure_time "{
  \"userInput\": \"change the title to Our Amazing Team\",
  \"blockId\": \"$BLOCK_ID\",
  \"blockType\": \"hero\",
  \"blockData\": $CURRENT_DATA
}"

# Test 4: Complex creation request
echo "🎨 Test 4: Complex block creation"
echo "Request: 'create a grid layout with 3 cards for product features'"
echo "---"
measure_time '{
  "userInput": "create a grid layout with 3 cards for product features",
  "blockId": null,
  "blockType": null,
  "blockData": null
}'

# Test 5: Test with minimal input
echo "🔧 Test 5: Minimal input test"
echo "Request: 'add a block'"
echo "---"
measure_time '{
  "userInput": "add a block",
  "blockId": null,
  "blockType": null,
  "blockData": null
}'

echo "✅ Performance tests complete!" 