import { Link } from 'react-router-dom';
import { lessons } from '../data/lessons';
import { vocabulary } from '../data/vocabulary';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../context/LanguageContext';
import { getAchievements, getUnlockedCount } from '../utils/achievements';
import ProgressBar from '../components/ProgressBar';
import DailyGoalCard from '../components/DailyGoalCard';

export default function Home() {
  const { progress } = useProgress();
  const { tr } = useLanguage();
  const achievements = getAchievements(progress);

  const stats = [
    { label: tr.home.lessons, value: progress.completedLessons.length, total: lessons.length, icon: '📚' },
    { label: tr.home.words, value: progress.learnedWords.length, total: vocabulary.length, icon: '📝' },
    { label: tr.home.quizzes, value: progress.quizScores.length, total: null, icon: '🎯' },
    { label: tr.home.streak, value: progress.streak, total: null, icon: '🔥' },
  ];

  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>{tr.home.title} <span className="highlight">LinguaLearn</span></h1>
          <p className="hero-subtitle">{tr.home.subtitle}</p>
          <div className="hero-actions">
            <Link to="/lessons" className="btn btn-primary btn-lg">{tr.home.startLearning}</Link>
            <Link to="/quiz" className="btn btn-outline btn-lg">{tr.home.takeQuiz}</Link>
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
        <h2>{tr.home.dailyGoal}</h2>
        <DailyGoalCard />
      </section>

      <section className="section">
        <h2>{tr.home.yourProgress}</h2>
        <div className="progress-grid">
          <ProgressBar label={tr.home.lessonsCompleted} value={progress.completedLessons.length} max={lessons.length} />
          <ProgressBar label={tr.home.vocabularyLearned} value={progress.learnedWords.length} max={vocabulary.length} />
          <ProgressBar label={tr.home.quizzesTaken} value={progress.quizScores.length} max={Math.max(progress.quizScores.length, 1)} />
        </div>
      </section>

      <section className="section">
        <div className="section-header-row">
          <h2>{tr.home.achievements}</h2>
          <span className="section-badge">{getUnlockedCount(progress)}/{achievements.length}</span>
        </div>
        <div className="achievement-preview">
          {achievements.filter((a) => a.unlocked).slice(0, 4).map((a) => (
            <div key={a.id} className="achievement-chip unlocked">
              <span>{a.icon}</span>
              <span>{tr.achievements[a.titleKey as keyof typeof tr.achievements]}</span>
            </div>
          ))}
          {getUnlockedCount(progress) === 0 && (
            <p className="muted-text">{tr.progress.locked} — {tr.home.startLearning}!</p>
          )}
        </div>
        <Link to="/progress" className="link-more">→ {tr.nav.progress}</Link>
      </section>

      <section className="section">
        <h2>{tr.home.whatYouLearn}</h2>
        <div className="feature-grid">
          <Link to="/lessons" className="feature-card">
            <span className="feature-icon">💬</span>
            <h3>{tr.home.conversation}</h3>
            <p>{tr.home.conversationDesc}</p>
          </Link>
          <Link to="/vocabulary" className="feature-card">
            <span className="feature-icon">📖</span>
            <h3>{tr.nav.vocabulary}</h3>
            <p>{tr.home.vocabularyDesc}</p>
          </Link>
          <Link to="/grammar" className="feature-card">
            <span className="feature-icon">📝</span>
            <h3>{tr.nav.grammar}</h3>
            <p>{tr.home.grammarDesc}</p>
          </Link>
          <Link to="/quiz" className="feature-card">
            <span className="feature-icon">🎯</span>
            <h3>{tr.nav.quiz}</h3>
            <p>{tr.home.quizDesc}</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
