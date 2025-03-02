import { type } from 'arktype';
import { and, arrayContains, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver, validator } from 'hono-openapi/arktype';
import { db, selectSlimQuestion } from '../db';
import { metadata as dbMetadata, questions } from '../db/schema';
import { slimQuestionSchema } from '../schemas';
import tags from '../tags';
import { trycatch } from '../utils';

const api = new Hono<{ Bindings: Env }>();

api.get(
    "/qnas/:id",
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

// authors

api.get(
    "/qnas/from-author",
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

api.get(
    "/qnas/recent",
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

export default api;
