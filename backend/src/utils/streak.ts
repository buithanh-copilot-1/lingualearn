export function todayDate(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export function yesterdayDate(): Date {
  const d = todayDate();
  d.setUTCDate(d.getUTCDate() - 1);
  return d;
}

export function isSameDay(a: Date | null | undefined, b: Date): boolean {
  if (!a) return false;
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

export function computeStreak(
  currentStreak: number,
  lastStudyDate: Date | null | undefined,
  today: Date = todayDate(),
): { streak: number; lastStudyDate: Date } {
  if (isSameDay(lastStudyDate, today)) {
    return { streak: currentStreak, lastStudyDate: today };
  }
  if (isSameDay(lastStudyDate, yesterdayDate())) {
    return { streak: currentStreak + 1, lastStudyDate: today };
  }
  return { streak: 1, lastStudyDate: today };
}
