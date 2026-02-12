import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, uniqueId } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Remove data URL prefix if present (handle all formats)
    const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, '');

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate a unique filename
    const filename = `cards/${uniqueId || Date.now()}.png`;

    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: 'image/png',
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
    }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image', details: String(error) },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
