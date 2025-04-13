import { AgentStance } from '../../types/agents';
import { PolicyWithArea, SentimentType, GroqRequestParams } from './shared-types';

export function generateGroqResponse(params: GroqRequestParams): Promise<string>;
