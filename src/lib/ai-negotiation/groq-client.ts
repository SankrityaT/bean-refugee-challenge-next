import { ChatGroq } from '@langchain/groq';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

export class GroqClient {
  private model: ChatGroq;
  private prompt: ChatPromptTemplate;

  constructor() {
    this.model = new ChatGroq({
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
      model: "mixtral-8x7b-32768"
    });

    this.prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are an AI agent participating in policy negotiations. Your role is {role} with a {stance} stance."],
      ["human", "Consider these policies: {policies}\nHow do you respond based on your role and perspective?"]
    ]);
  }

  async generateResponse(role: string, stance: string, policies: any[]) {
    const chain = this.prompt
      .pipe(this.model)
      .pipe(new StringOutputParser());

    const response = await chain.invoke({
      role,
      stance,
      policies: JSON.stringify(policies)
    });

    return response;
  }
}