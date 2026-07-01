import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../hooks/useProgress';
import { toeicParts, TOEIC_LISTENING_MINUTES, TOEIC_READING_MINUTES, TOEIC_TOTAL_QUESTIONS } from '../data/toeicParts';
import { getToeicQuestionsByPart } from '../data/toeic';

function latestScorePct(quizScores: { quizId: string; score: number; total: number; date: string }[], quizId: string) {
  const matches = quizScores.filter((s) => s.quizId === quizId);
  if (matches.length === 0) return null;
  const latest = matches[matches.length - 1];
  return Math.round((latest.score / latest.total) * 100);
}

export default function Toeic() {
  const { tr, locale } = useLanguage();
  const { progress } = useProgress();

  const listeningParts = toeicParts.filter((p) => p.skill === 'listening');
  const readingParts = toeicParts.filter((p) => p.skill === 'reading');

  const renderPartCard = (part: typeof toeicParts[number]) => {
    const available = getToeicQuestionsByPart(part.id).length;
    const pct = latestScorePct(progress.quizScores, `toeic-${part.id}`);
    return (
      <Link key={part.id} to={`/toeic/part/${part.id}`} className={`toeic-part-card toeic-part-${part.skill}`}>
        <div className="toeic-part-card-top">
          <span className="toeic-part-id">{tr.toeic.part} {part.id.replace('part', '')}</span>
          {pct !== null && <span className="toeic-part-score">{pct}%</span>}
        </div>
        <h3>{locale === 'vi' ? part.nameVi : part.name}</h3>
        <p>{locale === 'vi' ? part.descriptionVi : part.description}</p>
        <div className="toeic-part-card-footer">
          <span>{part.officialCount} {tr.toeic.officialQuestionsShort}</span>
          <span>{available} {tr.toeic.practiceQuestionsShort}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>{tr.toeic.title}</h1>
        <p>{tr.toeic.subtitle}</p>
      </div>

      <div className="toeic-overview-card">
        <div className="toeic-overview-stat">
          <span className="toeic-overview-value">{TOEIC_TOTAL_QUESTIONS}</span>
          <span className="toeic-overview-label">{tr.toeic.totalQuestions}</span>
        </div>
        <div className="toeic-overview-stat">
          <span className="toeic-overview-value">{TOEIC_LISTENING_MINUTES}+{TOEIC_READING_MINUTES}</span>
          <span className="toeic-overview-label">{tr.toeic.minutesLR}</span>
        </div>
        <div className="toeic-overview-stat">
          <span className="toeic-overview-value">10–990</span>
          <span className="toeic-overview-label">{tr.toeic.scoreRange}</span>
        </div>
        <Link to="/toeic/test" className="btn btn-primary toeic-mock-cta">
          🕐 {tr.toeic.takeMockTest}
        </Link>
      </div>

      <section className="section">
        <h2>🎧 {tr.toeic.listeningSection}</h2>
        <div className="toeic-part-grid">{listeningParts.map(renderPartCard)}</div>
      </section>

      <section className="section">
        <h2>📖 {tr.toeic.readingSection}</h2>
        <div className="toeic-part-grid">{readingParts.map(renderPartCard)}</div>
      </section>

      <section className="section">
        <div className="section-header-row">
          <h2>🗣️ {tr.toeic.speakingWritingTitle}</h2>
        </div>
        <p className="muted-text">{tr.toeic.speakingWritingDesc}</p>
        <Link to="/toeic/speaking" className="btn btn-outline">
          {tr.toeic.trySpeakingPractice}
        </Link>
      </section>
    </div>
  );
}
