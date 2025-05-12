import { eq, and, arrayContains } from "drizzle-orm";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { db, selectSlimQuestion } from "../db";
import { questions, metadata as dbMetadata } from "../db/schema";
import { slimQuestionSchema } from "../schemas";
import tags from "../tags";
import { trycatch } from "../utils";
import { z } from "zod";

const rules = new Hono<{ Bindings: Env }>();

rules.get(
    "/:rule/qnas",
    describeRoute({
        description: "Get all Q&As in the current season tagged with a specific rule",
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
        z.object({
            rule: z.string().openapi({ description: "The rule in shorthand form (e.g., G1)" }),
        })
    ),
    validator(
        "query",
        z.object({
            season: z.string().optional().openapi({ description: "The season to get questions from (e.g., 2022-2023). Defaults to the latest season." }),
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
        const [queryError, result] = await trycatch(() =>
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
