import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import Home from './pages/Home';
import Lessons from './pages/Lessons';
import LessonDetail from './pages/LessonDetail';
import Vocabulary from './pages/Vocabulary';
import VocabularyStudy from './pages/VocabularyStudy';
import Grammar from './pages/Grammar';
import Quiz from './pages/Quiz';
import ProgressPage from './pages/Progress';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import './index.css';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lessons" element={<Lessons />} />
              <Route path="/lessons/:id" element={<LessonDetail />} />
              <Route path="/vocabulary" element={<Vocabulary />} />
              <Route path="/vocabulary/study" element={<VocabularyStudy />} />
              <Route path="/grammar" element={<Grammar />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <MobileBottomNav />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}
