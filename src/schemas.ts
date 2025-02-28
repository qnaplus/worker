import { type } from "arktype";

export const slimQuestionSchema = type({
    id: "string",
    url: "string",
    author: "string",
    program: "string",
    title: "string",
    season: "string",
    askedTimestamp: "string",
    askedTimestampMs: "number",
    answeredTimestamp: "string",
    answeredTimestampMs: "number",
    answered: "boolean",
    tags: "string[]"
})

export const fullQuestionSchema = type({
    "...": slimQuestionSchema,
    question: "string",
    questionRaw: "string",
    answer: "string | null",
    answerRaw: "string | null"
});
