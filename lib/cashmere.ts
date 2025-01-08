import { IOmnibookData, Omnibook } from "omnibook";

export default class Cashmere {
  private readonly cashmereURL: string = 'https://omnibk.ai';
  private readonly path: string = '/api';
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
    const url: string = `${this.baseURL}/book/${id}/cover`;
    const headers = this.headers;
    const response = await fetch(url, {method: 'GET', headers});

    if(!response.ok) {
      throw new Error(`Failed to retrieve book coverURL: ${response.statusText}`)
      
    }

    const { cover_image} = await response.json();
    return cover_image;
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

  // async getOmnibook(id: string): Promise<Omnibook> {

  // }

  private get baseURL(): string {
    return `${this.cashmereURL}${this.path}`;
  }
}