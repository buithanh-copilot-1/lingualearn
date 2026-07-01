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
