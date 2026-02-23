import express from 'express';
import { clerkWebhooks } from '../controllers/webhooks.js';

const webhooksRouter = express.Router();

webhooksRouter.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhooks);

export default webhooksRouter;
