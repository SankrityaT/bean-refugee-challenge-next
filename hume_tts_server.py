from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from hume import AsyncHumeClient
from hume.tts import PostedUtterance
import asyncio
import base64
import os
import tempfile
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

# Get Hume API key
HUME_API_KEY = os.getenv('NEXT_PUBLIC_HUME_API_KEY')
if not HUME_API_KEY:
    raise ValueError("NEXT_PUBLIC_HUME_API_KEY not found in environment variables")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Hume client
hume_client = AsyncHumeClient(api_key=HUME_API_KEY)

@app.route('/api/tts', methods=['POST'])
def text_to_speech():
    try:
        # Get request data
        data = request.json
        text = data.get('text')
        emotion = data.get('emotion', 'neutral')
        agent_name = data.get('agentName', 'default')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        # Map emotions to descriptions
        emotion_descriptions = {
            'neutral': 'Speak in a calm, balanced tone.',
            'anger': 'Speak with controlled frustration and intensity.',
            'compassion': 'Speak with warmth and genuine care.',
            'frustration': 'Speak with a hint of exasperation and concern.',
            'enthusiasm': 'Speak with energy and positive excitement.',
            'concern': 'Speak with thoughtful worry and seriousness.'
        }
        
        description = emotion_descriptions.get(emotion, emotion_descriptions['neutral'])
        
        # Define async function to generate speech
        async def generate_speech():
            # Generate speech using Hume SDK
            response = await hume_client.tts.synthesize_json(
                utterances=[
                    PostedUtterance(
                        text=text,
                        description=description
                    )
                ]
            )
            return response
        
        # Run the async function
        # Use existing event loop if available, otherwise create a new one
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        response = loop.run_until_complete(generate_speech())
        # Don't close the loop - keep it for future requests
        
        if not hasattr(response, 'generations') or len(response.generations) == 0:
            return jsonify({'error': 'No generations found in response'}), 500
        
        # Get audio data
        audio_data = response.generations[0].audio
        generation_id = response.generations[0].generation_id
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        temp_file_path = temp_file.name
        
        # Write audio data to file
        with open(temp_file_path, 'wb') as f:
            f.write(base64.b64decode(audio_data))
        
        # Return audio file
        return send_file(
            temp_file_path,
            mimetype='audio/wav',
            as_attachment=True,
            download_name=f"{agent_name}_{emotion}.wav"
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
