import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { LanguageProvider } from './context/LanguageContext';
import { OnboardingGate, ProgressSync } from './components/OnboardingGate';
import AppLayout from './components/AppLayout';
import Home from './pages/Home';
import Lessons from './pages/Lessons';
import LessonDetail from './pages/LessonDetail';
import Vocabulary from './pages/Vocabulary';
import VocabularyStudy from './pages/VocabularyStudy';
import Grammar from './pages/Grammar';
import GrammarPractice from './pages/GrammarPractice';
import Quiz from './pages/Quiz';
import ProgressPage from './pages/Progress';
import Settings from './pages/Settings';
import Placement from './pages/Placement';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <LanguageProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
            <ProgressSync />
            <div className="app">
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/placement" element={<Placement />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route element={<OnboardingGate />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/lessons" element={<Lessons />} />
                    <Route path="/lessons/:id" element={<LessonDetail />} />
                    <Route path="/vocabulary" element={<Vocabulary />} />
                    <Route path="/vocabulary/study" element={<VocabularyStudy />} />
                    <Route path="/grammar" element={<Grammar />} />
                    <Route path="/grammar/:topicId/practice" element={<GrammarPractice />} />
                    <Route path="/quiz" element={<Quiz />} />
                    <Route path="/progress" element={<ProgressPage />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Route>
              </Routes>
            </div>
          </BrowserRouter>
        </LanguageProvider>
      </ProgressProvider>
    </AuthProvider>
  );
}
