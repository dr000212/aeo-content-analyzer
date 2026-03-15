import { AnalyzeResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function analyzeURL(url: string): Promise<AnalyzeResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(`${API_URL}/api/v1/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: url,
        options: {
          deep_entity_analysis: false,
          include_ai_recommendations: true,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(
          "Too many requests. Please wait a moment and try again."
        );
      }
      if (response.status === 422) {
        throw new Error("Invalid URL format. Please check and try again.");
      }
      if (response.status >= 500) {
        throw new Error(
          "Analysis failed. The page might be inaccessible or too large."
        );
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(
        (error as { detail?: string }).detail || "Analysis failed"
      );
    }

    return response.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(
        "Analysis is taking longer than expected. Please try again."
      );
    }
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new Error(
        "Unable to connect to the analysis server. Please try again."
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
