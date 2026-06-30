import { grammarTopics } from '../data/grammar';

export default function Grammar() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Grammar</h1>
        <p>Essential grammar topics with clear rules and practical examples.</p>
      </div>

      <div className="grammar-list">
        {grammarTopics.map((topic) => (
          <div key={topic.id} className="grammar-card">
            <div className="grammar-card-header">
              <h2>{topic.title}</h2>
              <span className={`badge badge-${topic.level}`}>{topic.level}</span>
            </div>
            <p className="grammar-desc">{topic.description}</p>

            <div className="grammar-section">
              <h4>Rules</h4>
              <ul>
                {topic.rules.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </div>

            <div className="grammar-section">
              <h4>Examples</h4>
              {topic.examples.map((ex, i) => (
                <div key={i} className="grammar-example">
                  <p className="example-sentence">"{ex.sentence}"</p>
                  <p className="example-explanation">{ex.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
