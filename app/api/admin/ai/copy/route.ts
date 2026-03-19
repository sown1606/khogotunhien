import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { getOptionalEnv } from "@/lib/env";
import { logError } from "@/lib/logger";

const aiCopySchema = z.object({
  locale: z.enum(["vi", "en"]).default("vi"),
  targetField: z.string().min(2).max(80),
  prompt: z.string().trim().min(8).max(2000),
  currentText: z.string().max(4000).optional(),
});

type OpenAIResponseContent = {
  type?: string;
  text?: string;
};

type OpenAIResponseOutput = {
  content?: OpenAIResponseContent[];
};

type OpenAIResponsePayload = {
  output_text?: string;
  output?: OpenAIResponseOutput[];
};

function extractOutputText(payload: OpenAIResponsePayload) {
  if (typeof payload.output_text === "string" && payload.output_text.trim().length > 0) {
    return payload.output_text.trim();
  }

  const collected = (payload.output || [])
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === "output_text" || content.type === "text")
    .map((content) => content.text?.trim() || "")
    .filter(Boolean)
    .join("\n")
    .trim();

  return collected;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = aiCopySchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const apiKey = getOptionalEnv("OPENAI_API_KEY");
  const model = getOptionalEnv("OPENAI_MODEL") || "gpt-4.1-mini";

  if (!apiKey) {
    return NextResponse.json(
      { error: "AI is not configured. Please set OPENAI_API_KEY." },
      { status: 400 },
    );
  }

  const systemPrompt =
    parsed.data.locale === "vi"
      ? "Bạn là copywriter cho website bán sản phẩm gỗ cao cấp. Viết rõ ràng, tự nhiên, đúng chính tả tiếng Việt, không lan man, không dùng từ sáo rỗng."
      : "You are a copywriter for a premium wood products storefront. Write concise, natural, conversion-friendly copy.";

  const userPrompt = [
    `Target field: ${parsed.data.targetField}`,
    `Instruction: ${parsed.data.prompt}`,
    parsed.data.currentText ? `Current text: ${parsed.data.currentText}` : null,
    parsed.data.locale === "vi"
      ? "Output yêu cầu: chỉ trả về nội dung cuối cùng, không thêm giải thích."
      : "Output requirement: return final copy only, no explanations.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: systemPrompt }],
          },
          {
            role: "user",
            content: [{ type: "input_text", text: userPrompt }],
          },
        ],
        max_output_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logError("AI copy request failed.", {
        status: response.status,
        response: errorText.slice(0, 1000),
      });
      return NextResponse.json({ error: "AI generation failed." }, { status: 502 });
    }

    const payload = (await response.json()) as OpenAIResponsePayload;
    const outputText = extractOutputText(payload);

    if (!outputText) {
      return NextResponse.json({ error: "AI returned empty content." }, { status: 502 });
    }

    return NextResponse.json({ text: outputText }, { status: 200 });
  } catch (error) {
    logError("AI copy endpoint crashed.", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "AI generation failed." }, { status: 500 });
  }
}

