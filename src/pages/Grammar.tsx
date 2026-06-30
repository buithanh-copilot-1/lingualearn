import { Link } from 'react-router-dom';
import { grammarTopics } from '../data/grammar';
import { getExercisesForTopic } from '../data/grammarExercises';
import { useProgress } from '../context/ProgressContext';
import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';

export default function Grammar() {
  const { progress, reviewGrammar } = useProgress();
  const { tr } = useLanguage();
  const [search, setSearch] = useState('');

  const filtered = grammarTopics.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
  });

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

      <div className="grammar-list">
        {filtered.map((topic) => {
          const reviewed = progress.reviewedGrammar.includes(topic.id);
          const practiced = progress.grammarPracticePassed.includes(topic.id);
          const exerciseCount = getExercisesForTopic(topic.id).length;
          return (
            <div key={topic.id} className={`grammar-card ${reviewed ? 'reviewed' : ''}`}>
              <div className="grammar-card-header">
                <h2>{topic.title}</h2>
                <span className={`badge badge-${topic.level}`}>{tr.levels[topic.level]}</span>
                {practiced && <span className="badge badge-done">✓ {tr.grammar.practiceDone}</span>}
                {reviewed && !practiced && <span className="badge badge-done">✓ {tr.grammar.reviewed}</span>}
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

              <div className="grammar-card-actions">
                {exerciseCount > 0 && (
                  <Link to={`/grammar/${topic.id}/practice`} className="btn btn-primary">
                    {practiced ? tr.grammar.practiceAgain : tr.grammar.startPractice}
                  </Link>
                )}
                {!reviewed && (
                  <button className="btn btn-outline" onClick={() => reviewGrammar(topic.id)}>
                    {tr.grammar.markReviewed}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && <p className="empty-state">{tr.grammar.noMatch}</p>}
    </div>
  );
}
