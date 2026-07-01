import { useState } from 'react';
import type { ToeicQuestion, Locale } from '../types';
import type { TranslationKeys } from '../i18n/translations';
import ListenButton from './ListenButton';
import ZoomableImage from './ZoomableImage';

interface Props {
  question: ToeicQuestion;
  isNewGroup: boolean;
  selected: number | null;
  onSelect: (index: number) => void;
  locale: Locale;
  tr: TranslationKeys;
}

export default function ToeicQuestionCard({ question, isNewGroup, selected, onSelect, locale, tr }: Props) {
  const [showScript, setShowScript] = useState(true);
  const showFeedback = selected !== null;

  return (
    <>
      {isNewGroup && question.imageUrl && (
        <ZoomableImage
          src={question.imageUrl}
          alt={question.imageDesc ?? tr.toeic.part}
          hint={tr.toeic.clickToZoom}
        />
      )}

      {isNewGroup && !question.imageUrl && question.imageDesc && (
        <div className="toeic-image-placeholder">
          <span className="toeic-image-icon">🖼️</span>
          <p>{question.imageDesc}</p>
          <span className="toeic-image-hint">{tr.toeic.imagePlaceholderHint}</span>
        </div>
      )}

      {isNewGroup && question.audioScript && (
        <div className="toeic-script-box">
          <div className="toeic-script-header">
            <span>{tr.toeic.transcript}</span>
            <div className="toeic-script-actions">
              <ListenButton
                text={question.audioScript}
                label={tr.toeic.listen}
                id={`toeic-script-${question.groupId ?? question.id}`}
                variant="default"
              />
              <button type="button" className="btn btn-sm btn-outline" onClick={() => setShowScript((s) => !s)}>
                {showScript ? tr.toeic.hideScript : tr.toeic.showScript}
              </button>
            </div>
          </div>
          {showScript && <p className="toeic-script-text">{question.audioScript}</p>}
        </div>
      )}

      {isNewGroup && question.passages && (
        <div className="toeic-script-box">
          {question.passageTitle && <div className="toeic-script-header"><span>{question.passageTitle}</span></div>}
          {question.passages.map((p, i) => (
            <div key={i} className="toeic-passage">
              <p className="toeic-passage-label">{p.label}</p>
              <p className="toeic-passage-text">{p.text}</p>
            </div>
          ))}
        </div>
      )}

      <div className="quiz-card">
        <h2 className="quiz-question">{question.question}</h2>

        <div className="quiz-options">
          {question.options.map((option, i) => {
            let cls = 'quiz-option';
            if (showFeedback) {
              if (i === question.correctIndex) cls += ' correct';
              else if (i === selected) cls += ' wrong';
            } else if (selected === i) {
              cls += ' selected';
            }
            return (
              <button key={i} className={cls} onClick={() => onSelect(i)} disabled={selected !== null}>
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                {option}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className="quiz-feedback">
            <p>{selected === question.correctIndex ? `✅ ${tr.quiz.correct}` : `❌ ${tr.quiz.incorrect}`}</p>
            <p className="quiz-explanation">{locale === 'vi' ? question.explanationVi : question.explanation}</p>
          </div>
        )}
      </div>
    </>
  );
}
