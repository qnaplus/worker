import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
// You can import these for your preferred validation library
import {
    resolver,
    validator as vValidator,
} from 'hono-openapi/valibot'

const app = new Hono()

app.get(
    '/',
    describeRoute({
        description: 'Say hello to the user',
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