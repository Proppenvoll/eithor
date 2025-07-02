export type QuestionKey = "either" | "or";
export type QuestionKeys<T> = Record<QuestionKey, T>;

export interface Question extends QuestionKeys<string> {
  questionId: number;
}

export interface Answer {
  questionId: number;
  answer: string;
}

export interface Result {
  question: Question;
  answer: string;
  distribution: QuestionKeys<number>;
}

const apiUrl = "http://localhost:8080/api";

export async function getQuestion(): Promise<Question | null> {
  const questionResponse = await fetch(`${apiUrl}/question`);

  if (questionResponse.status === 204) {
    return null;
  }

  return questionResponse.json();
}

export async function postAnswer(answer: Answer): Promise<Result> {
  const result = await fetch(`${apiUrl}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(answer),
  });
  return result.json();
}

export async function startOver(): ReturnType<typeof getQuestion> {
  await fetch(`${apiUrl}/start-over`, { method: "POST" });
  return getQuestion();
}
