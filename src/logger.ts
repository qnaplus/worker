import { getContext } from "hono/context-storage";
import pino from "pino";

export const getLoggerInstance = (service: string) => {
    const ctx = getContext<{ Bindings: Env }>();

    return pino({
        base: {

        },
        transport: {
            targets: [
                {
                    target: "pino-loki",
                    options: {
                        batching: true,
                        interval: 5,
                        labels: {
                            service,
                        },
                        host: ctx.env.LOKI_HOST,
                        basicAuth: {
                            username: ctx.env.LOKI_USERNAME,
                            password: ctx.env.LOKI_PASSWORD,
                        },
                    },
                }
            ]
        }
    })
}