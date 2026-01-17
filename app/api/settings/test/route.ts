import Cashmere from "@/lib/cashmere";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { service, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    switch (service) {
      case 'cashmereApiKey': {
        // Test Cashmere API by making a minimal request
        const cash = new Cashmere(apiKey);
        await cash.listOmnipubs({ limit: 1 });
        return NextResponse.json({
          success: true,
          message: 'Successfully connected to Cashmere API',
        });
      }

      case 'openaiApiKey': {
        // Test OpenAI API by listing models
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error?.message || 'Invalid OpenAI API key');
        }

        return NextResponse.json({
          success: true,
          message: 'Successfully connected to OpenAI API',
        });
      }

      case 'elevenLabsApiKey': {
        // Test ElevenLabs API by getting user info
        const response = await fetch('https://api.elevenlabs.io/v1/user', {
          headers: { 'xi-api-key': apiKey },
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.detail?.message || 'Invalid ElevenLabs API key');
        }

        return NextResponse.json({
          success: true,
          message: 'Successfully connected to ElevenLabs API',
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown service: ${service}` },
          { status: 400 }
        );
    }
  } catch (e) {
    console.error('API key test failed:', e);
    return NextResponse.json(
      { success: false, error: (e as Error).message },
      { status: 400 }
    );
  }
}
