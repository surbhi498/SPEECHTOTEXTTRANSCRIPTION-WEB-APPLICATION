// Custom AudioWorkletProcessor for audio processing
class AudioProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
      return [
        { name: 'gain', defaultValue: 1 }
      ];
    }
  
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      const output = outputs[0];
      const gain = parameters.gain;
  
      // Process the audio data
      for (let channel = 0; channel < output.length; ++channel) {
        const inputChannel = input[channel];
        const outputChannel = output[channel];
  
        // Process each sample of the input channel
        for (let i = 0; i < inputChannel.length; ++i) {
          // Apply gain to the input signal
          outputChannel[i] = inputChannel[i] * gain[0];
        }
      }
  
      return true;
    }
  }
  
  // Register the AudioProcessor class as an AudioWorklet processor
  registerProcessor('audio-processor', AudioProcessor);
  