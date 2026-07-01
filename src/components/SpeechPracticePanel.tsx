import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import {
  scorePronunciation,
  scoreLabel,
  type PronunciationResult,
} from '../utils/pronunciationScore';
import { abortListening } from '../utils/speechRecognition';

interface SpeechPracticePanelProps {
  expectedText: string;
  stepKey: string;
  playbackFinished: boolean;
}

function TokenLine({ tokens, emptyLabel }: { tokens: PronunciationResult['expectedTokens']; emptyLabel: string }) {
  if (tokens.length === 0) {
    return <p className="speech-tokens speech-tokens--empty">{emptyLabel}</p>;
  }
  return (
    <p className="speech-tokens">
      {tokens.map((token, i) => (
        <span key={`${token.word}-${i}`} className={`speech-token speech-token--${token.status}`}>
          {token.word}
        </span>
      ))}
    </p>
  );
}

export default function SpeechPracticePanel({
  expectedText,
  stepKey,
  playbackFinished,
}: SpeechPracticePanelProps) {
  const { tr } = useLanguage();
  const sp = tr.speechPractice;
  const { isSupported, isListening, transcript, status, start, stop } = useSpeechRecognition();
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const prevStatus = useRef(status);

  useEffect(() => {
    setResult(null);
    abortListening();
    prevStatus.current = 'idle';
  }, [stepKey]);

  useEffect(() => {
    const wasActive = prevStatus.current === 'listening' || prevStatus.current === 'processing';
    if (wasActive && status === 'idle') {
      setResult(scorePronunciation(expectedText, transcript));
    }
    prevStatus.current = status;
  }, [status, transcript, expectedText]);

  if (!isSupported) {
    return (
      <div className="speech-practice speech-practice--unsupported">
        <p>{sp.unsupported}</p>
      </div>
    );
  }

  function handleMicClick() {
    if (isListening) {
      stop();
      return;
    }
    setResult(null);
    start();
  }

  function handleRetry() {
    setResult(null);
    abortListening();
  }

  const label = result ? sp.scoreLabels[scoreLabel(result.score)] : null;

  return (
    <div className={`speech-practice${playbackFinished ? ' speech-practice--ready' : ''}`}>
      <div className="speech-practice__header">
        <h3>{sp.title}</h3>
        <p>{playbackFinished ? sp.hintAfterListen : sp.hintBeforeListen}</p>
      </div>

      <div className="speech-practice__expected">
        <span className="speech-practice__label">{sp.expected}</span>
        <p>"{expectedText}"</p>
      </div>

      <button
        type="button"
        className={`speech-mic-btn${isListening ? ' speech-mic-btn--active' : ''}`}
        onClick={handleMicClick}
        aria-pressed={isListening}
      >
        <span className="speech-mic-icon" aria-hidden>{isListening ? '⏹️' : '🎤'}</span>
        <span>{isListening ? sp.stopRecording : sp.startRecording}</span>
      </button>

      {isListening && (
        <div className="speech-live">
          <span className="speech-practice__label">{sp.youSaid}</span>
          <p className="speech-live__text">
            {transcript ? `"${transcript}"` : sp.listeningForYou}
          </p>
        </div>
      )}

      {result && (
        <div className="speech-result">
          <div className={`speech-score speech-score--${scoreLabel(result.score)}`}>
            <span className="speech-score__value">{result.score}%</span>
            <span className="speech-score__label">{label}</span>
            <span className="speech-score__detail">
              {result.matchedWords}/{result.totalWords} {sp.wordsMatched}
            </span>
          </div>

          <div className="speech-diff">
            <div className="speech-diff__block">
              <span className="speech-practice__label">{sp.expected}</span>
              <TokenLine tokens={result.expectedTokens} emptyLabel="—" />
            </div>
            <div className="speech-diff__block">
              <span className="speech-practice__label">{sp.youSaid}</span>
              <TokenLine tokens={result.spokenTokens} emptyLabel={sp.noSpeechDetected} />
            </div>
          </div>

          <div className="speech-legend">
            <span className="speech-token speech-token--correct">{sp.legendCorrect}</span>
            <span className="speech-token speech-token--wrong">{sp.legendWrong}</span>
            <span className="speech-token speech-token--missing">{sp.legendMissing}</span>
            <span className="speech-token speech-token--extra">{sp.legendExtra}</span>
          </div>

          <button type="button" className="btn btn-outline btn-block" onClick={handleRetry}>
            {sp.tryAgain}
          </button>
        </div>
      )}

      {status === 'error' && (
        <p className="speech-practice__error">{sp.recognitionError}</p>
      )}
    </div>
  );
}
