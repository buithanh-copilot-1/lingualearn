import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { tr } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>&copy; 2026 LinguaLearn — {tr.footer.tagline}</p>
        <p className="footer-sub">{tr.footer.builtFor} 🇻🇳</p>
      </div>
    </footer>
  );
}
