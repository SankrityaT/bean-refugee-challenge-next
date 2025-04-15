from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from hume import AsyncHumeClient
from hume.tts import PostedUtterance
import asyncio
import base64
import os
import tempfile
import time
import logging
import aiohttp
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv(dotenv_path=".env.local") 

# Get Hume API key
HUME_API_KEY = os.getenv('NEXT_PUBLIC_HUME_API_KEY')
if not HUME_API_KEY:
    raise ValueError("NEXT_PUBLIC_HUME_API_KEY not found in environment variables")

logger.info(f"Starting Hume TTS server on port 5001")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Hume client for TTS
hume_client = AsyncHumeClient(api_key=HUME_API_KEY)

@app.route('/api/emotion', methods=['POST'])
def detect_emotion():
    start_time = time.time()
    try:
        # Get request data
        data = request.json
        text = data.get('text')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        logger.info(f"Detecting emotion for text: {text[:20]}...")
        
        # Define async function to detect emotion using Hume API directly
        async def detect_emotion_async():
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    'https://api.hume.ai/v0/models/language',
                    headers={
                        'Content-Type': 'application/json',
                        'X-Hume-Api-Key': HUME_API_KEY
                    },
                    json={
                        'text': text
                    }
                ) as response:
                    if response.status != 200:
                        logger.error(f"Hume API error: {await response.text()}")
                        return None
                    
                    return await response.json()
        
        # Run the async function
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        response_data = loop.run_until_complete(detect_emotion_async())
        
        # Process the emotion response
        emotions = []
        dominant_emotion = "neutral"
        
        if response_data and 'emotions' in response_data:
            # Sort emotions by score
            sorted_emotions = sorted(response_data['emotions'], key=lambda x: x['score'], reverse=True)
            emotions = sorted_emotions
            
            # Map the dominant emotion to our application's emotion types
            if emotions:
                dominant_emotion = map_hume_emotion_to_app_emotion(emotions[0]["name"])
        
        result = {
            "emotions": emotions,
            "dominantEmotion": dominant_emotion
        }
        
        logger.info(f"Emotion detection completed in {time.time() - start_time:.2f} seconds")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in emotion detection: {str(e)}")
        logger.info(f"Failed emotion detection time: {time.time() - start_time:.2f} seconds")
        
        # Return a fallback neutral emotion
        return jsonify({
            "emotions": [],
            "dominantEmotion": "neutral"
        }), 500

def map_hume_emotion_to_app_emotion(hume_emotion):
    """Map Hume emotion names to our application's emotion types"""
    emotion_map = {
        'Neutral': 'neutral',
        'Admiration': 'enthusiasm',
        'Adoration': 'enthusiasm',
        'Aesthetic Appreciation': 'enthusiasm',
        'Amusement': 'enthusiasm',
        'Anger': 'anger',
        'Annoyance': 'frustration',
        'Anxiety': 'concern',
        'Awe': 'enthusiasm',
        'Awkwardness': 'concern',
        'Boredom': 'neutral',
        'Calmness': 'neutral',
        'Concentration': 'neutral',
        'Confusion': 'concern',
        'Contemplation': 'neutral',
        'Contempt': 'anger',
        'Contentment': 'neutral',
        'Craving': 'enthusiasm',
        'Determination': 'enthusiasm',
        'Disappointment': 'frustration',
        'Disgust': 'anger',
        'Distress': 'concern',
        'Doubt': 'concern',
        'Ecstasy': 'enthusiasm',
        'Embarrassment': 'concern',
        'Empathic Pain': 'compassion',
        'Enthusiasm': 'enthusiasm',
        'Entrancement': 'enthusiasm',
        'Envy': 'frustration',
        'Excitement': 'enthusiasm',
        'Fear': 'concern',
        'Guilt': 'concern',
        'Horror': 'concern',
        'Interest': 'enthusiasm',
        'Joy': 'enthusiasm',
        'Love': 'compassion',
        'Nostalgia': 'compassion',
        'Pain': 'frustration',
        'Pride': 'enthusiasm',
        'Realization': 'neutral',
        'Relief': 'neutral',
        'Romance': 'compassion',
        'Sadness': 'concern',
        'Satisfaction': 'enthusiasm',
        'Shame': 'concern',
        'Surprise (negative)': 'concern',
        'Surprise (positive)': 'enthusiasm',
        'Sympathy': 'compassion',
        'Tiredness': 'neutral',
        'Triumph': 'enthusiasm'
    }
    
    return emotion_map.get(hume_emotion, 'neutral')

@app.route('/api/tts', methods=['POST'])
def text_to_speech():
    start_time = time.time()
    try:
        # Get request data
        data = request.json
        text = data.get('text')
        emotion = data.get('emotion', 'neutral')
        agent_name = data.get('agentName', 'default')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        logger.info(f"Generating speech for {agent_name} with emotion {emotion}")
        
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
            logger.error("No generations found in TTS response")
            logger.info(f"Failed TTS request time: {time.time() - start_time:.2f} seconds")
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
        
        logger.info(f"TTS request completed in {time.time() - start_time:.2f} seconds")
        
        # Return audio file
        return send_file(
            temp_file_path,
            mimetype='audio/wav',
            as_attachment=True,
            download_name=f"{agent_name}_{emotion}.wav"
        )
        
    except Exception as e:
        logger.error(f"Error in TTS: {str(e)}")
        logger.info(f"Failed TTS request time: {time.time() - start_time:.2f} seconds")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
