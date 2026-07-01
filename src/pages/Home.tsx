import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useAllLessons, useAllVocabulary } from '../hooks/useContent';
import { useLanguage } from '../context/LanguageContext';
import { getAchievements, getUnlockedCount } from '../utils/achievements';
import ProgressBar from '../components/ProgressBar';
import DailyGoalCard from '../components/DailyGoalCard';
import TodayPlanCard from '../components/TodayPlanCard';

export default function Home() {
  const { progress } = useProgress();
  const { tr } = useLanguage();
  const { data: lessons, loading } = useAllLessons();
  const { data: vocabulary } = useAllVocabulary();
  const achievements = getAchievements(progress);

  const stats = [
    { label: tr.home.lessons, value: progress.completedLessons.length, total: lessons.length, icon: '📚', tile: 'tile-indigo' },
    { label: tr.home.words, value: progress.learnedWords.length, total: vocabulary.length, icon: '📝', tile: 'tile-cyan' },
    { label: tr.home.quizzes, value: progress.quizScores.length, total: null, icon: '🎯', tile: 'tile-amber' },
    { label: tr.home.streak, value: progress.streak, total: null, icon: '🔥', tile: 'tile-rose' },
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
              <span className={`stat-icon-glyph ${s.tile}`}>{s.icon}</span>
              <span className="stat-value">
                {s.total !== null ? `${s.value}/${s.total}` : s.value}
              </span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <TodayPlanCard />

      <section className="section">
        <h2>{tr.home.dailyGoal}</h2>
        <DailyGoalCard />
      </section>

      <section className="section">
        <h2>{tr.home.yourProgress}</h2>
        {loading ? (
          <p className="muted-text">{tr.common.loading}</p>
        ) : (
          <div className="progress-grid">
            <ProgressBar label={tr.home.lessonsCompleted} value={progress.completedLessons.length} max={lessons.length} />
            <ProgressBar label={tr.home.vocabularyLearned} value={progress.learnedWords.length} max={vocabulary.length} />
            <ProgressBar
              label={tr.home.quizzesTaken}
              value={progress.quizScores.length}
              max={Math.max(10, progress.quizScores.length)}
            />
          </div>
        )}
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
        <div className="icon-menu-grid">
          <Link to="/lessons" className="icon-tile" title={tr.home.conversationDesc}>
            <span className="icon-tile-glyph tile-indigo">💬</span>
            <span className="icon-tile-label">{tr.home.conversation}</span>
          </Link>
          <Link to="/vocabulary" className="icon-tile" title={tr.home.vocabularyDesc}>
            <span className="icon-tile-glyph tile-cyan">📖</span>
            <span className="icon-tile-label">{tr.nav.vocabulary}</span>
          </Link>
          <Link to="/grammar" className="icon-tile" title={tr.home.grammarDesc}>
            <span className="icon-tile-glyph tile-emerald">📝</span>
            <span className="icon-tile-label">{tr.nav.grammar}</span>
          </Link>
          <Link to="/quiz" className="icon-tile" title={tr.home.quizDesc}>
            <span className="icon-tile-glyph tile-amber">🎯</span>
            <span className="icon-tile-label">{tr.nav.quiz}</span>
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>{tr.home.moreWays}</h2>
        <div className="icon-menu-grid">
          <Link to="/review" className="icon-tile" title={tr.practice.reviewDesc}>
            <span className="icon-tile-glyph tile-rose">🔁</span>
            <span className="icon-tile-label">{tr.practice.review}</span>
          </Link>
          <Link to="/speaking" className="icon-tile" title={tr.practice.speakingDesc}>
            <span className="icon-tile-glyph tile-violet">🎤</span>
            <span className="icon-tile-label">{tr.practice.speaking}</span>
          </Link>
          <Link to="/dictionary" className="icon-tile" title={tr.practice.dictionaryDesc}>
            <span className="icon-tile-glyph tile-sky">📖</span>
            <span className="icon-tile-label">{tr.practice.dictionary}</span>
          </Link>
          <Link to="/idioms" className="icon-tile" title={tr.practice.idiomsDesc}>
            <span className="icon-tile-glyph tile-orange">💡</span>
            <span className="icon-tile-label">{tr.practice.idioms}</span>
          </Link>
          <Link to="/toeic" className="icon-tile" title={tr.toeic.subtitle}>
            <span className="icon-tile-glyph tile-emerald">🏆</span>
            <span className="icon-tile-label">{tr.toeic.title}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
