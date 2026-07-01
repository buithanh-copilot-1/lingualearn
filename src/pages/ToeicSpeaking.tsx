import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { toeicSpeakingTasks } from '../data/toeic';
import ListenButton from '../components/ListenButton';
import {
  isRecognitionSupported,
  createRecognizer,
  scorePronunciation,
  type Recognizer,
  type PronunciationScore,
} from '../utils/recognition';

export default function ToeicSpeaking() {
  const { tr, locale } = useLanguage();
  const supported = useMemo(() => isRecognitionSupported(), []);

  const [index, setIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState<PronunciationScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognizerRef = useRef<Recognizer | null>(null);

  const task = toeicSpeakingTasks[index];

  useEffect(() => () => recognizerRef.current?.stop(), []);

  function reset() {
    setTranscript('');
    setScore(null);
    setError(null);
  }

  function handleRecord() {
    reset();
    const recognizer = createRecognizer({
      onResult: (result) => {
        setTranscript(result);
        if (task.type === 'read_aloud' && task.script) {
          setScore(scorePronunciation(task.script, result));
        }
      },
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
    reset();
    setIndex((i) => (i + 1) % toeicSpeakingTasks.length);
  }

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/toeic" className="link-more">← {tr.toeic.backToHub}</Link>
        <h1>{tr.toeic.speakingPracticeTitle}</h1>
        <p>{tr.toeic.speakingPracticeSubtitle}</p>
      </div>

      {!supported && (
        <div className="notice notice-warning">
          <strong>{tr.speaking.notSupported}</strong>
          <span>{tr.speaking.notSupportedHint}</span>
        </div>
      )}

      <div className="quiz-progress">
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${((index + 1) / toeicSpeakingTasks.length) * 100}%` }} />
        </div>
        <span>{index + 1}/{toeicSpeakingTasks.length}</span>
      </div>

      <div className={`speaking-card ${listening ? 'speaking-card-recording' : ''}`}>
        <div className="speaking-meta">
          <span className="badge badge-category">
            {task.type === 'read_aloud' ? tr.toeic.taskReadAloud : task.type === 'describe_picture' ? tr.toeic.taskDescribePicture : tr.toeic.taskOpinion}
          </span>
          <span className="toeic-speaking-time">⏱ {task.prepSeconds}s {tr.toeic.prep} · {task.speakSeconds}s {tr.toeic.speak}</span>
        </div>

        <p className="speaking-target">{locale === 'vi' ? task.promptVi : task.prompt}</p>

        {task.script && (
          <div className="toeic-script-box">
            <p className="toeic-script-text">{task.script}</p>
          </div>
        )}

        {task.imageDesc && (
          <div className="toeic-image-placeholder">
            <span className="toeic-image-icon">🖼️</span>
            <p>{task.imageDesc}</p>
            <span className="toeic-image-hint">{tr.toeic.imagePlaceholderHint}</span>
          </div>
        )}

        {listening && (
          <div className="listening-indicator" aria-live="polite">
            <span className="listening-indicator-ring" />
            <span className="listening-indicator-ring listening-indicator-ring-delay" />
            <span className="listening-indicator-dot" />
          </div>
        )}

        {error && <div className="notice notice-warning">{error}</div>}

        {score && (
          <div className="toeic-speaking-result">
            <p className="speaking-target">
              {score.words.map((w, i) => (
                <span key={i} className={w.matched ? 'word-ok' : 'word-miss'}>{w.word} </span>
              ))}
            </p>
            <p className="result-pct">{score.score}%</p>
          </div>
        )}

        {!score && transcript && (
          <div className="toeic-speaking-result">
            <p className="toeic-script-text">"{transcript}"</p>
            <p className="muted-text">{tr.toeic.wordsSpoken.replace('{count}', String(wordCount))}</p>
          </div>
        )}

        <div className="speaking-actions">
          {task.script && (
            <ListenButton text={task.script} label={tr.speaking.listen} id={`toeic-sp-${task.id}`} variant="outline" />
          )}
          <button
            type="button"
            className={`btn btn-primary record-btn ${listening ? 'record-btn-active' : ''}`}
            onClick={handleRecord}
            disabled={!supported || listening}
          >
            {listening ? tr.speaking.recording : tr.speaking.record}
          </button>
          <button type="button" className="btn btn-outline" onClick={handleNext}>
            {tr.toeic.nextTask}
          </button>
        </div>

        <p className="toeic-speaking-disclaimer">{tr.toeic.speakingDisclaimer}</p>
      </div>
    </div>
  );
}
