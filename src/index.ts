import { apiReference } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import { getContext } from "hono/context-storage";
import api from "./routes/api";
import internal from "./routes/internal";

const app = new Hono<{ Bindings: Env }>();

app.route("/internal", internal);
app.route("/api", api);

const { env } = getContext<{ Bindings: Env }>();
const remote = env.ENVIRONMENT === "production"
	? { url: "https://api.qnapl.us", description: "Production Server" }
	: { url: "https://dev.api.qnapl.us", description: "Development Server" };

const servers = [
	{ url: "http://localhost:3000", description: "Local Server" },
	remote
];

app.get(
	"/openapi",
	openAPISpecs(internal, {
		documentation: {
			info: {
				title: "qnaplus",
				version: "1.0.0",
				description: "API for interacting with Q&A related resources.",
			},
			servers,
		},
	})
)

app.get(
	"/docs",
	apiReference({
		theme: "saturn",
		spec: { url: "/openapi" },
	})
);

export default app