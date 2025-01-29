import { IOmnibookData } from "omnibook";

export interface IBookData {
  cover_image: string;
  uuid: string;
  data: IOmnibookData;
}

export default class Cashmere {
  private readonly cashmereURL: string = 'https://omnibk.ai';
  private readonly path: string = '/api';
  private readonly version: string = '/v1';
  private headers: Headers = new Headers();
  
  constructor(private readonly cashmereAPIKey: string) {
    this.headers.set('Authorization', `Bearer ${this.cashmereAPIKey}`);
  }

  async getBook(id: string): Promise<{id: string, data: IOmnibookData}> {
    const url: string = `${this.baseURL}/book/${id}`;
    return this.executeRequest(url, 'GET');
  }
  
  async getBookCoverURL(id: string): Promise<string> {
    const url: string = `${this.baseURL}/book/${id}/cover_image`;
    return this.executeRequest(url, 'GET');
  }

  async getBookSection(id: string, order: number, format: 'json' | 'html' = 'json'): Promise<any> {
    const url: string = `${this.baseURL}/book/${id}/section/${order}/${format}`;
    return this.executeRequest(url, 'GET');
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

    return this.executeRequest(url, 'GET');
  }
  
  async listBooks(qry: { search?: string, limit?: number | string, offset?: number | string }): Promise<{ item: IBookData[], count: number}[]> {
    const params = {
      search: qry.search || null,
      limit: qry.limit || 10,
      offset: qry.offset || 0,
    };

    const url: string = `${this.baseURL}/books?search=${params.search}&limit=${params.limit}&offset=${params.offset}`;

    return this.executeRequest(url, 'GET');
  }

  private async executeRequest(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any): Promise<any> {
    const headers = this.headers;
    const response = await fetch(url, { method, headers, body });

    if(!response.ok) {
      throw new Error(`Failed to execute request: ${response.statusText}`);
    }

    return response.json();
  }

  private get baseURL(): string {
    return `${this.cashmereURL}${this.path}${this.version}`;
  }
}