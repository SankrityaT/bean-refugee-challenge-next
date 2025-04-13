// Simple script to test API endpoints
require('dotenv').config({ path: '.env.local' });
// Use dynamic import for node-fetch (ESM module)
let fetch;

// Helper function to initialize fetch
async function init() {
  const { default: nodeFetch } = await import('node-fetch');
  fetch = nodeFetch;
}

async function testGroqAPI() {
  console.log('Testing Groq API...');
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: 'Say hello'
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    console.log('Groq API Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing Groq API:', error.message);
  }
}

async function testHumeAPI() {
  console.log('\nTesting Hume AI TTS API...');
  try {
    const response = await fetch('https://api.hume.ai/v0/tts/synthesize-file', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HUME_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        utterances: [
          {
            text: 'Hello, this is a test of the Hume AI text-to-speech API.',
            description: 'Speak in a friendly, conversational tone.',
            voice: {
              name: 'hume_ai_male_1', // Example voice name
              provider: 'HUME_AI'
            }
          }
        ],
        output_format: {
          type: 'mp3'
        }
      })
    });

    if (response.ok) {
      console.log('Hume API Response: Success! Status:', response.status);
      console.log('Response headers:', response.headers.raw());
    } else {
      const errorText = await response.text();
      console.error('Hume API Error:', response.status, errorText);
    }
  } catch (error) {
    console.error('Error testing Hume API:', error.message);
  }
}

// Run tests
async function runTests() {
  await init(); // Initialize fetch first
  await testGroqAPI();
  await testHumeAPI();
}

runTests();

