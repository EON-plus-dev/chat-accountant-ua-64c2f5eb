// Local-first прогрес курсів. Пізніше замінимо на Lovable Cloud.

const PROGRESS_KEY = (courseId: string) => `fintodo.progress.${courseId}`;
const LAST_LESSON_KEY = (courseId: string) => `fintodo.lastLesson.${courseId}`;
const QUIZ_KEY = (courseId: string) => `fintodo.quiz.${courseId}`;
const PURCHASED_KEY = "fintodo.purchased.courses";

const safeRead = (key: string): string | null => {
  try { return typeof window !== "undefined" ? window.localStorage.getItem(key) : null; }
  catch { return null; }
};
const safeWrite = (key: string, value: string) => {
  try { if (typeof window !== "undefined") window.localStorage.setItem(key, value); }
  catch { /* noop */ }
};

export const getProgress = (courseId: string): Set<string> => {
  const raw = safeRead(PROGRESS_KEY(courseId));
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr.filter((x): x is string => typeof x === "string")) : new Set();
  } catch { return new Set(); }
};

export const isLessonDone = (courseId: string, lessonId: string): boolean =>
  getProgress(courseId).has(lessonId);

export const markLessonDone = (courseId: string, lessonId: string): void => {
  const set = getProgress(courseId);
  set.add(lessonId);
  safeWrite(PROGRESS_KEY(courseId), JSON.stringify([...set]));
};

export const unmarkLessonDone = (courseId: string, lessonId: string): void => {
  const set = getProgress(courseId);
  set.delete(lessonId);
  safeWrite(PROGRESS_KEY(courseId), JSON.stringify([...set]));
};

export const getLastLesson = (courseId: string): string | null =>
  safeRead(LAST_LESSON_KEY(courseId));

export const setLastLesson = (courseId: string, lessonId: string): void => {
  safeWrite(LAST_LESSON_KEY(courseId), lessonId);
};

export const getPurchasedCourses = (): Set<string> => {
  const raw = safeRead(PURCHASED_KEY);
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr.filter((x): x is string => typeof x === "string")) : new Set();
  } catch { return new Set(); }
};

export const markCoursePurchased = (courseId: string): void => {
  const set = getPurchasedCourses();
  set.add(courseId);
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PURCHASED_KEY, JSON.stringify([...set]));
    }
  } catch { /* noop */ }
};

export const hasCourseAccess = (courseId: string, isFree: boolean): boolean => {
  if (isFree) return true;
  return getPurchasedCourses().has(courseId);
};

// ───── Quiz progress ─────

export interface QuizResult {
  score: number;        // 0–100
  total: number;        // questions count
  correct: number;
  passedAt: string;     // ISO
}

type QuizMap = Record<string, QuizResult>;

const readQuizMap = (courseId: string): QuizMap => {
  const raw = safeRead(QUIZ_KEY(courseId));
  if (!raw) return {};
  try { const v = JSON.parse(raw); return (v && typeof v === "object") ? v as QuizMap : {}; }
  catch { return {}; }
};

export const getQuizResult = (courseId: string, lessonId: string): QuizResult | null =>
  readQuizMap(courseId)[lessonId] ?? null;

export const saveQuizResult = (courseId: string, lessonId: string, result: QuizResult): void => {
  const map = readQuizMap(courseId);
  map[lessonId] = result;
  safeWrite(QUIZ_KEY(courseId), JSON.stringify(map));
};

export const getQuizResults = (courseId: string): QuizMap => readQuizMap(courseId);

export const isQuizPassed = (result: QuizResult | null, threshold = 66): boolean =>
  !!result && result.score >= threshold;

/** Курс пройдено повністю: всі уроки done + всі непорожні квізи (mini або фінальний) пройдено ≥66%. */
export const isCourseFullyCompleted = (
  courseId: string,
  lessons: Array<{ id: string; quiz?: { question: string }[]; miniQuiz?: { question: string }[] }>,
): boolean => {
  const done = getProgress(courseId);
  const quizMap = readQuizMap(courseId);
  for (const l of lessons) {
    if (!done.has(l.id)) return false;
    const hasAnyQuiz = (l.quiz && l.quiz.length > 0) || (l.miniQuiz && l.miniQuiz.length > 0);
    if (hasAnyQuiz) {
      const r = quizMap[l.id];
      if (!isQuizPassed(r)) return false;
    }
  }
  return true;
};
