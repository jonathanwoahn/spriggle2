import Cashmere from "@/lib/cashmere";
import { getServerURL } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const keyResponse = await fetch(`${getServerURL()}/api/settings/cashmereApiKey`);
    const keyData = await keyResponse.json();

    if (!keyData || !keyData.value) {
      return NextResponse.json(
        { error: 'Cashmere API key not configured. Please set it in Admin > Settings.' },
        { status: 500 }
      );
    }

    const cash = new Cashmere(keyData.value);
    const searchParams = req.nextUrl.searchParams;

    const searchVal = searchParams.get('search');
    const collectionVal = searchParams.get('collection');

    const qry = {
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
      search: searchVal && searchVal !== 'null' ? searchVal : undefined,
      collection: collectionVal && collectionVal !== 'null' ? collectionVal : undefined,
    };

    const books = await cash.listBooks(qry);

    return NextResponse.json(books);
  } catch (e) {
    console.error('Error fetching books:', e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}