// Get references to the HTML elements
const speechForm = document.getElementById("speechForm");
const recordButton = document.getElementById("recordButton");
const audioFileInput = document.getElementById("audioFile");
const transcriptionResult = document.getElementById("transcriptionResult");

// Variables to store audio recording and processing objects
let audioContext;
let mediaRecorder;
let audioChunks = [];

// Function to handle the start of audio recording
async function startRecording() {
  try {
    // Create an AudioContext
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create a MediaStreamAudioSourceNode to record audio from the microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(stream);

    // Create an AudioWorkletNode to process the audio data
    await audioContext.audioWorklet.addModule("static/audioprocessor.js");
    const workletNode = new AudioWorkletNode(audioContext, "audio-processor");

    // Event listener for audio data
    workletNode.port.onmessage = function (event) {
      const inputData = event.data;

      // Process the audio data
      // Example: Calculate the average amplitude of the audio samples
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += Math.abs(inputData[i]);
      }
      const averageAmplitude = sum / inputData.length;

      console.log("Average Amplitude:", averageAmplitude);
    };

    // Connect the nodes
    source.connect(workletNode);
    workletNode.connect(audioContext.destination);

    // Create a MediaRecorder to capture the audio data
    mediaRecorder = new MediaRecorder(stream);

    // Event listener for recording data
    mediaRecorder.addEventListener("dataavailable", function (event) {
      audioChunks.push(event.data);
    });

    // Start recording
    mediaRecorder.start();

    console.log("Recording started");
  } catch (error) {
    console.error("Error accessing microphone:", error);
  }
}

// Function to handle the stop of audio recording
function stopRecording() {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
    console.log("Recording stopped");
  }
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    mediaRecorder = null;
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const audioUrl = URL.createObjectURL(audioBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = audioUrl;
    downloadLink.download = "recording.wav";
    downloadLink.textContent = "Download Recording";
    document.body.appendChild(downloadLink);
  }
}

// Event listener for the record button
recordButton.addEventListener("click", function (event) {
  if (audioContext) {
    stopRecording();
    recordButton.textContent = "Start Recording";
  } else {
    startRecording();
    recordButton.textContent = "Stop Recording";
  }
});

// Add an event listener to the speechForm to handle form submission
speechForm.addEventListener("submit", function (event) {
  event.preventDefault();

  // Check if audio file is uploaded or recorded
  if (audioFileInput.files.length > 0) {
    // File upload is selected
    const audioFile = audioFileInput.files[0];
    transcribeAudio(audioFile);
  } else if (audioChunks.length > 0) {
    // Recording is selected
    // Call the transcribeAudio function with the recorded audio
    transcribeAudio(audioChunks);
  } else {
    // No audio input is available
    console.log("No audio input available");
  }
});

// Function to send audio to the backend API and retrieve transcription
function transcribeAudio(audioData) {
  // Create a FormData object to send the audio data as multipart/form-data
  const formData = new FormData();
  //formData.append("audio", new Blob(audioData, { type: "audio/wav" }));
  formData.append("audio", audioData);
  // Read the audio data as a FileReader
  // const reader = new FileReader();
  // reader.onload = function (event) {
  //   const audioContents = event.target.result;
  //   console.log("Audio Contents:", audioContents); // Print the audio contents
  // };
  // reader.readAsDataURL(audioData[0]);

  // Send the audio data to the backend API endpoint using AJAX or fetch API
  fetch("http://127.0.0.1:5000/transcribe", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle the response from the backend API and display the transcribed text
      const transcribedText = data.transcribed_text;
      transcriptionResult.textContent = transcribedText;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
