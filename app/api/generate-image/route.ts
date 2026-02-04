import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { photoBase64, userName, archetype, tagline } = await request.json();

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

    // Use Imagen 3 for image generation
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '3:4', // Trading card aspect ratio
      },
    });

    // Extract image from response
    if (response.generatedImages && response.generatedImages.length > 0) {
      const image = response.generatedImages[0];
      if (image.image?.imageBytes) {
        const imageUrl = `data:image/png;base64,${image.image.imageBytes}`;
        return NextResponse.json({ imageUrl });
      }
    }

    return NextResponse.json(
      { error: "No image generated", debug: JSON.stringify(response) },
      { status: 500 }
    );
  } catch (error) {
    console.error("Image generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Image generation failed";

    // Check if it's a model not found error and suggest alternatives
    if (errorMessage.includes('not found') || errorMessage.includes('NOT_FOUND')) {
      return NextResponse.json(
        {
          error: "Image generation model not available. The Imagen API may require additional setup or a different API key.",
          details: errorMessage
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
