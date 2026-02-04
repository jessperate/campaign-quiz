import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userName, archetype, tagline } = await request.json();

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google API key not configured. Please add GOOGLE_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build the image prompt
    const imagePrompt = `Create a vintage 1990s trading card design.

EXACT LAYOUT:
- Dark green (#0D3D1F) header banner at top with:
  - Small text: "${userName.toUpperCase()}'S CONTENT TEAM"
  - Large bold white text: "WINS AI SEARCH"
- Main portrait area: A professional stipple/hedcut style black and white illustration of a person against mint green (#4ADE80) background
- White bottom section with:
  - "THE ${archetype.toUpperCase()}" in bold
  - "${tagline}" in italic
- Dark green footer with "airOps" branding

STYLE: 1990s sports trading card, clean design, stipple portrait art style, professional.`;

    // Try different model names for image generation
    // Gemini 2.0 Flash experimental with image output
    const modelNames = [
      'gemini-2.0-flash-exp-image-generation',
      'gemini-2.0-flash-thinking-exp',
      'imagen-3.0-generate-001',
      'imagegeneration@006',
    ];

    let lastError = '';

    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: imagePrompt,
          config: {
            responseModalities: ['image', 'text'],
          },
        });

        // Extract image from response
        if (response.candidates && response.candidates.length > 0) {
          const candidate = response.candidates[0];
          if (candidate.content?.parts) {
            for (const part of candidate.content.parts) {
              if (part.inlineData?.mimeType?.startsWith('image/')) {
                const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                return NextResponse.json({ imageUrl, modelUsed: modelName });
              }
            }
          }
        }
      } catch (e) {
        lastError = String(e);
        console.log(`Model ${modelName} failed: ${lastError}`);
        continue;
      }
    }

    // If all models fail, list available models
    try {
      const modelsResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      const modelsData = await modelsResponse.json();
      return NextResponse.json({
        error: "No image generation model worked",
        lastError,
        availableModels: modelsData.models?.map((m: { name: string; supportedGenerationMethods: string[] }) => ({
          name: m.name,
          methods: m.supportedGenerationMethods
        }))
      }, { status: 500 });
    } catch {
      return NextResponse.json({
        error: "No image generation model worked",
        lastError
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Image generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Image generation failed";

    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}
