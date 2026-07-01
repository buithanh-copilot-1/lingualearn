import type { GrammarTopic } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  topic: GrammarTopic;
  reviewed: boolean;
  expanded: boolean;
  onToggle: () => void;
  onReview?: () => void;
}

export default function GrammarTopicCard({
  topic,
  reviewed,
  expanded,
  onToggle,
  onReview,
}: Props) {
  const { tr, locale } = useLanguage();
  const showVi = locale === 'vi' || Boolean(topic.titleVi);

  return (
    <article
      id={`grammar-topic-${topic.id}`}
      className={`grammar-topic ${reviewed ? 'grammar-topic-reviewed' : ''} ${expanded ? 'grammar-topic-expanded' : ''}`}
    >
      <button type="button" className="grammar-topic-header" onClick={onToggle} aria-expanded={expanded}>
        <div className="grammar-topic-heading">
          <h2>{topic.title}</h2>
          {showVi && topic.titleVi && (
            <p className="grammar-topic-title-vi">{topic.titleVi}</p>
          )}
          {!expanded && showVi && topic.descriptionVi && (
            <p className="grammar-topic-preview">{topic.descriptionVi}</p>
          )}
        </div>
        <div className="grammar-topic-badges">
          <span className={`badge badge-${topic.level}`}>{tr.levels[topic.level]}</span>
          {reviewed && <span className="badge badge-done">✓</span>}
          <span className="grammar-topic-chevron" aria-hidden>{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="grammar-topic-body">
          <section className="grammar-detail-section grammar-detail-section-primary">
            <h3>{tr.grammar.overview}</h3>
            <p className="grammar-detail-en">{topic.description}</p>
            {topic.descriptionVi && (
              <p className="grammar-detail-vi">{topic.descriptionVi}</p>
            )}
          </section>

          <section className="grammar-detail-section">
            <h3>{tr.grammar.rules}</h3>
            <ol className="grammar-rules-list">
              {topic.rules.map((rule, i) => (
                <li key={i}>
                  <p className="grammar-rule-en">{rule}</p>
                  {topic.rulesVi?.[i] && (
                    <p className="grammar-rule-vi">{topic.rulesVi[i]}</p>
                  )}
                </li>
              ))}
            </ol>
          </section>

          <section className="grammar-detail-section">
            <h3>{tr.grammar.examples}</h3>
            <div className="grammar-examples-list">
              {topic.examples.map((ex, i) => (
                <div key={i} className="grammar-example-card">
                  <p className="grammar-example-sentence">"{ex.sentence}"</p>
                  {ex.sentenceVi && (
                    <p className="grammar-example-sentence-vi">
                      <span className="grammar-inline-label">{tr.grammar.translation}:</span> {ex.sentenceVi}
                    </p>
                  )}
                  <p className="grammar-example-note">
                    <span className="grammar-inline-label">{tr.grammar.note}:</span> {ex.explanation}
                  </p>
                  {ex.explanationVi && (
                    <p className="grammar-example-note-vi">{ex.explanationVi}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {onReview && !reviewed && (
            <div className="grammar-topic-actions">
              <button type="button" className="btn btn-primary btn-block" onClick={onReview}>
                {tr.grammar.markReviewed}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
