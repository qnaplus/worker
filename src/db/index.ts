import { drizzle } from "drizzle-orm/postgres-js";
import { getContext } from "hono/context-storage";
import postgres from "postgres";
import { lazy } from "../utils";
import * as schema from "./schema"

const pg = lazy(() => {
    const ctx = getContext<{ Bindings: Env }>();
    return postgres(ctx.env.DB_CONNECTION_URL);
});

export const db = lazy(() => drizzle({ schema, client: pg() }));

