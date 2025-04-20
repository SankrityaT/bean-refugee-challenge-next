from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from hume import AsyncHumeClient
from hume.tts import PostedUtterance
import asyncio
import base64
import json
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

logger.info(f"Starting Hume TTS and Emotion Detection server on port 5001")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Voice mappings for different characters
voice_mappings = {
    "Minister Santos": "ee96fb5f-ec1a-4f41-a9ba-6d119e64c8fd",
    "Dr. Chen": "5bb7de05-c8fe-426a-8fcc-ba4fc4ce9f9c",
    "Mayor Okonjo": "b89de4b1-3df6-4e4f-a054-9aed4351092d",
    "Ms. Patel": "d8ab67c6-953d-4bd8-9370-8fa53a0f1453"
}

# Emotion descriptions for TTS
emotion_descriptions = {
    "neutral": "neutral",
    "anger": "angry",
    "compassion": "compassionate",
    "frustration": "frustrated",
    "enthusiasm": "enthusiastic",
    "concern": "concerned"
}

# Map speaking rates for different emotions
speaking_rates = {
    "neutral": 1.0,
    "anger": 1.2,
    "compassion": 0.9,
    "frustration": 1.1,
    "enthusiasm": 1.15,
    "concern": 0.95
}

# Map pitch for different emotions
pitch_mapping = {
    "neutral": 0,
    "anger": 0.5,
    "compassion": -0.2,
    "frustration": 0.3,
    "enthusiasm": 0.4,
    "concern": -0.3
}

# Map intensity for different emotions
intensity_mapping = {
    "neutral": 0.5,
    "anger": 0.8,
    "compassion": 0.7,
    "frustration": 0.7,
    "enthusiasm": 0.8,
    "concern": 0.6
}

@app.route('/api/emotion', methods=['POST'])
def detect_emotion():
    start_time = time.time()
    try:
        # Get request data
        data = request.json
        text = data.get('text')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        logger.info(f"Detecting emotion for text: {text[:50]}...")
        
        # Define async function to detect emotion using Hume SDK
        async def detect_emotion_async():
            try:
                # Configure language model directly in the request
                logger.info(f"Starting language analysis job with text: {text[:50]}...")
                
                # Create a new client for each request to avoid event loop issues
                client = AsyncHumeClient(api_key=HUME_API_KEY)
                
                # Start a batch job with text input and direct model configuration
                job_id = await client.expression_measurement.batch.start_inference_job(
                    text=[text],
                    models={
                        "language": {
                            "granularity": "utterance",
                            "identify_speakers": False,
                            "sentiment": {},  # Enable sentiment analysis
                            "toxicity": {}    # Enable toxicity analysis
                        }
                    }
                )
                
                logger.info(f"Job started with ID: {job_id}")
                
                # Poll for job completion
                max_retries = 15
                retry_count = 0
                status = None
                
                while status != "COMPLETED" and retry_count < max_retries:
                    await asyncio.sleep(1)
                    
                    job_details = await client.expression_measurement.batch.get_job_details(job_id)
                    status = job_details.state.status
                    logger.info(f"Job status: {status}, retry: {retry_count+1}/{max_retries}")
                    
                    if status == "FAILED":
                        logger.error(f"Job failed: {job_details.state.failure_reason}")
                        raise Exception(f"Job failed: {job_details.state.failure_reason}")
                    
                    if status != "COMPLETED":
                        retry_count += 1
                
                if status != "COMPLETED":
                    raise Exception(f"Job did not complete after {max_retries} retries")
                
                # Get results
                logger.info(f"Fetching results for job: {job_id}")
                results = await client.expression_measurement.batch.get_job_predictions(id=job_id)
                
                logger.info(f"Got results: {results}")
                return results
                
            except Exception as e:
                logger.error(f"Error in Hume API call: {str(e)}")
                raise e
        
        # Create a new event loop for each request
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            # Run the async function in the new loop
            response_data = loop.run_until_complete(detect_emotion_async())
        finally:
            # Always close the loop when done to prevent resource leaks
            loop.close()
        
        # Process the emotion response
        emotions = []
        dominant_emotion = "neutral"
        
        # Log the raw response for debugging
        logger.info(f"Raw response: {response_data}")
        
        # Extract emotions from the response
        try:
            if response_data and len(response_data) > 0:
                # Get the first prediction
                prediction = response_data[0]
                
                # Extract language results
                language_results = prediction.results.predictions[0].models.language
                
                # Get emotions from grouped predictions
                if hasattr(language_results, 'grouped_predictions') and len(language_results.grouped_predictions) > 0:
                    emotion_predictions = language_results.grouped_predictions[0].predictions[0].emotions
                    
                    # Convert to list of dictionaries for JSON serialization
                    emotions_list = []
                    for emotion in emotion_predictions:
                        emotions_list.append({
                            'name': emotion.name,
                            'score': emotion.score
                        })
                    
                    # Sort emotions by score
                    sorted_emotions = sorted(emotions_list, key=lambda x: x['score'], reverse=True)
                    emotions = sorted_emotions
                    
                    # Use the actual top emotion name as the dominant emotion
                    if emotions:
                        logger.info(f"Top detected emotion: {emotions[0]['name']} with score {emotions[0]['score']}")
                        dominant_emotion = emotions[0]["name"]
        except Exception as e:
            logger.error(f"Error processing emotions: {str(e)}")
            # Continue with neutral emotion as fallback
        
        result = {
            "emotions": emotions,
            "dominantEmotion": dominant_emotion
        }
        
        logger.info(f"Emotion detection completed in {time.time() - start_time:.2f} seconds")
        logger.info(f"Dominant emotion: {dominant_emotion}")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in emotion detection: {str(e)}")
        logger.info(f"Failed emotion detection time: {time.time() - start_time:.2f} seconds")
        
        # Return a fallback neutral emotion
        return jsonify({
            "emotions": [],
            "dominantEmotion": "neutral",
            "error": str(e)
        }), 500

@app.route('/api/tts', methods=['POST'])
def text_to_speech():
    start_time = time.time()
    try:
        # Get request data
        data = request.json
        text = data.get('text')
        emotion = data.get('emotion', 'neutral').lower()  # Normalize to lowercase
        agent_name = data.get('agentName', 'Minister Santos')  # Match frontend parameter name
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        logger.info(f"Generating speech for {agent_name} with emotion {emotion}")
        
        # Map emotions to descriptions
        description = emotion_descriptions.get(emotion, emotion_descriptions['neutral'])
        voice_id = voice_mappings.get(agent_name, voice_mappings['Minister Santos'])
        
        logger.info(f"Using voice ID: {voice_id} for agent: {agent_name}")
        logger.info(f"Using description: {description}")
        
        # Define async function to generate speech using direct HTTP request
        async def generate_speech_direct():
            try:
                # Create a new client for each request to avoid event loop issues
                client = AsyncHumeClient(api_key=HUME_API_KEY)
                
                # Prepare the request payload - removing unsupported parameters
                payload = {
                    "utterances": [
                        {
                            "text": text,
                            "description": description,
                            "voice": {
                                "id": voice_id,
                                "provider": "HUME_AI"
                            }
                            # Removed speaking_rate, pitch, and intensity as they're not supported
                        }
                    ]
                }
                
                logger.info(f"TTS request payload: {json.dumps(payload)[:200]}...")
                
                # Make direct HTTP request to Hume API
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        "https://api.hume.ai/v0/tts",
                        headers={
                            "X-Hume-Api-Key": HUME_API_KEY,
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        json=payload
                    ) as response:
                        if response.status != 200:
                            error_text = await response.text()
                            logger.error(f"Hume TTS API error: {error_text}")
                            raise Exception(f"Hume API returned status {response.status}: {error_text}")
                        
                        # Get response content type
                        content_type = response.headers.get('Content-Type', '')
                        logger.info(f"Response content type: {content_type}")
                        
                        if 'application/json' in content_type:
                            # Parse JSON response
                            response_json = await response.json()
                            logger.info(f"TTS response keys: {list(response_json.keys()) if isinstance(response_json, dict) else 'Not a dict'}")
                            
                            # Extract audio data from response
                            if "generations" in response_json and len(response_json["generations"]) > 0:
                                audio_base64 = response_json["generations"][0]["audio"]
                                logger.info(f"Found audio in generations[0].audio")
                                return base64.b64decode(audio_base64)
                            elif "utterances" in response_json and len(response_json["utterances"]) > 0:
                                audio_base64 = response_json["utterances"][0]["audio"]
                                logger.info(f"Found audio in utterances[0].audio")
                                return base64.b64decode(audio_base64)
                            else:
                                raise Exception(f"Could not find audio data in response: {list(response_json.keys())}")
                        else:
                            # Assume binary audio data
                            audio_data = await response.read()
                            logger.info(f"Received binary audio data, size: {len(audio_data)} bytes")
                            return audio_data
                        
            except Exception as e:
                logger.error(f"Error in direct TTS API call: {str(e)}")
                raise e
        
        # Create a new event loop for each request
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            # Run the async function in the new loop
            audio_data = loop.run_until_complete(generate_speech_direct())
        finally:
            # Always close the loop when done to prevent resource leaks
            loop.close()
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(suffix='.mp3', delete=False)
        temp_file_path = temp_file.name
        temp_file.close()  # Close the file handle before writing
        
        # Write audio data to file
        with open(temp_file_path, 'wb') as f:
            f.write(audio_data)
        
        logger.info(f"TTS request completed in {time.time() - start_time:.2f} seconds")
        
        # Return audio file
        return send_file(
            temp_file_path,
            mimetype='audio/mpeg',
            as_attachment=True,
            download_name=f"{agent_name.replace(' ', '_').lower()}_{emotion}.mp3"
        )
        
    except Exception as e:
        logger.error(f"Error in TTS: {str(e)}")
        logger.info(f"Failed TTS request time: {time.time() - start_time:.2f} seconds")
        return jsonify({'error': str(e)}), 500

@app.route('/api/emotion/audio', methods=['POST'])
def detect_emotion_from_audio():
    start_time = time.time()
    try:
        # Check if file was uploaded
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        
        if audio_file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        # Save the uploaded file temporarily
        temp_audio_file = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        temp_audio_path = temp_audio_file.name
        audio_file.save(temp_audio_path)
        
        logger.info(f"Detecting emotion from audio file: {audio_file.filename}")
        
        # Define async function to detect emotion from audio using direct HTTP requests
        async def detect_audio_emotion_async():
            try:
                # Configure burst model for audio analysis
                logger.info(f"Starting audio analysis job...")
                
                # Read the file content
                with open(temp_audio_path, 'rb') as f:
                    file_content = f.read()
                
                # Use aiohttp to make a direct HTTP request to the Hume API
                async with aiohttp.ClientSession() as session:
                    # Create form data with the file
                    form_data = aiohttp.FormData()
                    form_data.add_field('file', 
                                        file_content,
                                        filename=os.path.basename(temp_audio_path),
                                        content_type='audio/wav')
                    
                    # Add the models configuration as JSON
                    form_data.add_field('json', 
                                        json.dumps({
                                            "models": {
                                                "burst": {}  # Only use burst model for audio
                                            }
                                        }))
                    
                    # Make the request to start a job
                    async with session.post(
                        'https://api.hume.ai/v0/batch/jobs',
                        headers={'X-Hume-Api-Key': HUME_API_KEY},
                        data=form_data
                    ) as response:
                        if response.status != 200:
                            error_text = await response.text()
                            logger.error(f"Hume API error: {error_text}")
                            raise Exception(f"Hume API returned status {response.status}: {error_text}")
                        
                        job_response = await response.json()
                        job_id = job_response.get('job_id')
                        
                        if not job_id:
                            raise Exception("No job_id returned from Hume API")
                        
                        logger.info(f"Audio job started with ID: {job_id}")
                        
                        # Poll for job completion
                        max_retries = 15
                        retry_count = 0
                        job_complete = False
                        
                        while not job_complete and retry_count < max_retries:
                            # Wait before checking status
                            await asyncio.sleep(1)
                            
                            # Check job status
                            status_url = f"https://api.hume.ai/v0/batch/jobs/{job_id}"
                            async with session.get(
                                status_url,
                                headers={'X-Hume-Api-Key': HUME_API_KEY}
                            ) as status_response:
                                if status_response.status != 200:
                                    error_text = await status_response.text()
                                    logger.error(f"Error checking job status: {error_text}")
                                    raise Exception(f"Error checking job status: {status_response.status}")
                                
                                status_data = await status_response.json()
                                status = status_data.get('state', {}).get('status')
                                logger.info(f"Audio job status: {status}, retry: {retry_count+1}/{max_retries}")
                                
                                if status == "COMPLETED":
                                    job_complete = True
                                    break
                                elif status == "FAILED":
                                    failure_reason = status_data.get('state', {}).get('failure_reason', 'Unknown')
                                    logger.error(f"Audio job failed: {failure_reason}")
                                    raise Exception(f"Audio job failed: {failure_reason}")
                                
                                retry_count += 1
                        
                        if not job_complete:
                            raise Exception(f"Audio job did not complete after {max_retries} retries")
                        
                        # Get results
                        predictions_url = f"https://api.hume.ai/v0/batch/jobs/{job_id}/predictions"
                        async with session.get(
                            predictions_url,
                            headers={'X-Hume-Api-Key': HUME_API_KEY}
                        ) as predictions_response:
                            if predictions_response.status != 200:
                                error_text = await predictions_response.text()
                                logger.error(f"Error getting predictions: {error_text}")
                                raise Exception(f"Error getting predictions: {predictions_response.status}")
                            
                            predictions = await predictions_response.json()
                            logger.info(f"Got audio results")
                            return predictions
                
            except Exception as e:
                logger.error(f"Error in Hume API call for audio: {str(e)}")
                raise e
            finally:
                # Clean up the temporary file
                try:
                    os.unlink(temp_audio_path)
                except Exception as e:
                    logger.error(f"Error removing temporary audio file: {str(e)}")
        
        # Run the async function
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        response_data = loop.run_until_complete(detect_audio_emotion_async())
        
        # Process the emotion response
        emotions = []
        dominant_emotion = "neutral"
        
        # Log the raw response for debugging
        logger.info(f"Raw audio response: {response_data}")
        
        # Extract emotions from the response
        try:
            if response_data:
                logger.info(f"Processing audio emotion data")
                
                # The response is already a list of dictionaries
                if isinstance(response_data, list) and len(response_data) > 0:
                    prediction = response_data[0]
                    
                    # Extract emotions from the nested structure
                    try:
                        # Navigate through the response structure
                        burst_data = prediction.get('results', {}).get('predictions', [{}])[0].get('models', {}).get('burst', {})
                        
                        if burst_data and 'grouped_predictions' in burst_data:
                            # Get the first group of predictions
                            grouped_predictions = burst_data['grouped_predictions']
                            if grouped_predictions and len(grouped_predictions) > 0:
                                # Get the first prediction in the group
                                predictions = grouped_predictions[0].get('predictions', [])
                                if predictions and len(predictions) > 0:
                                    # Get the emotions from the first prediction
                                    emotion_list = predictions[0].get('emotions', [])
                                    
                                    # Sort emotions by score
                                    sorted_emotions = sorted(emotion_list, key=lambda x: x.get('score', 0), reverse=True)
                                    emotions = sorted_emotions  # This contains all emotions
                                    
                                    # Log the emotions
                                    if emotions:
                                        logger.info(f"Found {len(emotions)} audio emotions")
                                        dominant_emotion = emotions[0].get("name", "Neutral")
                                        logger.info(f"Top detected audio emotion: {dominant_emotion} with score {emotions[0].get('score')}")
                    except Exception as e:
                        logger.error(f"Error extracting emotions from burst data: {str(e)}")
                        logger.error(f"Response structure: {prediction.keys() if isinstance(prediction, dict) else 'Not a dict'}")
        except Exception as e:
            logger.error(f"Error processing audio emotions: {str(e)}")
            # Continue with neutral emotion as fallback
        
        result = {
            "emotions": emotions,  # This will include all emotions sorted by score
            "dominantEmotion": dominant_emotion
        }
        
        logger.info(f"Audio emotion detection completed in {time.time() - start_time:.2f} seconds")
        logger.info(f"Dominant audio emotion: {dominant_emotion}")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in audio emotion detection: {str(e)}")
        logger.info(f"Failed audio emotion detection time: {time.time() - start_time:.2f} seconds")
        
        # Return a fallback neutral emotion
        return jsonify({
            "emotions": [],
            "dominantEmotion": "neutral",
            "error": str(e)
        }), 500

if __name__ == '__main__':
    # Get port from environment variable for production environments
    port = int(os.environ.get('PORT', 5001))
    # Set debug to False in production
    debug = os.environ.get('FLASK_ENV', 'production') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug)
