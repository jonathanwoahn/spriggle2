import Cashmere from "@/lib/cashmere";
import { db } from "@/db";
import { omnipubs, appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources";


const systemPrompt = `
Generate a brief summary of the book provided by the user. Provide your response in markdown.

The summary should follow this format:

### Summary

"Charlotte's Web" is a timeless classic that tells the heartwarming story of a young pig named Wilbur and his unlikely friendship with Charlotte, a wise and gentle spider. When Wilbur is faced with the grim prospect of being slaughtered, Charlotte devises a plan to save his life. She spins extraordinary webs with words like "Some Pig" and "Terrific," turning Wilbur into a local celebrity and ensuring his safety.

Set on a small farm, the story explores themes of friendship, loyalty, and the cycle of life. With its richly drawn characters, including Fern, the compassionate girl who first saves Wilbur, and the lovable but self-centered rat, Templeton, *Charlotte's Web* is a poignant tale that has touched the hearts of generations.

#### Key Highlights

- A beloved story about the power of friendship and selflessness.
- Beautifully illustrated by Garth Williams, adding charm to the narrative.
- Winner of the Newbery Honor and other literary accolades.
- Frequently included in school curriculums as a classic work of children's literature.

#### Why It's Special

*Charlotte's Web* is a masterful blend of humor, heart, and profound life lessons, making it a must-read for children and adults alike. Its enduring appeal lies in its ability to tackle deep themes in a way that is accessible to young readers.

This story is a celebration of the extraordinary found in the ordinary, reminding readers of the beauty of kindness and the importance of standing up for those we care about.

#### Who It's For

*Charlotte's Web* is perfect for:

- Kids who love animals and heartwarming tales of friendship.
- Young readers who enjoy stories with inspiring messages and life lessons.
- Families looking for a book to share and discuss together.
- Teachers and educators seeking a classic story to include in their curriculum.
- Adults nostalgic for a timeless tale that resonates across generations.
`;

// Creates a summary of a specific book
export const POST = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  // Get API keys from database
  const [cashmereKeySetting, openAiKeySetting] = await Promise.all([
    db.select().from(appSettings).where(eq(appSettings.key, 'cashmereApiKey')).limit(1),
    db.select().from(appSettings).where(eq(appSettings.key, 'openAiApiKey')).limit(1),
  ]);

  const cashmereApiKey = cashmereKeySetting[0]?.value;
  const openAiApiKey = openAiKeySetting[0]?.value;

  if (!cashmereApiKey) {
    return NextResponse.json({ error: 'Cashmere API key not configured' }, { status: 500 });
  }
  if (!openAiApiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  const cash = new Cashmere(cashmereApiKey);
  const book = await cash.getBook(id);

  if (!book.data.nav) {
    throw new Error("Book has no sections");
  }

  let text = '';

  try {
    for (let i = 0; i < book.data.nav.length; i++) {
      const order = book.data.nav[i].order;
      const blocks = await cash.getSectionBookBlocks(id, `${order}`);
      text += blocks.map((block: any) => block.properties.text).join(' ');
    }
  } catch (e) {
    throw new Error((e as Error).message);
  }

  const openai = new OpenAI({ apiKey: openAiApiKey });

  const openaiReq: ChatCompletionCreateParamsNonStreaming = {
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    model: 'gpt-4o',
  };

  const response = await openai.chat.completions.create(openaiReq);
  const summary = response.choices[0].message.content as string;

  // Store summary in omnipubs table
  await db
    .update(omnipubs)
    .set({
      summary,
      updatedAt: new Date(),
    })
    .where(eq(omnipubs.uuid, id));

  return NextResponse.json({ summary });
}
