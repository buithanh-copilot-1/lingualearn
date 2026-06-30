import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function NotFound() {
  const { tr } = useLanguage();

  return (
    <div className="page">
      <div className="not-found-card">
        <span className="not-found-code">404</span>
        <h1>{tr.notFound.title}</h1>
        <p>{tr.notFound.subtitle}</p>
        <Link to="/" className="btn btn-primary btn-lg">{tr.notFound.backHome}</Link>
      </div>
    </div>
  );
}
