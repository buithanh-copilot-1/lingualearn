import { Link } from 'react-router-dom';
import type { Lesson } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  lesson: Lesson;
  completed?: boolean;
}

const categoryIcons: Record<string, string> = {
  conversation: '💬',
  grammar: '📝',
  vocabulary: '📖',
  listening: '🎧',
};

export default function LessonCard({ lesson, completed }: Props) {
  const { tr } = useLanguage();

  return (
    <div className={`lesson-card ${completed ? 'completed' : ''}`}>
      <div className="lesson-card-header">
        <span className="lesson-icon">{categoryIcons[lesson.category]}</span>
        <span className={`badge badge-${lesson.level}`}>{tr.levels[lesson.level]}</span>
        {completed && <span className="badge badge-done">✓ {tr.lessons.done}</span>}
      </div>
      <h3>{lesson.title}</h3>
      <p className="lesson-desc">{lesson.description}</p>
      <div className="lesson-meta">
        <span>⏱ {lesson.duration} min</span>
        <span>{tr.categories[lesson.category]}</span>
        <span>{lesson.content.length} {tr.lessons.step.toLowerCase()}s</span>
      </div>
      <Link to={`/lessons/${lesson.id}`} className="btn btn-primary btn-block">
        {completed ? tr.lessons.continueLesson : tr.lessons.startLesson}
      </Link>
    </div>
  );
}
