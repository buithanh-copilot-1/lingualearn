import type { VocabWord } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { speakWord } from '../utils/speech';

interface Props {
  word: VocabWord;
  learned: boolean;
  expanded: boolean;
  onToggle: () => void;
  onLearn: () => void;
}

export default function VocabWordRow({ word, learned, expanded, onToggle, onLearn }: Props) {
  const { tr } = useLanguage();

  return (
    <article className={`vocab-row ${learned ? 'vocab-row-learned' : ''} ${expanded ? 'vocab-row-expanded' : ''}`}>
      <button type="button" className="vocab-row-main" onClick={onToggle} aria-expanded={expanded}>
        <div className="vocab-row-leading">
          <span className={`vocab-status ${learned ? 'vocab-status-done' : ''}`} aria-hidden>
            {learned ? '✓' : '○'}
          </span>
          <div className="vocab-row-text">
            <div className="vocab-row-title">
              <h3>{word.word}</h3>
              <span className={`badge badge-${word.level}`}>{tr.levels[word.level]}</span>
            </div>
            <p className="vocab-row-phonetic">{word.phonetic}</p>
            {!expanded && <p className="vocab-row-preview">{word.meaning}</p>}
          </div>
        </div>
        <span className="vocab-row-chevron" aria-hidden>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="vocab-row-detail">
          <p className="vocab-row-meaning">{word.meaning}</p>
          <p className="vocab-row-example">"{word.example}"</p>
          <div className="vocab-row-meta">
            <span className="vocab-row-category">{word.category}</span>
            <div className="vocab-row-actions">
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => speakWord(word.word)}
              >
                🔊 {tr.vocabulary.pronounce}
              </button>
              {!learned && (
                <button type="button" className="btn btn-sm btn-primary" onClick={onLearn}>
                  {tr.vocabulary.markLearned}
                </button>
              )}
              {learned && <span className="badge badge-done">✓ {tr.vocabulary.learned}</span>}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
