import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAllVocabulary } from '../hooks/useContent';
import { useSrs } from '../hooks/useSrs';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../context/LanguageContext';
import { speakWord } from '../utils/speech';
import type { SrsGrade, VocabWord } from '../types';

export default function Review() {
  const { data: vocabulary, loading } = useAllVocabulary();
  const { grade, buildQueue, counts } = useSrs();
  const { learnWord } = useProgress();
  const { tr } = useLanguage();

  const [queue, setQueue] = useState<VocabWord[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const seeded = useRef(false);

  // Seed the session queue once, after vocabulary has loaded.
  useEffect(() => {
    if (!seeded.current && vocabulary.length > 0) {
      setQueue(buildQueue(vocabulary));
      seeded.current = true;
    }
  }, [vocabulary, buildQueue]);

  const card = queue[0];
  const { stats } = counts(vocabulary);

  function handleGrade(g: SrsGrade) {
    if (!card) return;
    grade(card.id, g);
    setReviewed((n) => n + 1);
    setFlipped(false);

    setQueue((prev) => {
      const [first, ...rest] = prev;
      // "Again" re-queues the card later in the same session.
      return g === 'again' ? [...rest, first] : rest;
    });

    // Promote to "learned" in overall progress on a successful recall.
    if (g !== 'again') learnWord(card.id);
  }

  if (loading) {
    return (
      <div className="page">
        <p className="muted-text">{tr.common.loading}</p>
      </div>
    );
  }

  // Session finished (queue drained) — but only after we actually seeded it.
  if (seeded.current && queue.length === 0) {
    const done = reviewed > 0;
    return (
      <div className="page">
        <div className="study-complete-card">
          <span className="complete-icon">{done ? '🎉' : '☕'}</span>
          <h1>{done ? tr.review.sessionDone : tr.review.empty}</h1>
          {done ? (
            <p className="muted-text">{tr.review.reviewedCount}: {reviewed}</p>
          ) : (
            <p className="muted-text">{tr.review.emptyHint}</p>
          )}
          <div className="review-stats">
            <span className="review-stat"><strong>{stats.due}</strong> {tr.review.due}</span>
            <span className="review-stat"><strong>{stats.learning}</strong> {tr.review.learning}</span>
            <span className="review-stat"><strong>{stats.mature}</strong> {tr.review.mature}</span>
          </div>
          <Link to="/practice" className="btn btn-primary">{tr.review.exit}</Link>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="page">
        <p className="muted-text">{tr.common.loading}</p>
      </div>
    );
  }

  return (
    <div className="page study-page">
      <div className="study-header">
        <Link to="/practice" className="back-link">← {tr.review.exit}</Link>
        <span className="study-counter">
          {tr.review.remaining}: {queue.length}
          {reviewed > 0 && ` · +${reviewed}`}
        </span>
      </div>

      <div className={`study-card ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
        <div className="study-card-inner">
          <div className="study-card-front">
            <span className={`badge badge-${card.level}`}>{tr.levels[card.level]}</span>
            <h2>{card.word}</h2>
            <p className="flashcard-phonetic">{card.phonetic}</p>
            <button
              className="btn btn-sm btn-outline pronounce-btn"
              onClick={(e) => { e.stopPropagation(); speakWord(card.word); }}
            >
              🔊 {tr.vocabulary.pronounce}
            </button>
            <p className="flashcard-hint">{tr.vocabulary.flipHint}</p>
          </div>
          <div className="study-card-back">
            <p className="flashcard-meaning">{card.meaning}</p>
            <p className="flashcard-example">"{card.example}"</p>
          </div>
        </div>
      </div>

      {flipped ? (
        <div className="review-grades">
          <button className="btn review-grade grade-again" onClick={() => handleGrade('again')}>
            {tr.review.again}
          </button>
          <button className="btn review-grade grade-hard" onClick={() => handleGrade('hard')}>
            {tr.review.hard}
          </button>
          <button className="btn review-grade grade-good" onClick={() => handleGrade('good')}>
            {tr.review.good}
          </button>
          <button className="btn review-grade grade-easy" onClick={() => handleGrade('easy')}>
            {tr.review.easy}
          </button>
        </div>
      ) : (
        <div className="study-actions">
          <button className="btn btn-primary btn-block" onClick={() => setFlipped(true)}>
            {tr.review.showAnswer}
          </button>
        </div>
      )}
    </div>
  );
}
