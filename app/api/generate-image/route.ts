import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { photoBase64, userName, archetype, tagline } = await request.json();

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google API key not configured" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build the image prompt similar to the Content Engineer Performance Lab
    let imagePrompt = `Design a front-facing vintage trading card (1990s aesthetic).

CARD LAYOUT:
- Top banner: Dark green (#0D3D1F) with text "${userName.toUpperCase()}'S CONTENT TEAM" in small caps and "WINS AI SEARCH" in bold white below
- Main image area: Portrait in stipple/hedcut black & white style against mint green (#4ADE80) background
- Bottom section: White area with archetype "THE ${archetype.toUpperCase()}" and tagline "${tagline}"
- Footer: Dark green bar with "airOps" logo and "airops.com/win"

STYLE:
- 1990s trading card aesthetic
- Clean, professional sports card design
- Bold typography
- High contrast stipple portrait`;

    const contentsParts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [];

    // If user provided a photo, include it as reference
    if (photoBase64) {
      // Remove data URL prefix if present
      const base64Data = photoBase64.includes(',')
        ? photoBase64.split(',')[1]
        : photoBase64;

      contentsParts.push({
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        }
      });

      imagePrompt += `

REFERENCE IMAGE INSTRUCTIONS:
- Use the provided photo as reference for the portrait
- Transform it into a BLACK & WHITE STIPPLE/HEDCUT illustration style
- Maintain the person's likeness and features
- Professional, heroic pose
- Clean background in mint green`;
    } else {
      imagePrompt += `

SUBJECT: Generate a heroic character silhouette or abstract portrait in stipple style.
Use a placeholder initial "${userName.charAt(0).toUpperCase()}" if no face is needed.`;
    }

    contentsParts.push({ text: imagePrompt });

    // Generate image using Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Using available model
      contents: [{ role: 'user', parts: contentsParts }],
      generationConfig: {
        responseModalities: ['image', 'text'],
      } as Record<string, unknown>,
    });

    // Extract image from response
    let imageUrl: string | null = null;

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if ('inlineData' in part && part.inlineData?.data) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (imageUrl) {
      return NextResponse.json({ imageUrl });
    } else {
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image generation failed" },
      { status: 500 }
    );
  }
}
