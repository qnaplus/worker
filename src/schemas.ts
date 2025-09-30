import { z } from "zod";
import 'zod-openapi/extend';

export const slimQuestionSchema = z.object({
    id: z.string().openapi({ description: "The question's numerical ID" }),
    url: z.string().openapi({ description: "The url of the question" }),
    author: z.string().openapi({ description: "The person who asked the question" }),
    program: z.string().openapi({ description: "The program this question was asked in (e.g., V5RC, VURC, etc)" }),
    title: z.string().openapi({ description: "The title of the question" }),
    season: z.string().openapi({ description: "The season this question was asked in (e.g., 2022-2023)" }),
    askedTimestamp: z.string().openapi({ description: "When this question was asked (in the format DD-Mon-YYYY)" }),
    askedTimestampMs: z.number().openapi({ description: "The askedTimestamp in milliseconds" }),
    answeredTimestamp: z.string().nullable().openapi({ description: "When this question was answered (in the format DD-Mon-YYYY)" }),
    answeredTimestampMs: z.number().nullable().openapi({ description: "The answeredTimestamp in milliseconds" }),
    answered: z.boolean().openapi({ description: "Whether the question was answered" }),
    tags: z.string().array().openapi({ description: "Tags added to this question" })
})

export const fullQuestionSchema = slimQuestionSchema.extend({
    question: z.string().openapi({ description: "The question content as plain text" }),
    questionRaw: z.string().openapi({ description: "The question content as raw html" }),
    answer: z.string().nullable().openapi({ description: "The answer content as plain text" }),
    answerRaw: z.string().nullable().openapi({ description: "The answer content as raw html" })
});

export const refereeFyiRulesSchema = z.object({
    title: z.string(),
    season: z.string(),
    links: z.object({
        manual: z.string(),
        qna: z.string()
    }),
    programs: z.string().array(),
    ruleGroups: z.array(
        z.object({
            name: z.string(),
            programs: z.string().array(),
            rules: z.array(
                z.object({
                    rule: z.string(),
                    description: z.string(),
                    link: z.string(),
                    icon: z.string().optional()
                })
            )
        })
    )
});
