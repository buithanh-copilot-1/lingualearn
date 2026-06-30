import { useState } from 'react';
import { vocabulary } from '../data/vocabulary';
import { useProgress } from '../hooks/useProgress';
import FlashCard from '../components/FlashCard';

type Level = 'all' | 'beginner' | 'intermediate' | 'advanced';

export default function Vocabulary() {
  const { progress, learnWord } = useProgress();
  const [level, setLevel] = useState<Level>('all');
  const [search, setSearch] = useState('');

  const filtered = vocabulary.filter((w) => {
    if (level !== 'all' && w.level !== level) return false;
    if (search && !w.word.toLowerCase().includes(search.toLowerCase()) &&
        !w.meaning.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Vocabulary</h1>
        <p>Flip flashcards to learn new words. Meanings shown in Vietnamese.</p>
      </div>

      <div className="filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search words..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-scroll">
          <div className="filter-group">
            {(['all', 'beginner', 'intermediate', 'advanced'] as Level[]).map((l) => (
              <button
                key={l}
                className={`filter-btn ${level === l ? 'active' : ''}`}
                onClick={() => setLevel(l)}
              >
                {l === 'all' ? 'All' : l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flashcard-grid">
        {filtered.map((word) => (
          <FlashCard
            key={word.id}
            word={word}
            learned={progress.learnedWords.includes(word.id)}
            onLearn={() => learnWord(word.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="empty-state">No words match your search.</p>
      )}
    </div>
  );
}
