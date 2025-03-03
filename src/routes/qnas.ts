import { type } from "arktype";
import { eq } from "drizzle-orm";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/arktype";
import { db, selectSlimQuestion } from "../db";
import { questions } from "../db/schema";
import { slimQuestionSchema } from "../schemas";
import tags from "../tags";
import { trycatch } from "../utils";
import { Hono } from "hono";

export const qnas = new Hono<{ Bindings: Env }>();

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
        type({
            id: "string"
        })
    ),
    async (c) => {
        const { id } = c.req.valid("param");
        const { ok, error, result } = await trycatch(
            db().query.questions.findFirst({
                where: eq(questions.id, id)
            })
        )
        if (!ok) {
            return c.status(500);
        }
        if (result === undefined) {
            return c.status(404);
        }
        return c.json(result);
    }
);

qnas.get(
    "/from-author",
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
                        schema: resolver(slimQuestionSchema.array())
                    }
                }
            }
        },
        tags: [tags.Qna]
    }),
    validator(
        "param",
        type({
            author: "string"
        })
    ),
    async (c) => {
        const { author } = c.req.valid("param");
        const { ok, error, result } = await trycatch(
            selectSlimQuestion()
                .where(eq(questions.author, author))
        )
        if (!ok) {
            return c.status(500);
        }
        return c.json(result);
    }
);

qnas.get(
    "/recent",
    describeRoute({
        description: "Get the Q&A with the given ID",
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
    }
);

export default qnas;
