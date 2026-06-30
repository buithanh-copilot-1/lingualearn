import type { Lesson } from '../types';

interface Props {
  lesson: Lesson;
  completed?: boolean;
  onComplete?: () => void;
}

const levelColors: Record<string, string> = {
  beginner: 'badge-beginner',
  intermediate: 'badge-intermediate',
  advanced: 'badge-advanced',
};

const categoryIcons: Record<string, string> = {
  conversation: '💬',
  grammar: '📝',
  vocabulary: '📖',
  listening: '🎧',
};

export default function LessonCard({ lesson, completed, onComplete }: Props) {
  return (
    <div className={`lesson-card ${completed ? 'completed' : ''}`}>
      <div className="lesson-card-header">
        <span className="lesson-icon">{categoryIcons[lesson.category]}</span>
        <span className={`badge ${levelColors[lesson.level]}`}>{lesson.level}</span>
        {completed && <span className="badge badge-done">✓ Done</span>}
      </div>
      <h3>{lesson.title}</h3>
      <p className="lesson-desc">{lesson.description}</p>
      <div className="lesson-meta">
        <span>⏱ {lesson.duration} min</span>
        <span className="capitalize">{lesson.category}</span>
      </div>
      <ul className="lesson-content">
        {lesson.content.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ul>
      {!completed && onComplete && (
        <button className="btn btn-primary" onClick={onComplete}>
          Mark as Complete
        </button>
      )}
    </div>
  );
}
