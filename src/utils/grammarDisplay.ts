import type { GrammarTopic } from '../types';

/** Merge Vietnamese fields from local seed data into API grammar topics. */
export function mergeGrammarWithVi(
  topics: GrammarTopic[],
  local: GrammarTopic[],
): GrammarTopic[] {
  const localMap = new Map(local.map((t) => [t.id, t]));

  return topics.map((topic) => {
    const vi = localMap.get(topic.id);
    if (!vi) return topic;

    return {
      ...topic,
      titleVi: vi.titleVi,
      descriptionVi: vi.descriptionVi,
      rulesVi: vi.rulesVi,
      examples: topic.examples.map((ex, i) => ({
        ...ex,
        sentenceVi: vi.examples[i]?.sentenceVi ?? ex.sentenceVi,
        explanationVi: vi.examples[i]?.explanationVi ?? ex.explanationVi,
      })),
    };
  });
}

export function grammarMatchesSearch(topic: GrammarTopic, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    topic.title,
    topic.titleVi,
    topic.description,
    topic.descriptionVi,
    ...topic.rules,
    ...(topic.rulesVi ?? []),
    ...topic.examples.flatMap((ex) => [ex.sentence, ex.sentenceVi, ex.explanation, ex.explanationVi]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(q);
}
