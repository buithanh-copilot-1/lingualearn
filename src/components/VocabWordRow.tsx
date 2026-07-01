import type { VocabWord } from '../types';
import { useLanguage } from '../context/LanguageContext';
import VocabWordDetail from './VocabWordDetail';

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
            {!expanded && (
              <p className="vocab-row-preview">
                <span className="vocab-row-preview-label">{tr.vocabulary.meaningVi}:</span> {word.meaning}
              </p>
            )}
          </div>
        </div>
        <span className="vocab-row-chevron" aria-hidden>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="vocab-row-detail">
          <VocabWordDetail
            word={word}
            learned={learned}
            enrich
            compact
            onLearn={onLearn}
          />
        </div>
      )}
    </article>
  );
}
