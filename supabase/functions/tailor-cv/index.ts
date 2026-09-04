declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(
    handler: (request: Request) => Response | Promise<Response>
  ): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Only POST requests are supported." }, 405);
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return jsonResponse({ error: "OPENAI_API_KEY is not configured." }, 500);
  }

  let body: {
    cvText?: string;
    job?: {
      title?: string;
      company?: string;
      description?: string;
      responsibilities?: string[];
      requirements?: string[];
    };
  };

  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, 400);
  }

  if (!body.cvText?.trim() || !body.job?.title) {
    return jsonResponse({ error: "CV text and job information are required." }, 400);
  }

  const model = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";
  const job = body.job;
  const jobRequirements = [
    ...(job.requirements || []),
    ...(job.responsibilities || []),
  ].join("\n");

  let aiResponse: Response;

  try {
    aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "You are a professional CV editor. Tailor the CV for the target job without inventing qualifications, employers, dates, or achievements. Preserve truthful details and return only the revised CV text in plain text.",
          },
          {
            role: "user",
            content: `Target role: ${job.title}\nCompany: ${job.company || "Not provided"}\nJob description: ${job.description || "Not provided"}\nResponsibilities and requirements:\n${jobRequirements || "Not provided"}\n\nCandidate CV:\n${body.cvText.trim()}`,
          },
        ],
      }),
    });
  } catch (error) {
    console.error("Could not reach OpenAI:", error);
    return jsonResponse({ error: "Could not reach the AI provider." }, 502);
  }

  if (!aiResponse.ok) {
    const providerError = await aiResponse.text();
    console.error("OpenAI request failed:", providerError);

    let providerMessage = "The AI provider rejected the request.";
    try {
      const parsedError = JSON.parse(providerError);
      providerMessage = parsedError.error?.message || providerMessage;
    } catch {
      // Keep provider responses that are not JSON hidden from the client.
    }

    return jsonResponse({ error: providerMessage }, 502);
  }

  const result = await aiResponse.json();
  const tailoredCv = result.choices?.[0]?.message?.content?.trim();

  if (!tailoredCv) {
    return jsonResponse({ error: "The AI provider returned an empty CV." }, 502);
  }

  return jsonResponse({ tailoredCv });
});
