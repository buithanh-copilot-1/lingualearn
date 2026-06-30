import { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { idioms } from '../data/idioms';
import { speakWord } from '../utils/speech';
import type { IdiomType } from '../types';

type TypeFilter = 'all' | IdiomType;

export default function Idioms() {
  const { tr } = useLanguage();
  const [type, setType] = useState<TypeFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return idioms.filter((item) => {
      if (type !== 'all' && item.type !== type) return false;
      if (!q) return true;
      return (
        item.phrase.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.meaningEn.toLowerCase().includes(q)
      );
    });
  }, [type, search]);

  const typeFilters: { key: TypeFilter; label: string }[] = [
    { key: 'all', label: tr.idioms.all },
    { key: 'idiom', label: tr.idioms.idiom },
    { key: 'phrasal', label: tr.idioms.phrasal },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>{tr.idioms.title}</h1>
        <p>{tr.idioms.subtitle}</p>
      </div>

      <div className="filters">
        <input
          type="text"
          className="search-input"
          placeholder={tr.idioms.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-scroll">
          <div className="filter-group">
            {typeFilters.map((f) => (
              <button
                key={f.key}
                className={`filter-btn ${type === f.key ? 'active' : ''}`}
                onClick={() => setType(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="idiom-list">
        {filtered.map((item) => (
          <div key={item.id} className="idiom-card">
            <div className="idiom-card-header">
              <h2 className="idiom-phrase">{item.phrase}</h2>
              <div className="idiom-tags">
                <span className={`badge badge-${item.level}`}>{tr.levels[item.level]}</span>
                <span className="badge badge-type">
                  {item.type === 'idiom' ? tr.idioms.idiom : tr.idioms.phrasal}
                </span>
                <button
                  className="icon-btn"
                  aria-label={tr.idioms.listen}
                  onClick={() => speakWord(item.phrase)}
                >
                  🔊
                </button>
              </div>
            </div>
            <p className="idiom-meaning"><strong>{tr.idioms.meaning}:</strong> {item.meaning}</p>
            <p className="idiom-gloss">{item.meaningEn}</p>
            <p className="idiom-example"><strong>{tr.idioms.example}:</strong> "{item.example}"</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <p className="empty-state">{tr.idioms.noMatch}</p>}
    </div>
  );
}
