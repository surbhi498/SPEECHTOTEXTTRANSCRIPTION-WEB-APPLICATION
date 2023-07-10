# import os

# # Set the path to your JSON key file
# os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/Users/surbhisharma/Documents/GooglehackathonAI/cred.json'

from flask import Flask, request, jsonify, url_for
from flask import render_template
from google.cloud import speech
app = Flask(__name__)


def perform_transcription(request, audio_file):
    # Instantiate the Speech-to-Text client
    client = speech.SpeechClient()

    # Convert the audio file to binary content
    audio_content = audio_file.read()
    # print("hello world")
    # Configure the audio and recognition settings
    audio = speech.RecognitionAudio(content=audio_content)
    config = speech.RecognitionConfig(
       # encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=24000,
        language_code="en-US",
        model="default",
        audio_channel_count=1,
        enable_word_confidence=True,
        enable_word_time_offsets=True,
    )

    # Perform speech-to-text transcription
    operation = client.long_running_recognize(config=config, audio=audio)
    response = operation.result()

    # Extract the transcribed text from the response
    transcribed_text = ""
    for result in response.results:
        transcribed_text += result.alternatives[0].transcript + " "
    print("hi")
    print(transcribed_text)
    return transcribed_text


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/')
def home():
    return "Welcome to the Speech-to-Text API"


@app.route('/favicon.ico')
def favicon():
    return "Favicon not found"


@app.route('/transcribe', methods=['POST'])
def transcribe():
    # Retrieve the recorded/uploaded speech sample from the request
    audio_file = request.files['audio']
    #print("hello world")
    #audio_contents = audio_file.read()
   # print("Audio Contents:", audio_contents)
    # Perform speech-to-text transcription using the long_running_recognize function
    transcribed_text = perform_transcription(request, audio_file)
    print(transcribed_text)
    # Return the transcribed text as a JSON response
    return jsonify({'transcribed_text': transcribed_text})


if __name__ == '__main__':
    app.run(debug=True)
