import { Link } from 'react-router-dom';
import { lessons } from '../data/lessons';
import { vocabulary } from '../data/vocabulary';
import { quizzes } from '../data/quizzes';
import { useProgress } from '../hooks/useProgress';
import ProgressBar from '../components/ProgressBar';

export default function Home() {
  const { progress } = useProgress();

  const stats = [
    { label: 'Lessons', value: progress.completedLessons.length, total: lessons.length, icon: '📚' },
    { label: 'Words', value: progress.learnedWords.length, total: vocabulary.length, icon: '📝' },
    { label: 'Quizzes', value: progress.quizScores.length, total: quizzes.length, icon: '🎯' },
    { label: 'Streak', value: progress.streak, total: null, icon: '🔥' },
  ];

  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Master English with <span className="highlight">LinguaLearn</span></h1>
          <p className="hero-subtitle">
            Interactive lessons, vocabulary flashcards, grammar guides, and quizzes —
            designed for Vietnamese learners.
          </p>
          <div className="hero-actions">
            <Link to="/lessons" className="btn btn-primary btn-lg">Start Learning</Link>
            <Link to="/quiz" className="btn btn-outline btn-lg">Take a Quiz</Link>
          </div>
        </div>
        <div className="hero-stats">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <span className="stat-icon">{s.icon}</span>
              <span className="stat-value">
                {s.total !== null ? `${s.value}/${s.total}` : s.value}
              </span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Your Progress</h2>
        <div className="progress-grid">
          <ProgressBar
            label="Lessons Completed"
            value={progress.completedLessons.length}
            max={lessons.length}
          />
          <ProgressBar
            label="Vocabulary Learned"
            value={progress.learnedWords.length}
            max={vocabulary.length}
          />
          <ProgressBar
            label="Quizzes Taken"
            value={progress.quizScores.length}
            max={quizzes.length}
          />
        </div>
      </section>

      <section className="section">
        <h2>What You'll Learn</h2>
        <div className="feature-grid">
          <Link to="/lessons" className="feature-card">
            <span className="feature-icon">💬</span>
            <h3>Conversation</h3>
            <p>Real-world phrases for travel, dining, business, and daily life.</p>
          </Link>
          <Link to="/vocabulary" className="feature-card">
            <span className="feature-icon">📖</span>
            <h3>Vocabulary</h3>
            <p>Flashcards with pronunciation, meanings in Vietnamese, and examples.</p>
          </Link>
          <Link to="/grammar" className="feature-card">
            <span className="feature-icon">📝</span>
            <h3>Grammar</h3>
            <p>Clear rules and examples from Present Simple to Conditionals.</p>
          </Link>
          <Link to="/quiz" className="feature-card">
            <span className="feature-icon">🎯</span>
            <h3>Quizzes</h3>
            <p>Test your knowledge with instant feedback and explanations.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
