import { array, boolean, nullable, number, object, string } from "valibot";

export const questionSchema = object({
    id: string(),
    url: string(),
    author: string(),
    program: string(),
    title: string(),
    question: string(),
    questionRaw: string(),
    answer: nullable(string()),
    answerRaw: nullable(string()),
    season: string(),
    askedTimestamp: string(),
    askedTimestampMs: number(),
    answeredTimestamp: string(),
    answeredTimestampMs: number(),
    answered: boolean(),
    tags: array(string())
});
