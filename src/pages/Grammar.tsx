import { useState } from 'react';
import { useGrammar } from '../hooks/useContent';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../context/LanguageContext';

export default function Grammar() {
  const { progress, reviewGrammar } = useProgress();
  const { tr } = useLanguage();
  const [search, setSearch] = useState('');
  const { data: filtered, loading, error } = useGrammar({ search });

  return (
    <div className="page">
      <div className="page-header">
        <h1>{tr.grammar.title}</h1>
        <p>{tr.grammar.subtitle}</p>
      </div>

      <input
        type="text"
        className="search-input search-full"
        placeholder={tr.grammar.search}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p className="muted-text">Loading...</p>}
      {error && <p className="api-fallback-note">Offline mode — using cached data</p>}

      <div className="grammar-list">
        {filtered.map((topic) => {
          const reviewed = progress.reviewedGrammar.includes(topic.id);
          return (
            <div key={topic.id} className={`grammar-card ${reviewed ? 'reviewed' : ''}`}>
              <div className="grammar-card-header">
                <h2>{topic.title}</h2>
                <span className={`badge badge-${topic.level}`}>{tr.levels[topic.level]}</span>
                {reviewed && <span className="badge badge-done">✓ {tr.grammar.reviewed}</span>}
              </div>
              <p className="grammar-desc">{topic.description}</p>

              <div className="grammar-section">
                <h4>{tr.grammar.rules}</h4>
                <ul>
                  {topic.rules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              </div>

              <div className="grammar-section">
                <h4>{tr.grammar.examples}</h4>
                {topic.examples.map((ex, i) => (
                  <div key={i} className="grammar-example">
                    <p className="example-sentence">"{ex.sentence}"</p>
                    <p className="example-explanation">{ex.explanation}</p>
                  </div>
                ))}
              </div>

              {!reviewed && (
                <button className="btn btn-primary btn-block" onClick={() => reviewGrammar(topic.id)}>
                  {tr.grammar.markReviewed}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!loading && filtered.length === 0 && <p className="empty-state">{tr.grammar.noMatch}</p>}
    </div>
  );
}
