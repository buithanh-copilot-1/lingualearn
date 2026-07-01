import { useState } from 'react';
import type { VocabWord } from '../types';
import { useLanguage } from '../context/LanguageContext';
import ListenButton from './ListenButton';

interface Props {
  word: VocabWord;
  learned?: boolean;
  onLearn?: () => void;
}

export default function FlashCard({ word, learned, onLearn }: Props) {
  const [flipped, setFlipped] = useState(false);
  const { tr } = useLanguage();

  return (
    <div
      className={`flashcard ${flipped ? 'flipped' : ''} ${learned ? 'learned' : ''}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <span className={`badge badge-${word.level}`}>{word.level}</span>
          <h3 className="flashcard-word">{word.word}</h3>
          <p className="flashcard-phonetic">{word.phonetic}</p>
          <ListenButton
            text={word.word}
            label={tr.vocabulary.pronounce}
            className="pronounce-btn"
            stopPropagation
          />
          <p className="flashcard-hint">{tr.vocabulary.flipHint}</p>
        </div>
        <div className="flashcard-back">
          <p className="flashcard-meaning">{word.meaning}</p>
          <p className="flashcard-example">"{word.example}"</p>
          <span className="flashcard-category">{word.category}</span>
          {!learned && onLearn && (
            <button
              className="btn btn-sm btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                onLearn();
              }}
            >
              {tr.vocabulary.markLearned}
            </button>
          )}
          {learned && <span className="badge badge-done">✓ {tr.vocabulary.learned}</span>}
        </div>
      </div>
    </div>
  );
}
