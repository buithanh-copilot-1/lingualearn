import type { ToeicQuestion, ToeicSpeakingTask } from '../types';
import toeicData from './toeic.json';

interface ToeicData {
  questions: ToeicQuestion[];
  speakingTasks: ToeicSpeakingTask[];
}

const data = toeicData as ToeicData;

export const toeicQuestions = data.questions;
export const toeicSpeakingTasks = data.speakingTasks;

export function getToeicQuestionsByPart(part: string): ToeicQuestion[] {
  return toeicQuestions.filter((q) => q.part === part);
}

/** Questions in the general practice bank (not part of a dedicated numbered exam set). */
export function getDefaultBankQuestions(): ToeicQuestion[] {
  return toeicQuestions.filter((q) => !q.examSet);
}

export function getToeicQuestionsByExamSet(examSet: string): ToeicQuestion[] {
  return toeicQuestions.filter((q) => q.examSet === examSet);
}

export const toeicExamSets = [
  {
    id: 'mini',
    to: '/toeic/test',
    quizId: 'toeic-mocktest',
    titleKey: 'mockTestTitle' as const,
    descKey: 'mockTestDesc' as const,
    count: getDefaultBankQuestions().length,
  },
  {
    id: 'test2',
    to: '/toeic/test/test2',
    quizId: 'toeic-test2',
    titleKey: 'practiceTest2Title' as const,
    descKey: 'practiceTest2Desc' as const,
    count: getToeicQuestionsByExamSet('test2').length,
  },
];

export function getLatestScorePct(
  quizScores: { quizId: string; score: number; total: number; date: string }[],
  quizId: string,
): number | null {
  const matches = quizScores.filter((s) => s.quizId === quizId);
  if (matches.length === 0) return null;
  const latest = matches[matches.length - 1];
  return Math.round((latest.score / latest.total) * 100);
}

/** Groups consecutive questions sharing a groupId into a single drill item (script/passage shown once). */
export function groupToeicQuestions(questions: ToeicQuestion[]): ToeicQuestion[][] {
  const groups: ToeicQuestion[][] = [];
  const seenGroups = new Map<string, number>();

  for (const q of questions) {
    if (q.groupId && seenGroups.has(q.groupId)) {
      groups[seenGroups.get(q.groupId)!].push(q);
      continue;
    }
    if (q.groupId) seenGroups.set(q.groupId, groups.length);
    groups.push([q]);
  }

  return groups;
}
