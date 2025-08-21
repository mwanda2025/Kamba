import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-quick-replies.ts';
import '@/ai/flows/respond-to-user-query.ts';
import '@/ai/flows/generate-chat-title.ts';
