import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../hooks/useProgress';
import { toeicExamSets, getLatestScorePct } from '../data/toeic';

export default function ToeicExams() {
  const { tr } = useLanguage();
  const { progress } = useProgress();

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/toeic" className="link-more">← {tr.toeic.backToHub}</Link>
        <h1>{tr.toeic.examsPageTitle}</h1>
        <p>{tr.toeic.examsPageSubtitle}</p>
      </div>

      <div className="toeic-exam-list">
        {toeicExamSets.map((exam) => {
          const pct = getLatestScorePct(progress.quizScores, exam.quizId);
          const minutes = Math.max(10, Math.round(120 * (exam.count / 200)));
          return (
            <div key={exam.id} className="toeic-exam-card">
              <div className="toeic-part-card-top">
                <span className="toeic-part-id">{tr.toeic.examLabel}</span>
                {pct !== null && <span className="toeic-part-score">{tr.toeic.lastScore}: {pct}%</span>}
              </div>
              <h3>{tr.toeic[exam.titleKey]}</h3>
              <p>{tr.toeic[exam.descKey]}</p>
              <div className="toeic-part-card-footer">
                <span>{exam.count} {tr.toeic.practiceQuestionsShort}</span>
                <span>{minutes}' {tr.toeic.timeLimit}</span>
              </div>
              <Link to={exam.to} className="btn btn-primary btn-block">
                {tr.toeic.startMockTest}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
