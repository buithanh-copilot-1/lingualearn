import { Link } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { useLanguage } from '../context/LanguageContext';
import { getLearningSteps, getPrimaryStep } from '../utils/learningPath';
import { getDueWordIds } from '../utils/srs';

export default function LearningPathCard() {
  const { progress } = useProgress();
  const { tr } = useLanguage();
  const steps = getLearningSteps(progress);
  const primary = getPrimaryStep(progress);
  const dueCount = getDueWordIds(progress).length;
  const lp = tr.learningPath;

  return (
    <div className="learning-path-card">
      <div className="learning-path-header">
        <h2>{lp.title}</h2>
        {dueCount > 0 && (
          <span className="learning-path-badge">{dueCount} {lp.dueWords}</span>
        )}
      </div>
      <p className="learning-path-subtitle">{lp.subtitle}</p>

      <Link to={primary.href} className="learning-path-primary">
        <span className="learning-path-step-icon">
          {primary.type === 'review' && '🔄'}
          {primary.type === 'lesson' && '📚'}
          {primary.type === 'vocabulary' && '📝'}
          {primary.type === 'quiz' && '🎯'}
          {primary.type === 'done' && '🎉'}
        </span>
        <div>
          <strong>{lp[primary.titleKey as keyof typeof lp]}</strong>
          <p>{lp[primary.descKey as keyof typeof lp]}</p>
        </div>
        {primary.count !== undefined && (
          <span className="learning-path-count">{primary.count}</span>
        )}
        <span className="learning-path-arrow">→</span>
      </Link>

      {steps.length > 1 && (
        <ul className="learning-path-steps">
          {steps.slice(1, 4).map((step) => (
            <li key={step.type + step.href}>
              <Link to={step.href}>
                {lp[step.titleKey as keyof typeof lp]}
                {step.count !== undefined && ` (${step.count})`}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
