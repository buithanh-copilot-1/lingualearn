import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { vocabulary } from '../data/vocabulary';
import { useProgress } from '../context/ProgressContext';
import { useLanguage } from '../context/LanguageContext';
import { speakWord } from '../utils/speech';
import { buildStudyQueue, getDueWordIds } from '../utils/srs';
import type { StudyMode, SrsRating, VocabWord } from '../types';

export default function VocabularyStudy() {
  const { progress, rateWord } = useProgress();
  const { tr } = useLanguage();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') as StudyMode) || 'mixed';

  const [queue, setQueue] = useState<VocabWord[]>(() =>
    buildStudyQueue(progress, vocabulary, mode),
  );
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ newWords: 0, reviews: 0 });

  useEffect(() => {
    setQueue(buildStudyQueue(progress, vocabulary, mode));
    setIndex(0);
    setFlipped(false);
  }, [mode, progress.settings.dailyWordGoal, progress.dailyGoals.wordsLearned]);

  const word = queue[index];
  const dueIds = useMemo(() => new Set(getDueWordIds(progress)), [progress]);
  const isReview = word ? dueIds.has(word.id) || progress.learnedWords.includes(word.id) : false;

  function advanceQueue(rating: SrsRating) {
    if (!word) return;

    const wasNew = !progress.learnedWords.includes(word.id);
    rateWord(word.id, rating);

    setSessionStats((s) => ({
      newWords: s.newWords + (wasNew && (rating === 'good' || rating === 'easy') ? 1 : 0),
      reviews: s.reviews + (!wasNew || rating === 'again' || rating === 'hard' ? 1 : 0),
    }));

    setFlipped(false);

    if (rating === 'again') {
      setQueue((q) => [...q.slice(0, index + 1), word, ...q.slice(index + 1)]);
      return;
    }

    setQueue((q) => {
      const next = q.filter((_, i) => i !== index);
      setIndex((i) => (next.length === 0 ? 0 : Math.min(i, next.length - 1)));
      return next;
    });
  }

  if (queue.length === 0) {
    return (
      <div className="page">
        <div className="study-complete-card">
          <span className="complete-icon">🌟</span>
          <h1>{mode === 'review' ? tr.vocabulary.noReviews : tr.vocabulary.allLearned}</h1>
          <Link to="/vocabulary" className="btn btn-primary">{tr.vocabulary.exitStudy}</Link>
        </div>
      </div>
    );
  }

  const modeLabel =
    mode === 'review' ? tr.vocabulary.modeReview
    : mode === 'new' ? tr.vocabulary.modeNew
    : tr.vocabulary.modeMixed;

  return (
    <div className="page study-page">
      <div className="study-header">
        <Link to="/vocabulary" className="back-link">← {tr.vocabulary.exitStudy}</Link>
        <span className="study-counter">
          {modeLabel} · {index + 1}/{queue.length}
          {(sessionStats.newWords > 0 || sessionStats.reviews > 0) &&
            ` · +${sessionStats.newWords} / ↺${sessionStats.reviews}`}
        </span>
      </div>

      <div className="study-mode-tabs">
        {(['mixed', 'review', 'new'] as StudyMode[]).map((m) => (
          <Link
            key={m}
            to={`/vocabulary/study?mode=${m}`}
            className={`filter-btn ${mode === m ? 'active' : ''}`}
          >
            {m === 'mixed' ? tr.vocabulary.modeMixed
              : m === 'review' ? tr.vocabulary.modeReview
              : tr.vocabulary.modeNew}
          </Link>
        ))}
      </div>

      <div
        className={`study-card ${flipped ? 'flipped' : ''}`}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="study-card-inner">
          <div className="study-card-front">
            <div className="study-card-badges">
              <span className={`badge badge-${word.level}`}>{word.level}</span>
              <span className={`badge ${isReview ? 'badge-review' : 'badge-new'}`}>
                {isReview ? tr.vocabulary.reviewCard : tr.vocabulary.newCard}
              </span>
            </div>
            <h2>{word.word}</h2>
            <p className="flashcard-phonetic">{word.phonetic}</p>
            <button
              className="btn btn-sm btn-outline pronounce-btn"
              onClick={(e) => { e.stopPropagation(); speakWord(word.word); }}
            >
              🔊 {tr.vocabulary.pronounce}
            </button>
            <p className="flashcard-hint">{tr.vocabulary.flipHint}</p>
          </div>
          <div className="study-card-back">
            <p className="flashcard-meaning">{word.meaning}</p>
            <p className="flashcard-example">"{word.example}"</p>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="srs-actions">
          <button className="btn srs-btn srs-again" onClick={() => advanceQueue('again')}>
            {tr.vocabulary.srsAgain}
          </button>
          <button className="btn srs-btn srs-hard" onClick={() => advanceQueue('hard')}>
            {tr.vocabulary.srsHard}
          </button>
          <button className="btn srs-btn srs-good" onClick={() => advanceQueue('good')}>
            {tr.vocabulary.srsGood}
          </button>
          <button className="btn srs-btn srs-easy" onClick={() => advanceQueue('easy')}>
            {tr.vocabulary.srsEasy}
          </button>
        </div>
      )}
    </div>
  );
}
