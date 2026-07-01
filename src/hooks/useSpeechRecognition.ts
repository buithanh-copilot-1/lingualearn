import { useEffect, useState } from 'react';
import {
  speechRecognitionManager,
  type RecognitionStatus,
} from '../utils/speechRecognition';

export function useSpeechRecognition() {
  const [state, setState] = useState<{ status: RecognitionStatus; transcript: string }>(() => ({
    status: speechRecognitionManager.getStatus(),
    transcript: speechRecognitionManager.getTranscript(),
  }));

  useEffect(() => speechRecognitionManager.subscribe((status, transcript) => {
    setState({ status, transcript });
  }), []);

  return {
    status: state.status,
    transcript: state.transcript,
    isSupported: speechRecognitionManager.isSupported(),
    isListening: state.status === 'listening',
    start: speechRecognitionManager.start.bind(speechRecognitionManager),
    stop: speechRecognitionManager.stop.bind(speechRecognitionManager),
    abort: speechRecognitionManager.abort.bind(speechRecognitionManager),
  };
}
