import { vValidator } from '@hono/valibot-validator';
import { arrayContains } from 'drizzle-orm';
import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver } from 'hono-openapi/valibot';
import { array, object, string } from 'valibot';
import { db } from '../db';
import { questions } from '../db/schema';
import { questionSchema } from '../schemas';
import tags from '../tags';
import { trycatch } from '../utils';

const api = new Hono<{ Bindings: Env }>();

api.get(
    "/rules/qnas/:id",
    describeRoute({
        description: "Get all Q&As tagged with a specific rule",
        responses: {
            500: {
                description: "Server Error"
            },
            200: {
                description: "Successful Response",
                content: {
                    "application/json": {
                        schema: resolver(array(questionSchema))
                    }
                }
            }
        },
        tags: [tags.Rules]
    }),
    vValidator(
        "param",
        object({
            id: string()
        })
    ),
    async (c) => {
        const { id } = c.req.valid("param");
        const { error, ok, result } = await trycatch(
            db()
                .select()
                .from(questions)
                .where(
                    arrayContains(questions.tags, [id])
                )
        );
        if (!ok) {
            return c.text(`${error}`, 500);
        }
        return c.json(result);
    }
)

export default api;
