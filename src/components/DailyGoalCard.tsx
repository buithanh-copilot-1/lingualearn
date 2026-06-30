import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../context/LanguageContext';
import ProgressBar from './ProgressBar';

export default function DailyGoalCard() {
  const { progress } = useProgress();
  const { tr } = useLanguage();
  const { dailyGoals, settings } = progress;

  const goals = [
    { label: tr.home.goalLessons, current: dailyGoals.lessonsDone, target: settings.dailyLessonGoal },
    { label: tr.home.goalWords, current: dailyGoals.wordsLearned, target: settings.dailyWordGoal },
    { label: tr.home.goalQuizzes, current: dailyGoals.quizzesDone, target: settings.dailyQuizGoal },
  ];

  const allDone = goals.every((g) => g.current >= g.target);

  return (
    <div className={`daily-goal-card ${allDone ? 'complete' : ''}`}>
      {allDone && <p className="daily-goal-done">🎉 {tr.home.goalDone}</p>}
      <div className="daily-goal-grid">
        {goals.map((g) => (
          <div key={g.label} className="daily-goal-item">
            <ProgressBar label={`${g.current}/${g.target} ${g.label}`} value={g.current} max={g.target} />
          </div>
        ))}
      </div>
    </div>
  );
}
