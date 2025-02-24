import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import {
    resolver,
    validator as vValidator,
} from 'hono-openapi/valibot';

const app = new Hono<{ Bindings: Env }>();

app.get(
    '/',
    describeRoute({
        description: "",
        responses: {
            200: {
                description: 'Successful response',
                content: {
                    'text/plain': { schema: resolver(responseSchema) },
                },
            },
        },
    }),
    vValidator('query', querySchema),
    (c) => {
        const query = c.req.valid('query')
        return c.text(`Hello ${query?.name ?? 'Hono'}!`)
    }
)