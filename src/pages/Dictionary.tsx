import { useState, type FormEvent } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { lookupWordWithVietnamese, WordNotFoundError, type DictEntry } from '../api/dictionary';
import ListenButton from '../components/ListenButton';

type ErrorKind = 'notFound' | 'error' | null;

export default function Dictionary() {
  const { tr } = useLanguage();
  const [query, setQuery] = useState('');
  const [entry, setEntry] = useState<DictEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorKind>(null);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;
    setLoading(true);
    setError(null);
    setEntry(null);
    try {
      setEntry(await lookupWordWithVietnamese(term));
    } catch (err) {
      setError(err instanceof WordNotFoundError ? 'notFound' : 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{tr.dictionary.title}</h1>
        <p>{tr.dictionary.subtitle}</p>
      </div>

      <form className="dict-search" onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder={tr.dictionary.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '…' : tr.dictionary.searchBtn}
        </button>
      </form>

      {loading && <p className="muted-text">{tr.common.loading}</p>}
      {error === 'notFound' && <p className="empty-state">{tr.dictionary.notFound}</p>}
      {error === 'error' && <p className="api-fallback-note">{tr.dictionary.error}</p>}

      {!loading && !error && !entry && <p className="muted-text">{tr.dictionary.prompt}</p>}

      {entry && (
        <div className="dict-result">
          <div className="dict-header">
            <div>
              <h2 className="dict-word">{entry.word}</h2>
              {entry.phonetic && <span className="dict-phonetic">{entry.phonetic}</span>}
              {entry.meaningVi && (
                <p className="dict-meaning-vi">
                  <strong>{tr.dictionary.meaningVi}:</strong> {entry.meaningVi}
                </p>
              )}
            </div>
            <ListenButton
              text={entry.word}
              label={tr.dictionary.listen}
              audioUrl={entry.audio || undefined}
            />
          </div>

          {entry.meanings.map((meaning, mi) => (
            <div key={mi} className="dict-meaning">
              <h3 className="dict-pos">{meaning.partOfSpeech}</h3>
              <ol className="dict-definitions">
                {meaning.definitions.map((def, di) => (
                  <li key={di}>
                    <p>{def.definition}</p>
                    {def.definitionVi && (
                      <p className="dict-definition-vi">{def.definitionVi}</p>
                    )}
                    {def.example && (
                      <p className="dict-example">{tr.dictionary.examples}: "{def.example}"</p>
                    )}
                    {def.exampleVi && (
                      <p className="dict-example-vi">"{def.exampleVi}"</p>
                    )}
                    {def.synonyms.length > 0 && (
                      <p className="dict-synonyms">
                        {tr.dictionary.synonyms}: {def.synonyms.slice(0, 6).join(', ')}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}

          <p className="dict-credit">{tr.dictionary.poweredBy}</p>
        </div>
      )}
    </div>
  );
}
