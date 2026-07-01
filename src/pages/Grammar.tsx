import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAllGrammar, useGrammar } from '../hooks/useContent';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../context/LanguageContext';
import GrammarTopicCard from '../components/GrammarTopicCard';
import { grammarMatchesSearch } from '../utils/grammarDisplay';
import type { Level } from '../types';

type LevelFilter = 'all' | Level;

export default function Grammar() {
  const { progress, reviewGrammar } = useProgress();
  const { tr } = useLanguage();
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<LevelFilter>('all');
  const [searchParams] = useSearchParams();
  const topicParam = searchParams.get('topic');
  const [expandedId, setExpandedId] = useState<string | null>(topicParam);
  const scrolledTopic = useRef<string | null>(null);

  const { data: grammar, loading, error } = useGrammar({ search: '' });
  const { data: allGrammar } = useAllGrammar();

  const filtered = useMemo(() => {
    return grammar.filter((topic) => {
      if (level !== 'all' && topic.level !== level) return false;
      return grammarMatchesSearch(topic, search);
    });
  }, [grammar, level, search]);

  const reviewedSet = useMemo(() => new Set(progress.reviewedGrammar), [progress.reviewedGrammar]);
  const reviewedCount = allGrammar.filter((t) => reviewedSet.has(t.id)).length;
  const totalTopics = allGrammar.length;
  const progressPct = totalTopics > 0 ? Math.round((reviewedCount / totalTopics) * 100) : 0;

  useEffect(() => {
    if (!topicParam) return;
    setLevel('all');
    setSearch('');
  }, [topicParam]);

  useEffect(() => {
    if (topicParam) {
      setExpandedId(topicParam);
      return;
    }
    setExpandedId(null);
  }, [search, level, topicParam]);

  useEffect(() => {
    if (!topicParam || loading || scrolledTopic.current === topicParam) return;
    const el = document.getElementById(`grammar-topic-${topicParam}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      scrolledTopic.current = topicParam;
    }
  }, [topicParam, loading, filtered]);

  return (
    <div className="page grammar-page">
      <div className="page-header">
        <h1>{tr.grammar.title}</h1>
        <p>{tr.grammar.subtitle}</p>
      </div>

      <section className="grammar-stats" aria-label={tr.grammar.progress}>
        <div className="grammar-stat">
          <span className="grammar-stat-value">{totalTopics}</span>
          <span className="grammar-stat-label">{tr.grammar.totalTopics}</span>
        </div>
        <div className="grammar-stat">
          <span className="grammar-stat-value">{reviewedCount}</span>
          <span className="grammar-stat-label">{tr.grammar.reviewedCount}</span>
        </div>
        <div className="grammar-progress-wrap">
          <div className="vocab-progress-bar" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
            <div className="vocab-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="vocab-progress-label">{progressPct}% {tr.grammar.complete}</span>
        </div>
      </section>

      <div className="grammar-toolbar">
        <input
          type="search"
          className="search-input grammar-search"
          placeholder={tr.grammar.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-scroll">
          <div className="filter-group">
            {(['all', 'beginner', 'intermediate', 'advanced'] as LevelFilter[]).map((l) => (
              <button
                key={l}
                type="button"
                className={`filter-btn ${level === l ? 'active' : ''}`}
                onClick={() => setLevel(l)}
              >
                {l === 'all' ? tr.lessons.all : tr.levels[l]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && <p className="muted-text">{tr.grammar.loading}</p>}
      {error && <p className="api-fallback-note">{tr.grammar.offline}</p>}

      <div className="grammar-topic-list">
        {filtered.map((topic) => (
          <GrammarTopicCard
            key={topic.id}
            topic={topic}
            reviewed={reviewedSet.has(topic.id)}
            expanded={expandedId === topic.id}
            onToggle={() => setExpandedId((id) => (id === topic.id ? null : topic.id))}
            onReview={() => reviewGrammar(topic.id)}
          />
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <p className="empty-state">{tr.grammar.noMatch}</p>
      )}
    </div>
  );
}
