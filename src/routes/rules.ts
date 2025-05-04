import { type } from "arktype";
import { eq, and, arrayContains } from "drizzle-orm";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/arktype";
import { db, selectSlimQuestion } from "../db";
import { questions, metadata as dbMetadata } from "../db/schema";
import { slimQuestionSchema } from "../schemas";
import tags from "../tags";
import { trycatch } from "../utils";

const rules = new Hono<{ Bindings: Env }>();

rules.get(
    "/:rule/qnas",
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
                        schema: resolver(slimQuestionSchema.array())
                    }
                }
            }
        },
        tags: [tags.Rules]
    }),
    validator(
        "param",
        type({
            rule: "string",
        })
    ),
    validator(
        "query",
        type({
            season: "string?",
        })
    ),
    async (c) => {
        const { season } = c.req.valid("query");
        const { rule } = c.req.valid("param");
        const [metadataError, metadata] = await trycatch(() =>
            db().query.metadata.findFirst({
                where: eq(dbMetadata.id, 0)
            })
        );
        if (metadataError === null || !metadata) {
            return c.text("", 500);
        }
        const { currentSeason } = metadata;
        const  [queryError, result] = await trycatch(() =>
            selectSlimQuestion()
                .where(
                    and(
                        arrayContains(questions.tags, [rule]),
                        eq(questions.season, season ?? currentSeason)
                    )
                )
        );
        if (queryError) {
            return c.text(`${queryError}`, 500);
        }
        return c.json(result);
    }
);

export default rules;
