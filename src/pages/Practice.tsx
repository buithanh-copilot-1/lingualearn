import { Link } from 'react-router-dom';
import { useAllVocabulary } from '../hooks/useContent';
import { useSrs } from '../hooks/useSrs';
import { useLanguage } from '../context/LanguageContext';

export default function Practice() {
  const { tr } = useLanguage();
  const { data: vocabulary } = useAllVocabulary();
  const { counts } = useSrs();
  const { due, fresh } = counts(vocabulary);

  const tools = [
    {
      to: '/review',
      icon: '🔁',
      title: tr.practice.review,
      desc: tr.practice.reviewDesc,
      badge: due > 0 ? `${due} ${tr.practice.dueNow}` : fresh > 0 ? `${fresh} ${tr.practice.newWords}` : null,
    },
    { to: '/speaking', icon: '🎤', title: tr.practice.speaking, desc: tr.practice.speakingDesc, badge: null },
    { to: '/dictionary', icon: '📖', title: tr.practice.dictionary, desc: tr.practice.dictionaryDesc, badge: null },
    { to: '/idioms', icon: '💡', title: tr.practice.idioms, desc: tr.practice.idiomsDesc, badge: null },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>{tr.practice.title}</h1>
        <p>{tr.practice.subtitle}</p>
      </div>

      <div className="feature-grid">
        {tools.map((tool) => (
          <Link key={tool.to} to={tool.to} className="feature-card practice-card">
            <span className="feature-icon">{tool.icon}</span>
            <h3>{tool.title}</h3>
            <p>{tool.desc}</p>
            {tool.badge && <span className="practice-badge">{tool.badge}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
