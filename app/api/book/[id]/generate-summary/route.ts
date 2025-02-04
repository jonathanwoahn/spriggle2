import Cashmere from "@/lib/cashmere";
import { IBlockMetadata } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources";


const systemPrompt = `
Generate a brief summary of the book provided by the user. Provide your response in markdown.

The summary should follow this format:

### Summary

“Charlotte’s Web” is a timeless classic that tells the heartwarming story of a young pig named Wilbur and his unlikely friendship with Charlotte, a wise and gentle spider. When Wilbur is faced with the grim prospect of being slaughtered, Charlotte devises a plan to save his life. She spins extraordinary webs with words like “Some Pig” and “Terrific,” turning Wilbur into a local celebrity and ensuring his safety.

Set on a small farm, the story explores themes of friendship, loyalty, and the cycle of life. With its richly drawn characters, including Fern, the compassionate girl who first saves Wilbur, and the lovable but self-centered rat, Templeton, *Charlotte’s Web* is a poignant tale that has touched the hearts of generations.

#### Key Highlights

- A beloved story about the power of friendship and selflessness.
- Beautifully illustrated by Garth Williams, adding charm to the narrative.
- Winner of the Newbery Honor and other literary accolades.
- Frequently included in school curriculums as a classic work of children’s literature.

#### Why It's Special

*Charlotte’s Web* is a masterful blend of humor, heart, and profound life lessons, making it a must-read for children and adults alike. Its enduring appeal lies in its ability to tackle deep themes in a way that is accessible to young readers.

This story is a celebration of the extraordinary found in the ordinary, reminding readers of the beauty of kindness and the importance of standing up for those we care about.

#### Who It's For

*Charlotte’s Web* is perfect for:

- Kids who love animals and heartwarming tales of friendship.
- Young readers who enjoy stories with inspiring messages and life lessons.
- Families looking for a book to share and discuss together.
- Teachers and educators seeking a classic story to include in their curriculum.
- Adults nostalgic for a timeless tale that resonates across generations.
`;

// Creates a summary of a specific book
export const POST = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const baseUrl = req.nextUrl.origin;

  
  const keyResponse = await fetch(`${baseUrl}/api/settings/cashmereApiKey`);
  const { value } = await keyResponse.json();

  const cash = new Cashmere(value);
  const book = await cash.getBook(id);

  if(!book.data.nav) {
    throw new Error("Book has no sections");
  }

  let text = '';

  try {
    for (let i = 0; i < book.data.nav.length; i++ ) {
      const order = book.data.nav[i].order;
      const blocks = await cash.getSectionBookBlocks(id, `${order}`);
      text += blocks.map((block: any) => block.properties.text).join(' ');
    }
  } catch (e) {
    throw new Error((e as Error).message);
  }

  const sb = await createClient();
  const { data, error } = await sb.from('block_metadata').select('*').eq('book_id', id).eq('type', 'book');

  if(error) {
    throw new Error(error.message);
  }

  const openAiKerResponse = await fetch(`${baseUrl}/api/settings/openAiApiKey`);
  const {value: openAiKey} = await openAiKerResponse.json();
  const openai = new OpenAI({ apiKey: openAiKey });

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

  return NextResponse.json({summary});
}