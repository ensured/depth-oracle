import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY_ADA_TA_3 || process.env.GROQ_API_KEY,
});

export async function getAIAnalysis(prompt: string) {
  const completion = await groq.chat.completions.create({
    model: "compound-beta-mini", // Using 70b for better reasoning
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1024,
  });
  return completion.choices[0].message.content;
}
