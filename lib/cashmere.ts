import { IOmnibookData, Omnibook } from "omnibook";

export interface INav {
  label: string;
  order: number;
}

export interface IBookData {
  cover_image: string;
  uuid: string;
  data: {
    title: string;
    subtitle: string;
    cover_image: string;
    creators: string[];
    creation_date: string;
    publisher: string;
    nav: INav[];
  };
}

export default class Cashmere {
  private readonly cashmereURL: string = 'https://omnibk.ai';
  private readonly path: string = '/api';
  private readonly version: string = '/v1';
  private headers: Headers = new Headers();
  
  constructor(private readonly cashmereAPIKey: string) {
    this.headers.set('Authorization', `Bearer ${this.cashmereAPIKey}`);
  }

  // TODO: need to update the response type once we get the omnibook library added
  async getBook(id: string): Promise<{id: string, data: IOmnibookData}> {
    const url: string = `${this.baseURL}/book/${id}`;
    const headers = this.headers;
    const response = await fetch(url, { method: 'GET', headers });

    if(!response.ok) {
      throw new Error(`Failed to retrieve book: ${response.statusText}`);
    }

    return await response.json();
  }
  
  async getBookCoverURL(id: string): Promise<string> {
    const url: string = `${this.baseURL}/book/${id}/cover_image`;
    const headers = this.headers;
    const response = await fetch(url, {method: 'GET', headers});

    if(!response.ok) {
      throw new Error(`Failed to retrieve book coverURL: ${response.statusText}`)
    }

    const data = await response.json();

    return data;
  }

  // TODO: need to update the response type once we get the omnibook library added
  async getBookSection(id: string, order: number, format: 'json' | 'html' = 'json'): Promise<any> {
    const url: string = `${this.baseURL}/book/${id}/section/${order}/${format}`;
    const headers = this.headers;
    const response = await fetch(url, { method: 'GET', headers });

    if(!response.ok) {
      throw new Error(`Failed to retrieve book section: ${response.statusText}`);
    }

    return await response.json();
  }

  async getSectionBookBlocks(id: string, order: string): Promise<any> {
    const processBlock = (block: any, blocks: any[]) => {
      const { children, ...blockData } = block;
      blocks.push(blockData);

      if (children) {
        children.forEach((child: any) => processBlock(child, blocks));
      }

      return blocks;
    }

    
    const section = await this.getBookSection(id, parseInt(order));
    const blocks = processBlock(section, []);

    return blocks;
  }

  async getAllBookBlocks(id: string): Promise<any> {
    const book = await this.getBook(id);
    const nav = book.data.nav;

    if(!nav) return;

    return await Promise.all(nav.map(async (navItem) => {
      const blocks = await this.getSectionBookBlocks(id, navItem.order.toString());
      return {
        navItem,
        blocks,
      };
    }));
  }

  async getBookBlock(bookId: string, blockId: string): Promise<any> {
    const url: string = `${this.baseURL}/book/${bookId}/block/${blockId}`;
    const headers = this.headers;
    const response = await fetch(url, { method: 'GET', headers });

    if (!response.ok) {
      throw new Error(`Failed to retrieve book coverURL: ${response.statusText}`)
    }

    const data = await response.json();

    return data;

  }
  
  async listBooks(qry: { search?: string, limit?: number | string, offset?: number | string }): Promise<{ item: IBookData[], count: number}[]> {
    const params = {
      search: qry.search || null,
      limit: qry.limit || 10,
      offset: qry.offset || 0,
    };

    const url: string = `${this.baseURL}/books?search=${params.search}&limit=${params.limit}&offset=${params.offset}`;
    const headers = this.headers;
    const response = await fetch(url, { method: 'GET', headers });

    if(!response.ok) {
      throw new Error(`Failed to retrieve book list: ${response.statusText}`);
    }
    
    return response.json();
  }

  private get baseURL(): string {
    return `${this.cashmereURL}${this.path}${this.version}`;
  }
}