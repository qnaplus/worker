import { eq, and, arrayContains } from "drizzle-orm";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { db, selectSlimQuestion } from "../db";
import { questions, metadata as dbMetadata } from "../db/schema";
import { slimQuestionSchema } from "../schemas";
import tags from "../tags";
import { errorString, trycatch } from "../utils";
import { z } from "zod";
import { fetchRules } from "../apis/rules";

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
                        schema: resolver(
                            z.object({
                                rule: z.string(),
                                description: z.string(),
                                link: z.string(),
                                questions: slimQuestionSchema.array()
                            })
                        )
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
        
        const { season: inputSeason } = c.req.valid("query");
        const { rule: inputRule } = c.req.valid("param");
        const [metadataError, metadata] = await trycatch(() =>
            db().query.metadata.findFirst({
                where: eq(dbMetadata.id, 0)
            })
        );
        if (metadataError) {
            return c.text(errorString(metadataError));
        }
        if (!metadata) {
            return c.text("Metadata object is empty.", 500);
        }
        const season = inputSeason ?? metadata.currentSeason;
        const [ruleQuestionsError, ruleQuestions] = await trycatch(() =>
            selectSlimQuestion()
                .where(
                    and(
                        arrayContains(questions.tags, [inputRule]),
                        eq(questions.season, season)
                    )
                )
        );
        if (ruleQuestionsError) {
            return c.text(errorString(ruleQuestionsError), 500);
        }
        const [rulesError, rules] = await trycatch(() => fetchRules(season));
        if (rulesError || rules === null) {
            console.error(`Unable to resolve rule data (${rulesError})`)
            return c.json(ruleQuestions);
        }
        const targetRule = rules.ruleGroups.flatMap(group => group.rules).find(({rule}) => rule === `<${inputRule}>`);
        if (!targetRule) {
            return c.json(ruleQuestions);
        }
        return c.json({
            rule: targetRule.rule,
            description: targetRule.description,
            link: targetRule.link,
            questions: ruleQuestions
        })
    }
);

export default rules;
