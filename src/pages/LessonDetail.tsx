import { useParams, Link } from 'react-router-dom';
import { useLesson, useAllLessons, getNextLessonId } from '../hooks/useContent';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  createRecognizer,
  scorePronunciation,
  isRecognitionSupported,
  type PronunciationScore,
} from '../utils/recognition';

// Canvas Confetti Component
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#eab308', '#a855f7', '#6366f1'];
    const particles = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0,
    }));

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particles.forEach((p, idx) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

        ctx!.beginPath();
        ctx!.lineWidth = p.r;
        ctx!.strokeStyle = p.color;
        ctx!.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx!.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx!.stroke();
      });

      let activeParticles = 0;
      particles.forEach((p) => {
        if (p.y < canvas!.height) activeParticles++;
      });

      if (activeParticles > 0) {
        animationFrameId = requestAnimationFrame(draw);
      }
    }

    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}

// Programmatic Web Audio API synthesiser for premium sounds
function playAudioFeedback(type: 'correct' | 'incorrect') {
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'correct') {
      // Major-third happy chime: C5 (523Hz) -> E5 (659Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35);
      osc.frequency.setValueAtTime(659.25, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Descending buzzer sound: 140Hz -> 85Hz
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.005, now + 0.4);
      osc.frequency.linearRampToValueAtTime(85, now + 0.38);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    console.error('Web Audio API not supported or blocked:', e);
  }
}

interface FlowStep {
  id: string;
  type: 'learn' | 'quiz_choice' | 'quiz_scramble' | 'quiz_speak' | 'quiz_write';
  english: string;
  translation: string;
  speaker?: string;
  options?: string[];
  correctIndex?: number;
  scrambledWords?: string[];
}

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: lesson, loading } = useLesson(id);
  const { data: allLessons } = useAllLessons();
  const { progress, completeLesson } = useProgress();
  const { tr, locale } = useLanguage();

  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  // Interaction States
  const [showTranslation, setShowTranslation] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0); // 1.0 = Normal, 0.6 = Slow
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Quiz States
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [scrambleOutput, setScrambleOutput] = useState<string[]>([]);
  const [writeInput, setWriteInput] = useState('');
  const [evaluation, setEvaluation] = useState<'correct' | 'incorrect' | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Speaking States
  const [listening, setListening] = useState(false);
  const [speakingScore, setSpeakingScore] = useState<PronunciationScore | null>(null);
  const [speakingError, setSpeakingError] = useState<string | null>(null);
  const recognizerRef = useRef<any>(null);

  // Generate Interactive Lesson Flow
  useEffect(() => {
    if (!lesson) return;

    // Parse existing steps
    const parsed = lesson.content.map((text) => {
      let speaker: string | undefined;
      let english = text;
      let translation = '';

      const speakerMatch = text.match(/^([A-Za-z0-9\s]+):\s*(.*)$/);
      if (speakerMatch) {
        speaker = speakerMatch[1].trim();
        english = speakerMatch[2].trim();
      }

      // Detect separator: em-dash "—" or " - " (en-dash)
      const emDashIdx = english.indexOf('—');
      const enDashIdx = english.indexOf(' - ');
      if (emDashIdx !== -1) {
        translation = english.substring(emDashIdx + 1).trim();
        english = english.substring(0, emDashIdx).trim();
      } else if (enDashIdx !== -1) {
        translation = english.substring(enDashIdx + 3).trim();
        english = english.substring(0, enDashIdx).trim();
      } else {
        const spaceHyphenIdx = english.indexOf(' -');
        if (spaceHyphenIdx !== -1) {
          translation = english.substring(spaceHyphenIdx + 2).trim();
          english = english.substring(0, spaceHyphenIdx).trim();
        }
      }

      return { english, translation, speaker };
    });

    // Build the hybrid flow
    const flow: FlowStep[] = [];
    parsed.forEach((step, idx) => {
      // 1. Add general/dialogue learning step
      flow.push({
        id: `learn-${idx}`,
        type: 'learn',
        english: step.english,
        translation: step.translation,
        speaker: step.speaker,
      });

      // If step has translation, weave in mini-games/quizzes
      if (step.translation) {
        if (idx % 3 === 0) {
          // Multiple choice
          const distractors = parsed
            .filter((_, dIdx) => dIdx !== idx)
            .map((s) => s.translation)
            .filter(Boolean)
            .slice(0, 3);

          const defaultFallbacks = [
            locale === 'vi' ? 'Chào buổi sáng!' : 'Good morning!',
            locale === 'vi' ? 'Cho tôi hóa đơn được không?' : 'Could I have the bill, please?',
            locale === 'vi' ? 'Bạn có nói tiếng Anh không?' : 'Do you speak English?',
            locale === 'vi' ? 'Xin lỗi, hỏi đường đi.' : 'Excuse me, directions please.',
            locale === 'vi' ? 'Hẹn gặp lại sau!' : 'See you later!',
          ];

          while (distractors.length < 3) {
            const fallback = defaultFallbacks[Math.floor(Math.random() * defaultFallbacks.length)];
            if (!distractors.includes(fallback) && fallback !== step.translation) {
              distractors.push(fallback);
            }
          }

          const options = [step.translation, ...distractors].sort(() => Math.random() - 0.5);
          flow.push({
            id: `choice-${idx}`,
            type: 'quiz_choice',
            english: step.english,
            translation: step.translation,
            options,
            correctIndex: options.indexOf(step.translation),
          });
        } else if (idx % 3 === 1) {
          // Scrambled Sentence Game
          const cleanText = step.english
            .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
          const words = cleanText.split(' ');
          if (words.length > 2 && words.length < 12) {
            flow.push({
              id: `scramble-${idx}`,
              type: 'quiz_scramble',
              english: step.english,
              translation: step.translation,
              scrambledWords: [...words].sort(() => Math.random() - 0.5),
            });
          } else {
            // Fallback to quiz_write if too short/long
            flow.push({
              id: `write-${idx}`,
              type: 'quiz_write',
              english: step.english,
              translation: step.translation,
            });
          }
        } else {
          // Translate and Write step (quiz_write)
          flow.push({
            id: `write-${idx}`,
            type: 'quiz_write',
            english: step.english,
            translation: step.translation,
          });
        }

        // Add Speaking check at key milestones (every 3 steps or final step)
        if (idx === parsed.length - 1 || (idx > 0 && idx % 3 === 0)) {
          flow.push({
            id: `speak-${idx}`,
            type: 'quiz_speak',
            english: step.english,
            translation: step.translation,
          });
        }
      }
    });

    setFlowSteps(flow);
    setStepIndex(0);
    setFinished(false);
  }, [lesson, locale]);

  // Handle TTS Playback
  const handlePlaySpeech = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/^[A-Za-z0-9\s]+:\s*/, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = speechRate;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [speechRate]);

  // Auto-play TTS on stepping into a new step
  useEffect(() => {
    if (flowSteps.length > 0 && stepIndex < flowSteps.length) {
      const step = flowSteps[stepIndex];
      // Auto-play for learn, choice, and speak steps (avoid play on scramble which would cheat)
      if (step.type === 'learn' || step.type === 'quiz_choice' || step.type === 'quiz_speak') {
        handlePlaySpeech(step.english);
      }
    }
    // Reset states for the new step
    setShowTranslation(false);
    setSelectedOption(null);
    setScrambleOutput([]);
    setWriteInput('');
    setEvaluation(null);
    setSpeakingScore(null);
    setSpeakingError(null);
    setListening(false);
  }, [stepIndex, flowSteps, handlePlaySpeech]);

  // Clean speaking recognizer ref when component unmounts
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speaking Attempt logic
  const handleRecord = () => {
    setSpeakingScore(null);
    setSpeakingError(null);

    const recognizer = createRecognizer({
      onResult: (transcript) => {
        const score = scorePronunciation(currentStep.english, transcript);
        setSpeakingScore(score);
        if (score.score >= 60) {
          playAudioFeedback('correct');
          setEvaluation('correct');
        } else {
          playAudioFeedback('incorrect');
          setEvaluation('incorrect');
        }
      },
      onError: () => {
        setSpeakingError(tr.speaking.micHint);
        setListening(false);
      },
      onEnd: () => setListening(false),
    });

    if (!recognizer) return;
    recognizerRef.current = recognizer;
    setListening(true);
    recognizer.start();
  };

  const handleStopRecord = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      setListening(false);
    }
  };

  // Evaluate normal quizzes
  const checkAnswer = () => {
    setIsChecking(true);
    let correct = false;

    if (currentStep.type === 'quiz_choice') {
      correct = selectedOption === currentStep.correctIndex;
    } else if (currentStep.type === 'quiz_scramble') {
      const cleanTarget = currentStep.english
        .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '')
        .replace(/\s{2,}/g, ' ')
        .toLowerCase()
        .trim();
      const outputSentence = scrambleOutput.join(' ').toLowerCase().trim();
      correct = outputSentence === cleanTarget;
    } else if (currentStep.type === 'quiz_write') {
      const cleanTarget = currentStep.english
        .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '')
        .replace(/\s{2,}/g, ' ')
        .toLowerCase()
        .trim();
      const cleanInput = writeInput
        .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '')
        .replace(/\s{2,}/g, ' ')
        .toLowerCase()
        .trim();
      correct = cleanInput === cleanTarget;
    }

    if (correct) {
      playAudioFeedback('correct');
      setEvaluation('correct');
      handlePlaySpeech(currentStep.english);
    } else {
      playAudioFeedback('incorrect');
      setEvaluation('incorrect');
    }
    setIsChecking(false);
  };

  const handleNextStep = () => {
    if (!lesson) return;
    if (stepIndex < flowSteps.length - 1) {
      setStepIndex((s) => s + 1);
    } else {
      // Completed full lesson
      completeLesson(lesson.id, lesson.duration);
      setFinished(true);
    }
  };

  // Global Keyboard Shortcuts for better accessibility and desktop user experience
  useEffect(() => {
    if (loading || !lesson || flowSteps.length === 0 || finished) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const step = flowSteps[stepIndex];
      if (!step) return;

      // 1. Enter Key: Check answer or continue step
      if (e.key === 'Enter') {
        e.preventDefault();
        if (evaluation !== null) {
          handleNextStep();
          return;
        }
        if (step.type === 'learn') {
          handleNextStep();
          return;
        }
        const canCheck =
          (step.type === 'quiz_choice' && selectedOption !== null) ||
          (step.type === 'quiz_scramble' && scrambleOutput.length > 0) ||
          (step.type === 'quiz_write' && writeInput.trim().length > 0);

        if (canCheck && !isChecking) {
          checkAnswer();
        }
        return;
      }

      // 2. Space Key: Reveal translation or replay audio
      if (e.key === ' ') {
        e.preventDefault();
        if (step.type === 'learn') {
          if (!showTranslation) {
            setShowTranslation(true);
          } else {
            handlePlaySpeech(step.english);
          }
        } else {
          handlePlaySpeech(step.english);
        }
        return;
      }

      // 3. Choice Keys (1, 2, 3, 4)
      if (step.type === 'quiz_choice' && evaluation === null) {
        const optionKeys = ['1', '2', '3', '4', 'a', 'b', 'c', 'd'];
        const keyIdx = optionKeys.indexOf(e.key.toLowerCase());
        if (keyIdx !== -1) {
          const index = keyIdx % 4;
          if (step.options && index < step.options.length) {
            e.preventDefault();
            setSelectedOption(index);
          }
        }
      }

      // 4. Scramble Backspace: Delete last word token
      if (step.type === 'quiz_scramble' && evaluation === null && e.key === 'Backspace') {
        e.preventDefault();
        setScrambleOutput((curr) => curr.slice(0, -1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, lesson, flowSteps, stepIndex, evaluation, selectedOption, scrambleOutput, isChecking, showTranslation, handlePlaySpeech, handleNextStep, checkAnswer, finished]);

  if (loading) {
    return (
      <div className="page">
        <p className="muted-text">{tr.common.loading}</p>
      </div>
    );
  }

  if (!lesson || flowSteps.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>{tr.lessons.notFound}</h2>
          <Link to="/lessons" className="btn btn-primary">{tr.lessons.backToList}</Link>
        </div>
      </div>
    );
  }

  const isCompleted = progress.completedLessons.includes(lesson.id);
  const nextLessonId = getNextLessonId(allLessons, lesson.id);
  const nextLesson = nextLessonId ? allLessons.find((l) => l.id === nextLessonId) : undefined;

  const currentStep = flowSteps[stepIndex];
  if (!currentStep) {
    return (
      <div className="page">
        <p className="muted-text">{tr.common.loading}</p>
      </div>
    );
  }
  const progressPercent = Math.round((stepIndex / flowSteps.length) * 100);



  if (finished) {
    return (
      <div className="page lesson-complete-page">
        <Confetti active={finished} />
        <div className="lesson-complete-card card-pop">
          <div className="success-emoji-wrapper">
            <span className="complete-icon animate-pulse">🎉</span>
          </div>
          <h1>{tr.lessons.completed}</h1>
          <p className="lesson-complete-title">{lesson.title}</p>
          
          <div className="lesson-stats-container">
            <div className="lesson-stat-box">
              <span className="stat-value">+{lesson.duration}</span>
              <span className="stat-label">{tr.progress.minutesStudied}</span>
            </div>
            <div className="lesson-stat-box">
              <span className="stat-value">100%</span>
              <span className="stat-label">{locale === 'vi' ? 'Hoàn thành' : 'Finished'}</span>
            </div>
            <div className="lesson-stat-box xp-glow">
              <span className="stat-value">+15 XP</span>
              <span className="stat-label">{locale === 'vi' ? 'Điểm tích lũy' : 'XP Points'}</span>
            </div>
            <div className="lesson-stat-box streak-glow">
              <span className="stat-value">🔥 {progress?.streak || 1}</span>
              <span className="stat-label">{locale === 'vi' ? 'Ngày liên tục' : 'Day Streak'}</span>
            </div>
          </div>

          <div className="lesson-complete-actions">
            {nextLessonId && nextLesson && (
              <Link to={`/lessons/${nextLessonId}`} className="btn btn-primary btn-block">
                {tr.lessons.next}: {nextLesson.title}
              </Link>
            )}
            <Link to="/lessons" className="btn btn-outline btn-block">{tr.lessons.backToList}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page lesson-detail-page modern-theme">
      {/* Gamified Duolingo-style Header */}
      <div className="lesson-flow-header">
        <Link to="/lessons" className="lesson-close-btn" aria-label="Close lesson">
          ×
        </Link>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="lesson-header-badges">
          <span className={`badge badge-${lesson.level}`}>{tr.levels[lesson.level]}</span>
          {isCompleted && <span className="badge badge-done">✓ {tr.lessons.done}</span>}
        </div>
      </div>

      {/* Main card viewport */}
      <div className="lesson-viewport">
        {currentStep.type === 'learn' && (
          <div className="learn-step-card card-pop">
            {currentStep.speaker && (
              <div className="dialogue-avatar">
                <span className="avatar-icon">👤</span>
                <span className="speaker-name">{currentStep.speaker}</span>
              </div>
            )}
            
            <div className="card-text-section">
              <h2
                className="english-headline clickable-headline"
                onClick={() => handlePlaySpeech(currentStep.english)}
                style={{ cursor: 'pointer' }}
                title={locale === 'vi' ? 'Bấm để nghe phát âm' : 'Click to hear pronunciation'}
              >
                {currentStep.english}
              </h2>
              
              {/* Speed & Listen Controls */}
              <div className="audio-control-row">
                <button
                  type="button"
                  className={`audio-play-btn ${isSpeaking ? 'speaking' : ''}`}
                  onClick={() => handlePlaySpeech(currentStep.english)}
                  aria-label="Listen"
                >
                  <svg className="play-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>

                <button
                  type="button"
                  className={`speed-toggle-btn ${speechRate === 0.6 ? 'slow' : ''}`}
                  onClick={() => setSpeechRate(r => r === 1.0 ? 0.6 : 1.0)}
                  title={speechRate === 1.0 ? "Read Slow" : "Read Normal"}
                >
                  {speechRate === 1.0 ? '🗣️' : '🐢'}
                </button>
              </div>

              {/* Translation with active recall switch */}
              {currentStep.translation && (
                <div className="translation-box">
                  {showTranslation ? (
                    <p className="translation-text animate-fade-in">{currentStep.translation}</p>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline show-translation-btn"
                      onClick={() => setShowTranslation(true)}
                    >
                      {locale === 'vi' ? 'Xem bản dịch' : 'Show translation'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep.type === 'quiz_choice' && (
          <div className="quiz-step-card card-pop">
            <h3 className="quiz-prompt-title">
              {locale === 'vi' ? 'Chọn nghĩa đúng của câu này:' : 'Choose the correct meaning:'}
            </h3>
            
            <div
              className="quiz-prompt-bubble"
              onClick={() => handlePlaySpeech(currentStep.english)}
              style={{ cursor: 'pointer' }}
              title={locale === 'vi' ? 'Bấm để nghe phát âm' : 'Click to hear pronunciation'}
            >
              <button
                type="button"
                className="btn-audio-mini"
                onClick={(e) => { e.stopPropagation(); handlePlaySpeech(currentStep.english); }}
                aria-label="Listen"
              >
                🔊
              </button>
              <span className="quiz-english-text">{currentStep.english}</span>
            </div>

            <div className="quiz-options-grid">
              {currentStep.options?.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  type="button"
                  disabled={evaluation !== null}
                  className={`quiz-option-card ${selectedOption === oIdx ? 'selected' : ''} ${
                    evaluation !== null && oIdx === currentStep.correctIndex ? 'correct-highlight' : ''
                  }`}
                  onClick={() => setSelectedOption(oIdx)}
                >
                  <span className="option-index">{String.fromCharCode(65 + oIdx)}</span>
                  <span className="option-text">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep.type === 'quiz_scramble' && (
          <div className="quiz-step-card card-pop">
            <h3 className="quiz-prompt-title">
              {locale === 'vi' ? 'Ghép câu hoàn chỉnh phù hợp với nghĩa:' : 'Scramble Sentence Builder:'}
            </h3>

            <div className="scramble-vietnamese-cue">
              💡 {currentStep.translation}
            </div>

            {/* Answer Display Line */}
            <div className="scramble-output-line">
              {scrambleOutput.length === 0 ? (
                <span className="placeholder-text">
                  {locale === 'vi' ? 'Bấm các từ bên dưới để xếp câu...' : 'Tap words to build...'}
                </span>
              ) : (
                scrambleOutput.map((w, wIdx) => (
                  <button
                    key={wIdx}
                    type="button"
                    disabled={evaluation !== null}
                    className="scramble-word-token clicked"
                    onClick={() => {
                      setScrambleOutput(curr => curr.filter((_, idx) => idx !== wIdx));
                    }}
                  >
                    {w}
                  </button>
                ))
              )}
            </div>

            {/* Reset / Reset Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginTop: '0.5rem', marginBottom: '1rem' }}>
              <button
                type="button"
                disabled={scrambleOutput.length === 0 || evaluation !== null}
                className="btn btn-sm btn-outline"
                style={{ fontSize: '0.8rem', padding: '0.2rem 0.65rem', minHeight: 'auto' }}
                onClick={() => setScrambleOutput([])}
              >
                🔄 {locale === 'vi' ? 'Làm lại' : 'Reset'}
              </button>
            </div>

            {/* Scrambled Inputs */}
            <div className="scramble-tokens-tray">
              {currentStep.scrambledWords?.map((w, wIdx) => {
                const countInOutput = scrambleOutput.filter(word => word === w).length;
                const totalInWords = currentStep.scrambledWords!.filter(word => word === w).length;
                const isUsed = countInOutput >= totalInWords;

                return (
                  <button
                    key={wIdx}
                    type="button"
                    disabled={isUsed || evaluation !== null}
                    className={`scramble-word-token ${isUsed ? 'used' : ''}`}
                    onClick={() => setScrambleOutput(curr => [...curr, w])}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {currentStep.type === 'quiz_write' && (
          <div className="quiz-step-card card-pop animate-fade-in">
            <h3 className="quiz-prompt-title">
              {locale === 'vi' ? 'Dịch câu này sang tiếng Anh:' : 'Translate this sentence into English:'}
            </h3>

            <div className="write-vietnamese-cue">
              💡 {currentStep.translation}
            </div>

            <div className="write-input-container">
              <textarea
                disabled={evaluation !== null}
                className={`write-text-input ${
                  evaluation === 'correct' ? 'correct-border' : evaluation === 'incorrect' ? 'incorrect-border' : ''
                }`}
                placeholder={locale === 'vi' ? 'Nhập câu trả lời bằng tiếng Anh...' : 'Type English sentence here...'}
                value={writeInput}
                onChange={(e) => setWriteInput(e.target.value)}
                rows={3}
                autoFocus
              />
            </div>

            <div className="write-hint-text">
              💡 {locale === 'vi' ? 'Mẹo: Nhấn Enter để gửi bài làm' : 'Tip: Press Enter to submit answer'}
            </div>
          </div>
        )}

        {currentStep.type === 'quiz_speak' && (
          <div className="quiz-step-card card-pop">
            <h3 className="quiz-prompt-title">
              {locale === 'vi' ? 'Đọc to mẫu câu dưới đây:' : 'Speak this phrase out loud:'}
            </h3>

            <div className="speaking-target-box">
              <button
                type="button"
                className="btn-audio-mini"
                onClick={() => handlePlaySpeech(currentStep.english)}
                aria-label="Listen"
              >
                🔊
              </button>
              <h2 className="speaking-target-phrase">{currentStep.english}</h2>
              <p className="speaking-translation-sub">({currentStep.translation})</p>
            </div>

            {/* Speaking feedback */}
            {speakingError && <div className="speaking-status-alert error">{speakingError}</div>}
            
            {speakingScore && (
              <div className="speaking-results-panel animate-fade-in">
                <div className="results-gauge">
                  <span className="results-score">{speakingScore.score}%</span>
                  <span className="results-label">
                    {speakingScore.score >= 90
                      ? tr.speaking.perfect
                      : speakingScore.score >= 60
                      ? tr.speaking.great
                      : tr.speaking.keepPracticing}
                  </span>
                </div>
                
                <div className="recognized-words-trail">
                  {speakingScore.words.map((item, wIdx) => (
                    <span key={wIdx} className={`trail-word ${item.matched ? 'matched' : 'unmatched'}`}>
                      {item.word}{' '}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Microphone Button Controls */}
            {!isRecognitionSupported() ? (
              <div className="speaking-status-alert warning">
                {tr.speaking.notSupported}
              </div>
            ) : (
              <div className="microphone-control-wrapper">
                {listening ? (
                  <button
                    type="button"
                    className="microphone-btn listening animate-pulse"
                    onClick={handleStopRecord}
                    aria-label="Stop recording"
                  >
                    <span className="mic-stop-icon">■</span>
                    <span className="sonar-wave" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={evaluation !== null}
                    className="microphone-btn idle"
                    onClick={handleRecord}
                    aria-label="Record pronunciation"
                  >
                    <span className="mic-icon">🎤</span>
                  </button>
                )}
                <p className="mic-status-label">
                  {listening ? tr.speaking.recording : locale === 'vi' ? 'Bấm để nói' : 'Tap to speak'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modern Duolingo-style Feedback Sticky Footer */}
      <div className={`lesson-footer-feedback ${evaluation || ''}`}>
        <div className="feedback-content-wrapper">
          {evaluation === null ? (
            <div className="footer-standard-actions">
              {/* Skip or Grammar Link */}
              {lesson.grammarTopicId ? (
                <Link to={`/grammar?topic=${lesson.grammarTopicId}`} className="footer-grammar-link">
                  💡 {tr.lessons.viewGrammar}
                </Link>
              ) : (
                <div />
              )}

              {/* Submit triggers depending on state */}
              {currentStep.type === 'learn' ? (
                <button
                  type="button"
                  className="btn btn-primary footer-action-btn"
                  onClick={handleNextStep}
                >
                  {tr.lessons.next}
                </button>
              ) : currentStep.type === 'quiz_speak' ? (
                <button
                  type="button"
                  className="btn btn-outline footer-action-btn"
                  onClick={handleNextStep}
                >
                  {locale === 'vi' ? 'Bỏ qua' : 'Skip'}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary footer-action-btn"
                  disabled={
                    isChecking ||
                    (currentStep.type === 'quiz_choice' && selectedOption === null) ||
                    (currentStep.type === 'quiz_scramble' && scrambleOutput.length === 0) ||
                    (currentStep.type === 'quiz_write' && writeInput.trim().length === 0)
                  }
                  onClick={checkAnswer}
                >
                  {locale === 'vi' ? 'Kiểm tra' : 'Check'}
                </button>
              )}
            </div>
          ) : (
            <div className="footer-evaluated-panel animate-slide-up">
              <div className="evaluation-text-block">
                <span className="evaluation-icon">
                  {evaluation === 'correct' ? '✓' : '×'}
                </span>
                <div>
                  <h4>
                    {evaluation === 'correct'
                      ? (locale === 'vi' ? 'Chính xác! Xuất sắc' : 'Correct! Excellent')
                      : (locale === 'vi' ? 'Chưa chính xác' : 'Incorrect')}
                  </h4>
                  {evaluation === 'incorrect' && (
                    <p className="correct-answer-hint">
                      {locale === 'vi' ? 'Đáp án đúng:' : 'Correct translation:'} <strong>{currentStep.translation}</strong>
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary feedback-continue-btn"
                onClick={handleNextStep}
              >
                {locale === 'vi' ? 'Tiếp tục' : 'Continue'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
