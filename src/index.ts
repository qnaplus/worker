import { apiReference } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import api from "./routes/api";
import internal from "./routes/internal";
import tags from "./tags";
import { contextStorage } from "hono/context-storage";

const app = new Hono<{ Bindings: Env }>();
app.use(contextStorage());
app.route("/internal", internal);
app.route("/api", api);

app.use(
	"/openapi",
	async (c, next) => {
		const middleware = openAPISpecs(app, {
			documentation: {
				info: {
					title: "qnaplus",
					version: "1.0.0",
					description: "API for interacting with Q&A related resources.",
				},
				servers: [
					{
						url: c.env.ENVIRONMENT === "production"
							? "https://api.qnapl.us"
							: "https://dev.api.qnapl.us",
						description: c.env.ENVIRONMENT === "production"
							? "Production Server"
							: "Development Server"
					}
				],
				tags: [
					{
						name: tags.Internal,
						description: "Endpoints for internal operations."
					},
					{
						name: tags.Rules,
						description: "Endpoints for Game Manual Rules"
					}
				]
			},
		});
		return middleware(c, next);
	}
);

app.get(
	"/docs",
	apiReference({
		theme: "saturn",
		spec: { url: "/openapi" },
	})
);

export default app