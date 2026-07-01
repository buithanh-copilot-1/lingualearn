import type { VocabWord } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useVocabEnrichment } from '../hooks/useVocabEnrichment';
import { speakWord } from '../utils/speech';
import { categoryLabelVi, resolveExample, usageTip, isGenericExample } from '../utils/vocabDisplay';

interface Props {
  word: VocabWord;
  learned?: boolean;
  enrich?: boolean;
  compact?: boolean;
  onLearn?: () => void;
}

export default function VocabWordDetail({
  word,
  learned = false,
  enrich = true,
  compact = false,
  onLearn,
}: Props) {
  const { tr, locale } = useLanguage();
  const { entry, loading, error } = useVocabEnrichment(word.word, enrich);

  const exampleEn = resolveExample(word);
  const dictExample = entry?.meanings
    .flatMap((m) => m.definitions)
    .find((d) => d.example)?.example;
  const displayExample = dictExample && isGenericExample(word.example) ? dictExample : exampleEn;

  const primaryMeaning = entry?.meanings[0];
  const primaryDef = primaryMeaning?.definitions[0];
  const partOfSpeech = primaryMeaning?.partOfSpeech;
  const englishDef = primaryDef?.definition;
  const definitionVi = primaryDef?.definitionVi;
  const exampleVi = primaryDef?.exampleVi ?? entry?.meaningVi;
  const synonyms = primaryDef?.synonyms?.slice(0, 5) ?? [];
  const tip = usageTip(word, partOfSpeech);
  const phonetic = entry?.phonetic && entry.phonetic !== `/${word.word}/` ? entry.phonetic : word.phonetic;
  const categoryName = locale === 'vi' ? categoryLabelVi(word.category) : word.category;

  return (
    <div className={`vocab-detail ${compact ? 'vocab-detail-compact' : ''}`}>
      <div className="vocab-detail-header">
        <div className="vocab-detail-headline">
          <h3 className="vocab-detail-word">{word.word}</h3>
          <p className="vocab-detail-phonetic">{phonetic}</p>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          onClick={() => speakWord(word.word)}
        >
          🔊 {tr.vocabulary.pronounce}
        </button>
      </div>

      <div className="vocab-detail-tags">
        <span className={`badge badge-${word.level}`}>{tr.levels[word.level]}</span>
        <span className="vocab-detail-category">{categoryName}</span>
        {partOfSpeech && (
          <span className="vocab-detail-pos">{partOfSpeech}</span>
        )}
      </div>

      <section className="vocab-detail-section vocab-detail-section-primary">
        <h4>{tr.vocabulary.meaningVi}</h4>
        <p className="vocab-detail-meaning-vi">{word.meaning}</p>
      </section>

      {enrich && loading && (
        <p className="vocab-detail-loading muted-text">{tr.vocabulary.loadingDetail}</p>
      )}

      {enrich && !loading && englishDef && (
        <section className="vocab-detail-section">
          <h4>{tr.vocabulary.meaningEn}</h4>
          <p className="vocab-detail-meaning-en">{englishDef}</p>
          {definitionVi && definitionVi !== word.meaning && (
            <p className="vocab-detail-gloss-vi">{definitionVi}</p>
          )}
        </section>
      )}

      {enrich && !loading && error && (
        <p className="vocab-detail-fallback muted-text">{tr.vocabulary.detailFallback}</p>
      )}

      <section className="vocab-detail-section">
        <h4>{tr.vocabulary.exampleEn}</h4>
        <p className="vocab-detail-example-en">"{displayExample}"</p>
        {(exampleVi || word.meaning) && (
          <p className="vocab-detail-example-vi">
            <span className="vocab-detail-label">{tr.vocabulary.exampleVi}:</span>{' '}
            {exampleVi ?? word.meaning}
          </p>
        )}
      </section>

      {synonyms.length > 0 && (
        <section className="vocab-detail-section vocab-detail-section-inline">
          <h4>{tr.vocabulary.synonyms}</h4>
          <p>{synonyms.join(', ')}</p>
        </section>
      )}

      {tip && (
        <section className="vocab-detail-section vocab-detail-tip">
          <h4>{tr.vocabulary.usage}</h4>
          <p>{tip}</p>
        </section>
      )}

      {onLearn && (
        <div className="vocab-detail-actions">
          {!learned ? (
            <button type="button" className="btn btn-primary" onClick={onLearn}>
              {tr.vocabulary.markLearned}
            </button>
          ) : (
            <span className="badge badge-done">✓ {tr.vocabulary.learned}</span>
          )}
        </div>
      )}
    </div>
  );
}
