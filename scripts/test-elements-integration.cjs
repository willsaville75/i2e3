#!/usr/bin/env node

const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3002';
const API_ENDPOINT = '/api/indy/generate';

// Test cases
const testCases = [
  {
    name: 'Basic Hero Block',
    input: {
      userInput: 'create a hero block about AI technology',
      blockType: 'hero'
    },
    expectedElements: ['title', 'subtitle', 'button']
  },
  {
    name: 'Hero with Custom Title',
    input: {
      userInput: 'create a hero with title "Elements Integration Test" and subtitle "Testing the new elements system"',
      blockType: 'hero'
    },
    expectedElements: ['title', 'subtitle', 'button'],
    expectedContent: {
      title: 'Elements Integration Test',
      subtitle: 'Testing the new elements system'
    }
  },
  {
    name: 'Hero with Background',
    input: {
      userInput: 'create a hero about space exploration with a blue gradient background',
      blockType: 'hero'
    },
    expectedElements: ['title', 'subtitle', 'button'],
    expectedBackground: 'gradient'
  }
];

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test function
async function runTest(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  
  try {
    const response = await makeRequest(API_ENDPOINT, 'POST', testCase.input);
    
    if (response.status !== 200) {
      console.log(`❌ HTTP Error: ${response.status}`);
      return false;
    }
    
    const { data } = response;
    
    if (!data.success) {
      console.log(`❌ API Error: ${data.error || 'Unknown error'}`);
      return false;
    }
    
    const blockData = data.blockData;
    
    // Check if elements exist
    if (!blockData.elements) {
      console.log('❌ No elements found in response');
      return false;
    }
    
    // Check expected elements
    let elementsValid = true;
    for (const expectedElement of testCase.expectedElements) {
      if (!blockData.elements[expectedElement]) {
        console.log(`❌ Missing element: ${expectedElement}`);
        elementsValid = false;
      } else {
        console.log(`✅ Element found: ${expectedElement}`);
      }
    }
    
    // Check expected content
    if (testCase.expectedContent) {
      for (const [key, expectedValue] of Object.entries(testCase.expectedContent)) {
        const actualValue = blockData.elements[key]?.content;
        if (actualValue !== expectedValue) {
          console.log(`❌ Content mismatch for ${key}: expected "${expectedValue}", got "${actualValue}"`);
          elementsValid = false;
        } else {
          console.log(`✅ Content match for ${key}: "${actualValue}"`);
        }
      }
    }
    
    // Check background
    if (testCase.expectedBackground) {
      const backgroundType = blockData.background?.type;
      if (backgroundType !== testCase.expectedBackground) {
        console.log(`❌ Background type mismatch: expected "${testCase.expectedBackground}", got "${backgroundType}"`);
        elementsValid = false;
      } else {
        console.log(`✅ Background type match: ${backgroundType}`);
      }
    }
    
    // Check element structure
    const title = blockData.elements.title;
    if (title && typeof title.content === 'string' && typeof title.level === 'number') {
      console.log(`✅ Title structure valid: "${title.content}" (level ${title.level})`);
    } else {
      console.log(`❌ Title structure invalid:`, title);
      elementsValid = false;
    }
    
    const subtitle = blockData.elements.subtitle;
    if (subtitle && typeof subtitle.content === 'string') {
      console.log(`✅ Subtitle structure valid: "${subtitle.content}"`);
    } else {
      console.log(`❌ Subtitle structure invalid:`, subtitle);
      elementsValid = false;
    }
    
    if (elementsValid) {
      console.log(`✅ ${testCase.name} - PASSED`);
      return true;
    } else {
      console.log(`❌ ${testCase.name} - FAILED`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Test error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Elements Integration Tests\n');
  
  // Check if server is running by testing a known endpoint
  try {
    const healthCheck = await makeRequest('/api/indy/generate', 'POST', {
      userInput: 'health check',
      blockType: 'hero'
    });
    console.log('Health check response:', healthCheck.status);
    if (healthCheck.status !== 200) {
      console.log('❌ Server not running or not responding');
      process.exit(1);
    }
    console.log('✅ Server is running');
  } catch (error) {
    console.log('❌ Cannot connect to server:', error.message);
    console.log('Error details:', error);
    process.exit(1);
  }
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Elements integration is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the integration.');
    process.exit(1);
  }
}

// Run the tests
runAllTests().catch(console.error); 