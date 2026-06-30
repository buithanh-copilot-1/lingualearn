import { useProgress } from '../context/ProgressContext';
import { useLanguage } from '../context/LanguageContext';
import { getDueWordIds } from '../utils/srs';
import ProgressBar from './ProgressBar';

export default function DailyGoalCard() {
  const { progress } = useProgress();
  const { tr } = useLanguage();
  const { dailyGoals, settings } = progress;
  const dueCount = getDueWordIds(progress).length;

  const goals = [
    { label: tr.home.goalLessons, current: dailyGoals.lessonsDone, target: settings.dailyLessonGoal },
    { label: tr.home.goalWords, current: dailyGoals.wordsLearned, target: settings.dailyWordGoal },
    { label: tr.home.goalReviews, current: dailyGoals.reviewsDone, target: settings.dailyReviewGoal, extra: dueCount },
    { label: tr.home.goalQuizzes, current: dailyGoals.quizzesDone, target: settings.dailyQuizGoal },
  ];

  const coreDone = goals.slice(0, 3).every((g) => g.current >= g.target) && goals[3].current >= goals[3].target;

  return (
    <div className={`daily-goal-card ${coreDone ? 'complete' : ''}`}>
      {coreDone && <p className="daily-goal-done">🎉 {tr.home.goalDone}</p>}
      {dueCount > 0 && dailyGoals.reviewsDone < settings.dailyReviewGoal && (
        <p className="daily-goal-reminder">🔄 {dueCount} {tr.home.dueReviewsReminder}</p>
      )}
      <div className="daily-goal-grid">
        {goals.map((g) => (
          <div key={g.label} className="daily-goal-item">
            <ProgressBar
              label={`${g.current}/${g.target} ${g.label}${'extra' in g && g.extra ? ` (${g.extra} ${tr.home.pending})` : ''}`}
              value={g.current}
              max={g.target}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
