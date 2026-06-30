# LinguaLearn

Interactive English learning website designed for Vietnamese learners.

## Features

- **Lessons** — Conversation and grammar lessons from beginner to advanced
- **Vocabulary** — Flip flashcards with pronunciation, Vietnamese meanings, and examples
- **Grammar** — Clear grammar guides with rules and examples
- **Quiz** — Interactive quizzes with instant feedback
- **Progress Tracking** — Streak counter, study time, and completion stats (saved in browser)

## Tech Stack

- React 19 + TypeScript
- Vite
- React Router
- LocalStorage for progress persistence

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/   # Reusable UI components
├── data/         # Lessons, vocabulary, quizzes, grammar content
├── hooks/        # Custom React hooks (progress tracking)
├── pages/        # Route pages
└── types/        # TypeScript interfaces
```

## License

MIT
