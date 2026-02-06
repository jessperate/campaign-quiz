import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const STIPPLE_PROMPT = `Create a high-resolution stipple engraving portrait in the authentic Wall Street Journal hedcut style. The image must be composed entirely of fine, distinct dark green (hex #001408) dots on a pure white background. Use directional stippling techniques where rows of dots follow the flow of hair and facial contours to define form. Achieve shading strictly through dot density (halftone), creating strong contrast between deep shadows and bright highlights. No solid lines, outlines, or gray washes—only distinct ink dots. The final output should look like a masterful hand-drawn engraving. Color: #001408.`;

export async function POST(request: NextRequest) {
  try {
    const { userName, archetype, tagline, photoBase64, photoUrl } = await request.json();

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google API key not configured. Please add GOOGLE_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Resolve photo data: use base64 directly, or download from URL
    let resolvedPhotoBase64 = photoBase64;
    if (!resolvedPhotoBase64 && photoUrl) {
      try {
        const imageResponse = await fetch(photoUrl);
        if (imageResponse.ok) {
          const arrayBuffer = await imageResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
          resolvedPhotoBase64 = `data:${contentType};base64,${buffer.toString('base64')}`;
        }
      } catch (err) {
        console.error('Failed to download photo from URL:', err);
      }
    }

    // If photo provided, transform to stipple style
    if (resolvedPhotoBase64) {
      // Clean base64 string - remove data URL prefix
      const cleanBase64 = resolvedPhotoBase64.replace(/^data:image\/\w+;base64,/, "");

      // Extract mime type from original
      const mimeMatch = resolvedPhotoBase64.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

      console.log(`Calling Nano Banana Pro with photo (${mimeType}, ${cleanBase64.length} chars)`);

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: STIPPLE_PROMPT,
              },
            ],
          },
          config: {
            imageConfig: {
              imageSize: '1K',
              aspectRatio: '1:1',
            },
          },
        });

        // Extract image from response
        if (response.candidates && response.candidates[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              // Re-attach header for browser display
              const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
              console.log('SUCCESS - stipple image generated');
              return NextResponse.json({
                imageUrl,
                isStippleOnly: true,
              });
            }
          }
        }

        return NextResponse.json({
          error: "No image data found in response",
        }, { status: 500 });

      } catch (error) {
        console.error("Gemini Generation Error:", error);
        return NextResponse.json({
          error: "Stipple generation failed",
          details: String(error),
        }, { status: 500 });
      }
    }

    // No photo - generate full card (fallback)
    const cardPrompt = `Create a vintage 1990s trading card design.
LAYOUT:
- Dark green (#0D3D1F) header: "${userName.toUpperCase()}'S CONTENT TEAM" and "WINS AI SEARCH"
- Main area: Professional stipple illustration of a business person on mint green (#4ADE80) background
- White bottom: "THE ${archetype.toUpperCase()}" and "${tagline}"
- Dark green footer with "airOps" branding
STYLE: 1990s sports trading card, stipple portrait art style.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: cardPrompt }],
        },
        config: {
          imageConfig: {
            imageSize: '1K',
            aspectRatio: '3:4',
          },
        },
      });

      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            return NextResponse.json({
              imageUrl,
              isStippleOnly: false,
            });
          }
        }
      }

      return NextResponse.json({
        error: "No image data found in response",
      }, { status: 500 });

    } catch (error) {
      console.error("Card Generation Error:", error);
      return NextResponse.json({
        error: "Card generation failed",
        details: String(error),
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Request failed", details: String(error) },
      { status: 500 }
    );
  }
}
