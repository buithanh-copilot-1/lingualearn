import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAllVocabulary } from '../hooks/useContent';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../context/LanguageContext';
import { shuffle } from '../utils/shuffle';
import VocabWordDetail from '../components/VocabWordDetail';
import ListenButton from '../components/ListenButton';
import { useSpeechState } from '../hooks/useSpeech';
import type { VocabWord } from '../types';

export default function VocabularyStudy() {
  const { data: vocabulary, loading } = useAllVocabulary();
  const { progress, learnWord } = useProgress();
  const { tr } = useLanguage();

  const [sessionWords, setSessionWords] = useState<VocabWord[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionLearned, setSessionLearned] = useState(0);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const seeded = useRef(false);

  // Seed a randomly-ordered session list once, after vocabulary has loaded.
  useEffect(() => {
    if (!seeded.current && vocabulary.length > 0) {
      const unlearned = vocabulary.filter((w) => !progress.learnedWords.includes(w.id));
      setSessionWords(shuffle(unlearned));
      seeded.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vocabulary]);

  const remaining = sessionWords.filter((w) => !knownIds.has(w.id));
  const word = remaining.length > 0 ? remaining[index % remaining.length] : undefined;
  const { isSpeaking } = useSpeechState(word?.word);
  const sessionTotal = sessionWords.length;
  const sessionPct = sessionTotal > 0 ? Math.round((knownIds.size / sessionTotal) * 100) : 0;

  function handleKnow() {
    if (!word) return;
    learnWord(word.id);
    setSessionLearned((s) => s + 1);
    setKnownIds((prev) => new Set(prev).add(word.id));
    setRevealed(false);
  }

  function handleReview() {
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  if (loading) {
    return (
      <div className="page">
        <p className="muted-text">{tr.vocabulary.loading}</p>
      </div>
    );
  }

  if (seeded.current && remaining.length === 0) {
    return (
      <div className="page">
        <div className="study-complete-card">
          <span className="complete-icon">🌟</span>
          <h1>{tr.vocabulary.allLearned}</h1>
          <Link to="/vocabulary" className="btn btn-primary">{tr.vocabulary.exitStudy}</Link>
        </div>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="page">
        <p className="muted-text">{tr.vocabulary.loading}</p>
      </div>
    );
  }

  return (
    <div className="page study-page">
      <div className="study-header">
        <Link to="/vocabulary" className="back-link">← {tr.vocabulary.exitStudy}</Link>
        <span className="study-counter">
          {knownIds.size + 1}/{sessionTotal}
          {sessionLearned > 0 && ` · +${sessionLearned}`}
        </span>
      </div>

      <div className="study-progress">
        <div className="vocab-progress-bar" role="progressbar" aria-valuenow={sessionPct} aria-valuemin={0} aria-valuemax={100}>
          <div className="vocab-progress-fill" style={{ width: `${sessionPct}%` }} />
        </div>
      </div>

      {!revealed ? (
        <div className={`study-prompt-card ${isSpeaking ? 'study-prompt-playing' : ''}`}>
          <span className={`badge badge-${word.level}`}>{tr.levels[word.level]}</span>
          <h2 className={`study-prompt-word ${isSpeaking ? 'speaking-word-active' : ''}`}>{word.word}</h2>
          <p className="study-prompt-phonetic">{word.phonetic}</p>
          <ListenButton
            text={word.word}
            label={tr.vocabulary.pronounce}
            variant="large"
            className="pronounce-btn"
          />
          <p className="study-prompt-hint">{tr.vocabulary.studyPrompt}</p>
          <button
            type="button"
            className="btn btn-primary study-reveal-btn"
            onClick={() => setRevealed(true)}
          >
            {tr.vocabulary.showMeaning}
          </button>
        </div>
      ) : (
        <>
          <div className="study-detail-card">
            <VocabWordDetail word={word} enrich />
          </div>
          <div className="study-actions">
            <button type="button" className="btn btn-outline study-btn-review" onClick={handleReview}>
              {tr.vocabulary.dontKnow}
            </button>
            <button type="button" className="btn btn-primary study-btn-know" onClick={handleKnow}>
              {tr.vocabulary.know}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
