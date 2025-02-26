import { Question } from "@qnaplus/scraper";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import {
    resolver,
    validator as vValidator,
} from "hono-openapi/valibot";
import { array, object, string } from "valibot";
import { questionSchema } from "../schemas";
import { cors } from "hono/cors";

export const internal = new Hono<{ Bindings: Env }>();

internal.use("/*", cors({
    origin: ["https://qnapl.us", "https://dev.qnapl.us"]
}));

internal.get(
    "/update",
    describeRoute({
        description: "Endpoint for checking if clients have the latest database.",
        responses: {
            500: {
                description: "Server Error"
            },
            304: {
                description: "Successful Response - Your client is already up to date."
            },
            200: {
                description: "Successful Response - Your client is outdated",
                content: {
                    "application/json": {
                        schema: resolver(
                            object({
                                version: string(),
                                questions: array(questionSchema)
                            })
                        )
                    }
                }
            }
        }
    }),
    vValidator(
        "query",
        object({
            version: string()
        })
    ),
    async (c) => {
        const query = c.req.valid("query");
        const key = `questions-${c.env.ENVIRONMENT}.json`;
        const obj = await c.env.qnaplus.head(key);
        if (obj === null) {
            return c.status(500)
        }
        const version = obj.customMetadata?.version;
        if (version === undefined) {
            return c.status(500)
        }
        if (query.version === version) {
            return c.status(304);
        }
        const data = await c.env.qnaplus.get(key);
        if (data === null) {
            return c.status(500);
        }
        const questions = await data.json<Question[]>();
        return c.json({ version, questions });
    }
)

export default internal