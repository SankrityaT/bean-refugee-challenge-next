# Deployment Guide for Bean Refugee Challenge App

This guide explains how to deploy this application, which consists of:
1. A Next.js frontend
2. A Python Flask server for Hume AI TTS integration

## Architecture Overview

The application uses a split deployment architecture:
- **Frontend**: Next.js app deployed on Vercel
- **Backend**: Flask server for Hume AI TTS deployed on a separate platform

## Step 1: Deploy the Flask Backend

You can deploy the Flask server to any of these platforms:
- Render
- Railway
- Heroku
- Google Cloud Run
- AWS App Runner

### Deploying to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `hume-tts-server` (or your preferred name)
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python hume_tts_server.py`
   - **Environment Variables**:
     - `NEXT_PUBLIC_HUME_API_KEY`: Your Hume AI API key
     - `FLASK_ENV`: `production`

### Deploying to Railway

1. Create a new project on Railway
2. Connect your GitHub repository
3. Configure the service:
   - **Environment Variables**:
     - `NEXT_PUBLIC_HUME_API_KEY`: Your Hume AI API key
     - `FLASK_ENV`: `production`
   - Railway will automatically detect the Python environment and use the Procfile

### Deploying to Heroku

1. Create a new app on Heroku
2. Connect your GitHub repository or use Heroku CLI to deploy
3. Add the following environment variables:
   - `NEXT_PUBLIC_HUME_API_KEY`: Your Hume AI API key
   - `FLASK_ENV`: `production`

## Step 2: Deploy the Next.js Frontend to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure the build settings:
   - **Framework Preset**: Next.js
   - **Environment Variables**:
     - `NEXT_PUBLIC_HUME_API_KEY`: Your Hume AI API key
     - `NEXT_PUBLIC_HUME_API_SERVER_URL`: The URL of your deployed Flask server (e.g., `https://hume-tts-server.onrender.com`)

## Step 3: Test the Deployment

1. Visit your deployed Vercel app
2. Test the text-to-speech functionality
3. If you encounter any issues, check the logs on both Vercel and your Flask server hosting platform

## Troubleshooting

### CORS Issues

If you encounter CORS issues, ensure your Flask server is properly configured to accept requests from your Vercel domain:

```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app, origins=["https://your-vercel-app.vercel.app", "http://localhost:3000"])
```

### API Connection Issues

If the frontend cannot connect to the Flask server:
1. Verify the `NEXT_PUBLIC_HUME_API_SERVER_URL` environment variable is set correctly
2. Check that your Flask server is running and accessible
3. Verify there are no network restrictions blocking the connection

### Environment Variables

Ensure all environment variables are properly set in both your Vercel project and Flask server deployment.
