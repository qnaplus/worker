import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import { contextStorage } from "hono/context-storage";
import { requestId } from "hono/request-id";
import pino, { Logger } from "pino";
import api from "./routes/api";
import internal from "./routes/internal";
import tags from "./tags";
import vars from "./vars";
import { Variables } from "./types";

const app = new Hono<{ Bindings: Env, Variables: Variables }>();
app.use(contextStorage());
app.use(requestId());
app.use(async (c, next) => {
	c.set(
		"logger",
		pino({
			transport: {
				targets: [
					{
						target: "pino-loki",
						options: {
							batching: true,
							interval: 5,
							labels: {
								service: "qnaplus-api"
							},
							host: c.env.LOKI_HOST,
							basicAuth: {
								username: c.env.LOKI_USERNAME,
								password: c.env.LOKI_PASSWORD,
							},
						},
					}
				]
			},
			// browser: {
			// 	formatters: {
			// 		level(label, _number) {
			// 			return { level: label.toUpperCase() };
			// 		},
			// 	},
			// 	write: (o: any) => {
			// 		const { time, level, msg } = o;
			// 		const paddedLevel = level.padEnd(5, ' ');
			// 		const requestId = c.var.requestId;
			// 		console.log(`[${time}] ${paddedLevel} (${requestId}): ${msg}`);
			// 	},
			// },
			timestamp: pino.stdTimeFunctions.isoTime,
		}),
	);
	return await next()
})
app.route("/internal", internal);
app.route("/api", api);

app.use(
	"/openapi",
	async (c, next) => {
		const middleware = openAPISpecs(app, {
			documentation: {
				info: {
					title: vars("SPECS_TITLE"),
					version: "1.0.0",
					description: vars("SPECS_DESCRIPTION"),
					termsOfService: "Don't spam the API!"
				},
				servers: [
					{
						url: vars("SERVER_URL"),
						description: vars("SERVER_DESCRIPTION")
					}
				],
				tags: [
					{
						name: tags.Internal,
						description: "Endpoints for internal operations."
					},
					{
						name: tags.Rules,
						description: "Endpoints for Game Manual related operations"
					},
					{
						name: tags.Qna,
						description: "Endpoints for Q&A related operations"
					},
				]
			},
		});
		return await middleware(c, next);
	}
);

app.get(
	"/docs",
	async (c, next) => {
		const pageTitle = c.env.ENVIRONMENT === "production"
			? "qnaplus API Reference"
			: "qnaplus API Reference [dev]";
		const middleware = Scalar<{ Bindings: Env, Variables: Variables }>({
			pageTitle,
			metaData: {
				title: pageTitle,
				description: vars("SPECS_DESCRIPTION"),
				ogUrl: `${vars("SERVER_URL")}/docs`,
				ogType: "website",
				ogTitle: vars("SPECS_TITLE"),
				ogDescription: vars("SERVER_DESCRIPTION"),
				ogImage: `${vars("SERVER_URL")}/qnaplus.png`,
			},
			theme: "saturn",
			url: "/openapi",
		});
		return await middleware(c, next);
	}
);

export default app