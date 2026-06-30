import { lessons } from '../data/lessons';
import { vocabulary } from '../data/vocabulary';
import { quizzes } from '../data/quizzes';
import { useProgress } from '../hooks/useProgress';
import ProgressBar from '../components/ProgressBar';

export default function ProgressPage() {
  const { progress, resetProgress } = useProgress();

  const avgScore =
    progress.quizScores.length > 0
      ? Math.round(
          (progress.quizScores.reduce((sum, q) => sum + (q.score / q.total) * 100, 0) /
            progress.quizScores.length)
        )
      : 0;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Your Progress</h1>
        <p>Track your learning journey and celebrate your achievements.</p>
      </div>

      <div className="progress-dashboard">
        <div className="dashboard-stat-row">
          <div className="dashboard-stat">
            <span className="dashboard-stat-icon">🔥</span>
            <span className="dashboard-stat-value">{progress.streak}</span>
            <span className="dashboard-stat-label">Day Streak</span>
          </div>
          <div className="dashboard-stat">
            <span className="dashboard-stat-icon">⏱</span>
            <span className="dashboard-stat-value">{progress.totalStudyMinutes}</span>
            <span className="dashboard-stat-label">Minutes Studied</span>
          </div>
          <div className="dashboard-stat">
            <span className="dashboard-stat-icon">🎯</span>
            <span className="dashboard-stat-value">{avgScore}%</span>
            <span className="dashboard-stat-label">Avg Quiz Score</span>
          </div>
        </div>

        <div className="progress-section">
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

        {progress.quizScores.length > 0 && (
          <div className="quiz-history">
            <h3>Quiz History</h3>
            <div className="quiz-history-list">
              {progress.quizScores.map((q, i) => (
                <div key={i} className="quiz-history-item">
                  <span>{new Date(q.date).toLocaleDateString()}</span>
                  <span>{q.score}/{q.total} ({Math.round((q.score / q.total) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn btn-outline btn-danger" onClick={resetProgress}>
          Reset All Progress
        </button>
      </div>
    </div>
  );
}
