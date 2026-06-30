import { useState } from 'react';
import type { VocabWord } from '../types';

interface Props {
  word: VocabWord;
  learned?: boolean;
  onLearn?: () => void;
}

export default function FlashCard({ word, learned, onLearn }: Props) {
  const [flipped, setFlipped] = useState(false);

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
          <p className="flashcard-hint">Click to flip</p>
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
              Mark as Learned
            </button>
          )}
          {learned && <span className="badge badge-done">✓ Learned</span>}
        </div>
      </div>
    </div>
  );
}
