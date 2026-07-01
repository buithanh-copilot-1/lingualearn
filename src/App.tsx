import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProgressProvider } from './context/ProgressContext';
import { AuthProvider } from './context/AuthContext';
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
import Practice from './pages/Practice';
import Review from './pages/Review';
import Speaking from './pages/Speaking';
import Dictionary from './pages/Dictionary';
import Idioms from './pages/Idioms';
import ProgressPage from './pages/Progress';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import './index.css';
import './responsive.css';

export default function App() {
  return (
    <ProgressProvider>
      <AuthProvider>
        <LanguageProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
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
                  <Route path="/practice" element={<Practice />} />
                  <Route path="/review" element={<Review />} />
                  <Route path="/speaking" element={<Speaking />} />
                  <Route path="/dictionary" element={<Dictionary />} />
                  <Route path="/idioms" element={<Idioms />} />
                  <Route path="/progress" element={<ProgressPage />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <MobileBottomNav />
            </div>
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </ProgressProvider>
  );
}
