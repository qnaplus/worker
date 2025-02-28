import { type } from 'arktype';
import { and, arrayContains, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver, validator } from 'hono-openapi/arktype';
import { db } from '../db';
import { metadata as dbMetadata, questions } from '../db/schema';
import { slimQuestionSchema } from '../schemas';
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
                        schema: resolver(slimQuestionSchema)
                    }
                }
            }
        },
        tags: [tags.Rules]
    }),
    validator(
        "query",
        type({
            rule: "string",
            "season?": "string"
        })
    ),
    async (c) => {
        const { season, rule } = c.req.valid("query");
        const metadata = await trycatch(
            db().query.metadata.findFirst({
                where: eq(dbMetadata.id, 0)
            })
        );
        if (!metadata.ok || metadata.result === undefined) {
            return c.status(500);
        }
        const { currentSeason } = metadata.result;
        const { error, ok, result } = await trycatch(
            db()
                .select({
                    id: questions.id,
                    author: questions.author,
                    program: questions.program,
                    title: questions.title,
                    season: questions.season,
                    url: questions.url,
                    tags: questions.tags,
                    askedTimestampMs: questions.askedTimestampMs,
                    answeredTimestampMs: questions.answeredTimestampMs,
                    answered: questions.answered
                })
                .from(questions)
                .where(
                    and(
                        arrayContains(questions.tags, [rule]),
                        eq(questions.season, season ?? currentSeason)
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
