import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { practiceSentences } from '../data/speaking';
import ListenButton from '../components/ListenButton';
import { useSpeechState } from '../hooks/useSpeech';
import {
  isRecognitionSupported,
  createRecognizer,
  scorePronunciation,
  type Recognizer,
  type PronunciationScore,
} from '../utils/recognition';
import type { Level } from '../types';

type LevelFilter = 'all' | Level;

export default function Speaking() {
  const { tr } = useLanguage();
  const supported = useMemo(() => isRecognitionSupported(), []);
  const [level, setLevel] = useState<LevelFilter>('all');
  const [index, setIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<PronunciationScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognizerRef = useRef<Recognizer | null>(null);

  const sentences = useMemo(
    () => practiceSentences.filter((s) => level === 'all' || s.level === level),
    [level],
  );
  const sentence = sentences[index % Math.max(sentences.length, 1)];
  const sentenceId = sentence ? `speaking:${sentence.id}` : '';
  const { isSpeaking: isPlayingModel } = useSpeechState(sentenceId);

  // Stop any in-flight recognition when navigating away.
  useEffect(() => () => recognizerRef.current?.stop(), []);

  function resetAttempt() {
    setResult(null);
    setError(null);
  }

  function handleRecord() {
    if (!sentence) return;
    resetAttempt();
    const recognizer = createRecognizer({
      onResult: (transcript) => setResult(scorePronunciation(sentence.text, transcript)),
      onError: (err) => {
        setError(err === 'no-speech' ? tr.speaking.tryAgain : tr.speaking.micHint);
        setListening(false);
      },
      onEnd: () => setListening(false),
    });
    if (!recognizer) return;
    recognizerRef.current = recognizer;
    setListening(true);
    recognizer.start();
  }

  function handleNext() {
    resetAttempt();
    setIndex((i) => (i + 1) % Math.max(sentences.length, 1));
  }

  function changeLevel(l: LevelFilter) {
    setLevel(l);
    setIndex(0);
    resetAttempt();
  }

  function feedbackMessage(score: number) {
    if (score >= 90) return tr.speaking.perfect;
    if (score >= 60) return tr.speaking.great;
    return tr.speaking.keepPracticing;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{tr.speaking.title}</h1>
        <p>{tr.speaking.subtitle}</p>
      </div>

      {!supported && (
        <div className="notice notice-warning">
          <strong>{tr.speaking.notSupported}</strong>
          <span>{tr.speaking.notSupportedHint}</span>
        </div>
      )}

      <div className="filter-scroll">
        <div className="filter-group">
          {(['all', 'beginner', 'intermediate', 'advanced'] as LevelFilter[]).map((l) => (
            <button
              key={l}
              className={`filter-btn ${level === l ? 'active' : ''}`}
              onClick={() => changeLevel(l)}
            >
              {l === 'all' ? tr.lessons.all : tr.levels[l]}
            </button>
          ))}
        </div>
      </div>

      {sentence && (
        <div className={`speaking-card ${listening ? 'speaking-card-recording' : ''} ${isPlayingModel ? 'speaking-card-playing' : ''}`}>
          <div className="speaking-meta">
            <span className={`badge badge-${sentence.level}`}>{tr.levels[sentence.level]}</span>
            <span className="speaking-category">{sentence.category}</span>
          </div>

          {listening && (
            <div className="listening-indicator" aria-live="polite">
              <span className="listening-indicator-ring" />
              <span className="listening-indicator-ring listening-indicator-ring-delay" />
              <span className="listening-indicator-dot" />
            </div>
          )}

          <p className={`speaking-target ${isPlayingModel ? 'speaking-target-playing' : ''}`}>
            {result
              ? result.words.map((w, i) => (
                  <span key={i} className={w.matched ? 'word-ok' : 'word-miss'}>
                    {w.word}{' '}
                  </span>
                ))
              : sentence.text}
          </p>
          <p className="speaking-translation">{sentence.translation}</p>

          <div className="speaking-actions">
            <ListenButton
              text={sentence.text}
              label={tr.speaking.listen}
              id={sentenceId}
              variant="outline"
            />
            <button
              type="button"
              className={`btn btn-primary record-btn ${listening ? 'record-btn-active' : ''}`}
              onClick={handleRecord}
              disabled={!supported || listening}
            >
              <span className="record-btn-icon" aria-hidden>
                {listening ? (
                  <span className="record-btn-pulse">
                    <span /><span /><span />
                  </span>
                ) : (
                  '🎤'
                )}
              </span>
              <span>{listening ? tr.speaking.recording : tr.speaking.record}</span>
            </button>
          </div>

          {error && <p className="api-fallback-note">{error}</p>}

          {result && (
            <div className="speaking-result">
              <div className={`accuracy-ring ${result.score >= 60 ? 'good' : 'low'}`}>
                <span className="accuracy-value">{result.score}%</span>
                <span className="accuracy-label">{tr.speaking.accuracy}</span>
              </div>
              <p className="speaking-feedback">{feedbackMessage(result.score)}</p>
              {result.transcript && (
                <p className="speaking-heard">
                  {tr.speaking.yourSpeech}: <em>"{result.transcript}"</em>
                </p>
              )}
              <button className="btn btn-sm btn-outline" onClick={handleRecord} disabled={!supported}>
                ↻ {tr.speaking.tryAgain}
              </button>
            </div>
          )}

          <div className="speaking-footer">
            <Link to="/practice" className="back-link">← {tr.review.exit}</Link>
            <button className="btn btn-sm btn-outline" onClick={handleNext}>
              {tr.speaking.next} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
