import { Hono } from 'hono';
import qnas from './qnas';
import rules from './rules';

const api = new Hono<{ Bindings: Env }>();

api.route("/qnas", qnas);
api.route("/rules", rules);

export default api;