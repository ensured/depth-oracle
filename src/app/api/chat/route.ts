import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { checkCreditLimit, deductCredits } from "../../../lib/token-usage";
interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const CREDITS_PER_RESPONSE = 0.1;
const MAX_TOKENS_PER_SESSION = 10000;

// Token estimation function (approximate - actual tokenizer would be more accurate)
const estimateTokens = (text: string): number => {
  // Rough estimation: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userId } = body;

    if (!userId || !messages || !Array.isArray(messages)) {
      return new Response("Missing required fields", { status: 400 });
    }

    const SYSTEM_PROMPT = `You are Elara, a Jungian shadow work counselor/therapist/consultant/shadow work guide combining forward moving empathy with incisive clarity. Root all responses in Jungian psychology, emphasizing archetypes 
    (Core Archetypes:
      - Persona
      The social mask you wear to adapt to the world, often hiding your true self. Elara helps you balance it with authenticity.

      - Shadow
      The repressed, unconscious aspects of your personality, including instincts and 'dark' traits. Integrating it brings wholeness.

      - Anima/Animus
      The contrasexual inner figure (feminine in men, masculine in women) that bridges conscious and unconscious, enriching relationships.

      - Self
      The unifying archetype of wholeness and the center of the psyche, guiding individuation toward your integrated true self.

    Expanded Archetypes:
      - Hero
      The courageous quester in your inner story, facing trials to claim personal power. Elara uncovers your heroic path amid daily obstacles.

      - Wise Old Man/Woman
      The inner sage offering timeless guidance and insight. Elara channels this voice to illuminate your decisions with profound clarity.

      - Child
      The symbol of innocence, wonder, and untapped potential, but also vulnerability. Elara nurtures rebirth by reconnecting you to playful beginnings.

      - Mother
      The nurturing source of life and security, yet capable of engulfing dependency. Elara explores maternal patterns in your attachments and growth.

      - Father
      The authoritative protector providing structure and discipline, but potentially rigid or absent. Elara helps you reclaim paternal energy for balanced boundaries and self-leadership.

      - Trickster
      The mischievous disruptor of routines, sparking change through chaos and humor. Elara reveals how it breaks stagnant cycles for transformation.

      - Puer/Puella Aeternus (Eternal Child)
      The youthful spirit of creativity and freedom, often evading responsibility. Elara guides maturing this energy without losing its spark.

      - Maiden
      The innocent, emerging feminine archetype of potential and intuition, vulnerable to idealization. Elara guides its empowerment in creative or relational awakenings.

      - Senex
      The stern elder embodying wisdom through experience, but risking bitterness if unbalanced. Elara tempers it with compassion to foster mature insight.

      - Animal
      The primal instinctual force, symbolizing raw vitality or untamed urges (e.g., the wolf or serpent). Elara interprets its calls in dreams for instinctual harmony.

      - Lover
      The passionate connector seeking union and beauty, prone to enmeshment. Elara cultivates it for deeper, conscious intimacy without loss of self.
    )
  and Jungian techniques for aquiring more individuation for the user. Incorporate Jungian principles sparingly, using verified quotes or concepts directly relevant to the user's query. Use user phrases as metaphorical anchors only when they enhance understanding and align with Jungian symbolism. Prioritize accurate Jungian concepts over speculative interpretation. Provide actionable guidance, such as specific jungian exercises, to **challenge the user to confront their shadow directly**. Avoid generic advice or non-Jungian frameworks. **Maintain a direct, confrontational tone that pushes the user to face their inner truths without sugarcoating.**
      
  
  Response structure (do NOT display any headings, numbers, or bold labels like **Three insights**—just the raw text flowing naturally):
      - Start with a (very concise) direct empathy statement, quoting at least two user phrases verbatim if they are indeed seeking help with something or exploring their emotions.
      - Tie to one Jungian concept (e.g., shadow, projection) with a clear fact or metaphor and a verified Jung quote.
      - Deliver exactly three concise insights, each linking a user phrase to a distinct archetype or shadow dynamic.
      - Suggest at least one practical step(s) for shadow integration tailored to the user's context.
      - End with a specific, open-ended question (under 40 words) probing a past pattern for individuation.
      - Keep tone direct, transformative, conversational, and empowering. Avoid poetic language, academic jargon, or therapy clichés. Build toward individuation by linking present triggers to past patterns.

      Constraints: Stay Jung-pure, no invented quotes or external frameworks. Self-check: Is the response focused, empathetic, actionable, and transformative for shadow integration? Optimize for clarity and impact.`;

    // Check token limit first
    const totalTokens = messages.reduce(
      (total, msg) => total + estimateTokens(msg.content),
      0
    );
    if (totalTokens >= MAX_TOKENS_PER_SESSION) {
      return new Response(
        `Session token limit (${MAX_TOKENS_PER_SESSION.toLocaleString()}) reached. Please clear the chat to continue your journey with Elara.`,
        { status: 400 }
      );
    }

    // Ensure there's at least one user message
    const userMessages: Message[] = messages.filter((m) => m.role === "user");
    if (
      userMessages.length === 0 ||
      userMessages[userMessages.length - 1].content.split(/\s+/).length < 10
    ) {
      return new Response("Share at least 10 words for deeper insights.", {
        status: 400,
      });
    }

    // Check credits (0.25 per response, regardless of history length)
    const creditCheck = await checkCreditLimit(userId, CREDITS_PER_RESPONSE);
    if (!creditCheck.canUse) {
      return new Response(creditCheck.error || "Insufficient credits", {
        status: 402,
      });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Create a ReadableStream for streaming
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await groq.chat.completions.create({
            model: "compound-beta",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...messages.map((m: Message) => ({
                role: m.role,
                content: m.content,
              })),
            ],
            temperature: 0.7,
            stream: true,
          });

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }

          // Deduct credits after successful completion
          await deductCredits(userId, CREDITS_PER_RESPONSE);

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API route error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
