import { vValidator } from '@hono/valibot-validator';
import { and, arrayContains, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver } from 'hono-openapi/valibot';
import { array, object, string } from 'valibot';
import { db } from '../db';
import { metadata as dbMetadata, questions } from '../db/schema';
import { questionSchema } from '../schemas';
import tags from '../tags';
import { trycatch } from '../utils';

const api = new Hono<{ Bindings: Env }>();

api.get(
    "/rules/qnas",
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
        "query",
        object({
            rule: string()
        })
    ),
    async (c) => {
        const { rule } = c.req.valid("query");
        const metadata = await trycatch(
            db().query.metadata
                .findFirst({
                    where: eq(dbMetadata.id, 0)
                })
        );
        if (!metadata.ok || metadata.result === undefined) {
            return c.status(500);
        }
        const { currentSeason } = metadata.result;
        const { error, ok, result } = await trycatch(
            db()
                .select()
                .from(questions)
                .where(
                    and(
                        arrayContains(questions.tags, [rule]),
                        eq(questions.season, currentSeason)
                    )
                )
        );
        if (!ok) {
            return c.text(`${error}`, 500);
        }
        return c.json(result);
    }
)

export default api;
