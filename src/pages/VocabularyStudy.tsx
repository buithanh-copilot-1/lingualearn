import { useState } from 'react';
import { Link } from 'react-router-dom';
import { vocabulary } from '../data/vocabulary';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../context/LanguageContext';
import { speakWord } from '../utils/speech';

export default function VocabularyStudy() {
  const { progress, learnWord } = useProgress();
  const { tr } = useLanguage();
  const unlearned = vocabulary.filter((w) => !progress.learnedWords.includes(w.id));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionLearned, setSessionLearned] = useState(0);

  const word = unlearned[index];

  function handleKnow() {
    if (word) {
      learnWord(word.id);
      setSessionLearned((s) => s + 1);
      setFlipped(false);
      if (index >= unlearned.length - 1) {
        setIndex(0);
      }
    }
  }

  function handleReview() {
    setFlipped(false);
    setIndex((i) => (i + 1) % unlearned.length);
  }

  if (unlearned.length === 0) {
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

  return (
    <div className="page study-page">
      <div className="study-header">
        <Link to="/vocabulary" className="back-link">← {tr.vocabulary.exitStudy}</Link>
        <span className="study-counter">
          {tr.vocabulary.progress}: {index + 1}/{unlearned.length}
          {sessionLearned > 0 && ` · +${sessionLearned}`}
        </span>
      </div>

      <div
        className={`study-card ${flipped ? 'flipped' : ''}`}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="study-card-inner">
          <div className="study-card-front">
            <span className={`badge badge-${word.level}`}>{word.level}</span>
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
        <div className="study-actions">
          <button className="btn btn-outline study-btn-review" onClick={handleReview}>
            {tr.vocabulary.dontKnow}
          </button>
          <button className="btn btn-primary study-btn-know" onClick={handleKnow}>
            {tr.vocabulary.know}
          </button>
        </div>
      )}
    </div>
  );
}
