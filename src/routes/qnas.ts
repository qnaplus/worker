import 'zod-openapi/extend';
import { desc, eq, isNotNull } from "drizzle-orm";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { db, selectSlimQuestion } from "../db";
import { questions } from "../db/schema";
import { slimQuestionSchema } from "../schemas";
import tags from "../tags";
import { errorJson, trycatch } from "../utils";
import { Hono } from "hono";
import { z } from "zod";

const qnas = new Hono<{ Bindings: Env }>();

qnas.get(
    "/recently-asked",
    describeRoute({
        description: "Get the 20 most recently asked Q&As",
        responses: {
            500: {
                description: "Server Error"
            },
            200: {
                description: "Successful Response",
                content: {
                    "application/json": {
                        schema: resolver(slimQuestionSchema.array())
                    }
                }
            }
        },
        tags: [tags.Qna]
    }),
    async (c) => {
        const [error, result] = await trycatch(() =>
            selectSlimQuestion()
                .orderBy(desc(questions.askedTimestampMs))
                .limit(20)
        )
        if (error) {
            return c.json(errorJson(`An error occurred while fetching recently asked questions`, error), 500);
        }
        return c.json(result);
    }
);

qnas.get(
    "/recently-answered",
    describeRoute({
        description: "Get the 20 most recently answered Q&As",
        responses: {
            500: {
                description: "Server Error"
            },
            200: {
                description: "Successful Response",
                content: {
                    "application/json": {
                        schema: resolver(slimQuestionSchema.array())
                    }
                }
            }
        },
        tags: [tags.Qna]
    }),
    async (c) => {
        const [error, result] = await trycatch(() =>
            selectSlimQuestion()
                .where(isNotNull(questions.answeredTimestampMs))
                .orderBy(desc(questions.answeredTimestampMs))
                .limit(20)
        )
        if (error) {
            return c.json(errorJson(`An error occurred while fetching recently answered questions`, error), 500);
        }
        return c.json(result);
    }
);

qnas.get(
    "/asked-by/:author",
    describeRoute({
        description: "Get all Q&As asked by the given author",
        responses: {
            500: {
                description: "Server Error"
            },
            200: {
                description: "Successful Response",
                content: {
                    "application/json": {
                        schema: resolver(slimQuestionSchema.array())
                    }
                }
            }
        },
        tags: [tags.Qna]
    }),
    validator(
        "param",
        z.object({
            author: z.string()
        })
    ),
    async (c) => {
        const { author } = c.req.valid("param");
        const [error, result] = await trycatch(() =>
            selectSlimQuestion()
                .where(eq(questions.author, author))
        )
        if (error) {
            return c.json(errorJson(`An error occurred while fetching questions asked by ${author}`, error), 500);
        }
        return c.json(result);
    }
);

qnas.get(
    "/:id",
    describeRoute({
        description: "Get the Q&A with the given ID",
        responses: {
            500: {
                description: "Server Error"
            },
            404: {
                description: "Not Found"
            },
            200: {
                description: "Successful Response",
                content: {
                    "application/json": {
                        schema: resolver(slimQuestionSchema)
                    }
                }
            }
        },
        tags: [tags.Qna]
    }),
    validator(
        "param",
        z.object({
            id: z.string().openapi({ description: "The question's numerical ID" })
        })
    ),
    async (c) => {
        const { id } = c.req.valid("param");
        const [error, result] = await trycatch(() =>
            db().query.questions.findFirst({
                where: eq(questions.id, id)
            })
        )
        if (error) {
            return c.json(errorJson(`An error occurred while fetching question with id ${id}`, error), 500);
        }
        if (result === undefined) {
            return c.json(errorJson(`No question with id ${id} was found.`), 404);
        }
        return c.json(result);
    }
);

export default qnas;
