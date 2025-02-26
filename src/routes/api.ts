import { Hono } from 'hono';

const api = new Hono<{ Bindings: Env }>();

export default api;
