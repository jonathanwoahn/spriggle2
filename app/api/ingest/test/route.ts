import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

type TestStep = 'cashmere' | 'elevenlabs' | 'openai' | 'r2';

interface TestResult {
  step: TestStep;
  success: boolean;
  message: string;
  duration: number;
  details?: Record<string, unknown>;
}

/**
 * Test Cashmere API by fetching a book or listing omnipubs
 */
async function testCashmere(bookId?: string): Promise<TestResult> {
  const start = Date.now();

  try {
    const apiKeySetting = await db.select()
      .from(appSettings)
      .where(eq(appSettings.key, 'cashmereApiKey'));

    if (!apiKeySetting.length || !apiKeySetting[0].value) {
      return {
        step: 'cashmere',
        success: false,
        message: 'Cashmere API key not configured',
        duration: Date.now() - start,
      };
    }

    const { default: Cashmere } = await import('@/lib/cashmere');
    const cashmere = new Cashmere(apiKeySetting[0].value);

    if (bookId) {
      // Test fetching a specific book
      const book = await cashmere.getBook(bookId);
      return {
        step: 'cashmere',
        success: true,
        message: `Successfully fetched book: ${book.data.title}`,
        duration: Date.now() - start,
        details: {
          bookId: book.uuid,
          title: book.data.title,
          sections: book.data.nav?.length || 0,
        },
      };
    } else {
      // Test listing omnipubs
      const result = await cashmere.listOmnipubs({ limit: 5 });
      return {
        step: 'cashmere',
        success: true,
        message: `Successfully listed ${result.items.length} of ${result.count} books`,
        duration: Date.now() - start,
        details: {
          totalBooks: result.count,
          sampledBooks: result.items.map(b => ({ uuid: b.uuid, title: b.data?.title })),
        },
      };
    }
  } catch (error) {
    return {
      step: 'cashmere',
      success: false,
      message: error instanceof Error ? error.message : 'Cashmere test failed',
      duration: Date.now() - start,
    };
  }
}

/**
 * Test ElevenLabs API by generating sample audio or listing voices
 */
async function testElevenLabs(voiceId?: string): Promise<TestResult> {
  const start = Date.now();

  try {
    const apiKeySetting = await db.select()
      .from(appSettings)
      .where(eq(appSettings.key, 'elevenLabsApiKey'));

    if (!apiKeySetting.length || !apiKeySetting[0].value) {
      return {
        step: 'elevenlabs',
        success: false,
        message: 'ElevenLabs API key not configured',
        duration: Date.now() - start,
      };
    }

    const { ElevenLabsService } = await import('@/lib/elevenlabs-service');
    const elevenLabs = new ElevenLabsService(apiKeySetting[0].value);

    if (voiceId) {
      // Test TTS with sample text
      const sampleText = 'This is a test of the text to speech system.';
      const audio = await elevenLabs.convert(voiceId, sampleText);

      return {
        step: 'elevenlabs',
        success: true,
        message: `Successfully generated ${audio.length} bytes of audio`,
        duration: Date.now() - start,
        details: {
          voiceId,
          textLength: sampleText.length,
          audioSize: audio.length,
        },
      };
    } else {
      // Test listing voices
      const voices = await elevenLabs.getVoices();
      return {
        step: 'elevenlabs',
        success: true,
        message: `Successfully retrieved ${voices.voices?.length || 0} voices`,
        duration: Date.now() - start,
        details: {
          voiceCount: voices.voices?.length || 0,
          sampleVoices: voices.voices?.slice(0, 5).map(v => ({
            id: v.voiceId,
            name: v.name,
          })),
        },
      };
    }
  } catch (error) {
    return {
      step: 'elevenlabs',
      success: false,
      message: error instanceof Error ? error.message : 'ElevenLabs test failed',
      duration: Date.now() - start,
    };
  }
}

/**
 * Test OpenAI API with summary/embedding generation
 */
async function testOpenAI(testType: 'summary' | 'embedding' = 'embedding'): Promise<TestResult> {
  const start = Date.now();

  try {
    const apiKeySetting = await db.select()
      .from(appSettings)
      .where(eq(appSettings.key, 'openAiApiKey'));

    if (!apiKeySetting.length || !apiKeySetting[0].value) {
      return {
        step: 'openai',
        success: false,
        message: 'OpenAI API key not configured',
        duration: Date.now() - start,
      };
    }

    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: apiKeySetting[0].value });

    if (testType === 'summary') {
      // Test chat completion
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "test successful" in exactly two words.' },
        ],
        max_tokens: 10,
      });

      return {
        step: 'openai',
        success: true,
        message: `Chat completion successful: ${response.choices[0]?.message?.content}`,
        duration: Date.now() - start,
        details: {
          model: response.model,
          usage: response.usage,
        },
      };
    } else {
      // Test embedding generation
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: 'This is a test embedding.',
      });

      return {
        step: 'openai',
        success: true,
        message: `Embedding generated with ${response.data[0]?.embedding.length} dimensions`,
        duration: Date.now() - start,
        details: {
          model: response.model,
          dimensions: response.data[0]?.embedding.length,
          usage: response.usage,
        },
      };
    }
  } catch (error) {
    return {
      step: 'openai',
      success: false,
      message: error instanceof Error ? error.message : 'OpenAI test failed',
      duration: Date.now() - start,
    };
  }
}

/**
 * Test R2 storage with upload/download cycle
 */
async function testR2(): Promise<TestResult> {
  const start = Date.now();

  try {
    const { uploadFile, downloadFile, deleteFile, fileExists } = await import('@/lib/storage');

    const testPath = `_test/health-check-${Date.now()}.txt`;
    const testContent = `Test file created at ${new Date().toISOString()}`;
    const testBuffer = Buffer.from(testContent, 'utf-8');

    // Upload
    await uploadFile(testPath, testBuffer, 'text/plain');

    // Verify exists
    const exists = await fileExists(testPath);
    if (!exists) {
      throw new Error('File not found after upload');
    }

    // Download and verify
    const downloaded = await downloadFile(testPath);
    if (downloaded.toString() !== testContent) {
      throw new Error('Downloaded content does not match uploaded content');
    }

    // Cleanup
    await deleteFile(testPath);

    return {
      step: 'r2',
      success: true,
      message: 'R2 upload/download/delete cycle completed successfully',
      duration: Date.now() - start,
      details: {
        testPath,
        bytesUploaded: testBuffer.length,
        bytesDownloaded: downloaded.length,
      },
    };
  } catch (error) {
    return {
      step: 'r2',
      success: false,
      message: error instanceof Error ? error.message : 'R2 test failed',
      duration: Date.now() - start,
    };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const step = searchParams.get('step') as TestStep | null;
  const bookId = searchParams.get('bookId') || undefined;
  const voiceId = searchParams.get('voiceId') || undefined;
  const testType = searchParams.get('testType') as 'summary' | 'embedding' | undefined;

  if (!step) {
    return NextResponse.json({
      error: 'Missing required parameter: step',
      availableSteps: ['cashmere', 'elevenlabs', 'openai', 'r2'],
      usage: {
        cashmere: '/api/ingest/test?step=cashmere&bookId=<optional>',
        elevenlabs: '/api/ingest/test?step=elevenlabs&voiceId=<optional>',
        openai: '/api/ingest/test?step=openai&testType=<summary|embedding>',
        r2: '/api/ingest/test?step=r2',
      },
    }, { status: 400 });
  }

  let result: TestResult;

  switch (step) {
    case 'cashmere':
      result = await testCashmere(bookId);
      break;
    case 'elevenlabs':
      result = await testElevenLabs(voiceId);
      break;
    case 'openai':
      result = await testOpenAI(testType || 'embedding');
      break;
    case 'r2':
      result = await testR2();
      break;
    default:
      return NextResponse.json({
        error: `Unknown step: ${step}`,
        availableSteps: ['cashmere', 'elevenlabs', 'openai', 'r2'],
      }, { status: 400 });
  }

  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
  });
}
