import { Link } from 'react-router-dom';
import { useAllLessons, useAllVocabulary } from '../hooks/useContent';
import { useProgress } from '../hooks/useProgress';
import { useSrs } from '../hooks/useSrs';
import { useLanguage } from '../context/LanguageContext';

export default function TodayPlanCard() {
  const { tr } = useLanguage();
  const { progress } = useProgress();
  const { data: lessons } = useAllLessons();
  const { data: vocabulary } = useAllVocabulary();
  const { counts } = useSrs();

  const nextLesson = lessons.find((l) => !progress.completedLessons.includes(l.id));
  const { due, fresh } = counts(vocabulary);
  const unlearned = vocabulary.length - progress.learnedWords.length;
  const reviewTotal = due + Math.min(fresh, 20);

  let ctaTo = '/lessons';
  let ctaLabel: string = tr.home.startLearning;
  let ctaDesc: string = tr.home.planStartLessons;

  if (due > 0) {
    ctaTo = '/review';
    ctaLabel = tr.home.planReviewNow;
    ctaDesc = tr.home.planReviewDue.replace('{count}', String(due));
  } else if (unlearned > 0 && progress.dailyGoals.wordsLearned < progress.settings.dailyWordGoal) {
    ctaTo = '/vocabulary/study';
    ctaLabel = tr.home.planStudyWords;
    ctaDesc = tr.home.planWordsLeft.replace('{count}', String(unlearned));
  } else if (nextLesson) {
    ctaTo = `/lessons/${nextLesson.id}`;
    ctaLabel = tr.home.planContinueLesson;
    ctaDesc = nextLesson.title;
  } else if (progress.dailyGoals.quizzesDone < progress.settings.dailyQuizGoal) {
    ctaTo = '/quiz';
    ctaLabel = tr.home.takeQuiz;
    ctaDesc = tr.home.planTakeQuiz;
  }

  return (
    <section className="today-plan" aria-label={tr.home.todayPlan}>
      <div className="today-plan-header">
        <h2>{tr.home.todayPlan}</h2>
        <p className="today-plan-subtitle">{tr.home.todayPlanSubtitle}</p>
      </div>

      <div className="today-plan-grid">
        {nextLesson && (
          <div className="today-plan-item">
            <span className="today-plan-icon">📚</span>
            <div>
              <strong>{tr.home.planNextLesson}</strong>
              <p>{nextLesson.title}</p>
            </div>
          </div>
        )}
        {reviewTotal > 0 && (
          <div className="today-plan-item">
            <span className="today-plan-icon">🔁</span>
            <div>
              <strong>{tr.home.planSrs}</strong>
              <p>{tr.home.planSrsDetail.replace('{due}', String(due)).replace('{new}', String(fresh))}</p>
            </div>
          </div>
        )}
        {unlearned > 0 && (
          <div className="today-plan-item">
            <span className="today-plan-icon">📝</span>
            <div>
              <strong>{tr.home.planNewWords}</strong>
              <p>{tr.home.planWordsLeft.replace('{count}', String(unlearned))}</p>
            </div>
          </div>
        )}
      </div>

      <Link to={ctaTo} className="btn btn-primary btn-block today-plan-cta">
        {ctaLabel}
      </Link>
      <p className="today-plan-cta-desc">{ctaDesc}</p>
    </section>
  );
}
