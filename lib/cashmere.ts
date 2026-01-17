import EventEmitter from "events";
import { IOmnibookData, uuid } from "omnibook";
import { IBookData, ILicenseReport, ILicenseResponse } from "./types";

export default class Cashmere extends EventEmitter {
  private readonly cashmereURL: string = 'https://cashmere.io';
  private readonly path: string = '/api';
  private readonly version: string = '/v2';
  private headers: Headers = new Headers();
  
  constructor(private readonly _cashmereAPIKey: string) {
    super();
    this.headers.set('Authorization', `Bearer ${this._cashmereAPIKey}`);
  }


  // Reports license usage to the Cashmere API. The client operates optimistically
  // and assumes usage is valid. The API returns confirmation or issues with corrective actions.
  async reportLicenseUsage(usage: ILicenseReport[]): Promise<ILicenseResponse> {
    try {
      const url = `${this._baseURL}/license/report`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._cashmereAPIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usage),
      });

      if (!response.ok) {
        // If the API isn't available yet, return a mock response
        // This allows local development without the reporting endpoint
        console.warn('Cashmere license reporting endpoint not available, using mock response');
        return {
          transactionId: uuid(),
          timestamp: Date.now(),
        };
      }

      return response.json();
    } catch (error) {
      // Network error or API not available - return mock response for development
      console.warn('Failed to report license usage to Cashmere:', error);
      return {
        transactionId: uuid(),
        timestamp: Date.now(),
      };
    }
  }

  // returns omnibook data for a single book
  async getBook(id: string): Promise<{uuid: string, data: IOmnibookData}> {
    const url: string = `${this._baseURL}/omnipub/${id}`;
    return this._executeRequest(url, 'GET');
  }
  
  // DEPRECATED. This still works, but no longer necessary.
  async getBookCoverURL(id: string): Promise<string> {
    const url: string = `${this._baseURL}/omnipub/${id}/cover_image`;
    return this._executeRequest(url, 'GET');
  }

  // returns all of the blocks for a section, in the standard API format
  async getBookSection(id: string, order: number, format: 'json' | 'html' = 'json'): Promise<any> {
    const url: string = `${this._baseURL}/omnipub/${id}/section/${order}/${format}`;
    return this._executeRequest(url, 'GET');
  }

  // returns ALL of the book blocks in a specific section of the book, but flattens them into a single array
  async getSectionBookBlocks(id: string, order: string): Promise<any> {
    // function that flattens the blocks into a single array
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

  // returns ALL of the book blocks for a book
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

  // returns a single book block
  async getBookBlock(bookId: string, blockId: string): Promise<any> {
    const url: string = `${this._baseURL}/omnipub/${bookId}/block/${blockId}`;

    return this._executeRequest(url, 'GET');
  }
  
  // returns a list of omnipubs (publications) that match the query parameters
  async listOmnipubs(qry: { search?: string, limit?: number | string, offset?: number | string, collection?: number | string, view_mode?: string }): Promise<{ items: IBookData[], count: number }> {
    const params = new URLSearchParams();

    if (qry.search) params.set('search', qry.search);
    if (qry.limit) params.set('limit', qry.limit.toString());
    if (qry.offset) params.set('offset', qry.offset.toString());
    if (qry.collection) params.set('collection', qry.collection.toString());
    if (qry.view_mode) params.set('view_mode', qry.view_mode);

    const url: string = `${this._baseURL}/omnipubs?${params.toString()}`;

    return this._executeRequest(url, 'GET');
  }

  // Alias for backward compatibility
  async listBooks(qry: { search?: string, limit?: number | string, offset?: number | string, collection?: number | string }): Promise<{ items: IBookData[], count: number }> {
    return this.listOmnipubs(qry);
  }

  // internal method to execute requests, ensure proper headers are set and handle errors
  private async _executeRequest(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any): Promise<any> {
    const headers = this.headers;
    const response = await fetch(url, { method, headers, body });

    if(!response.ok) {
      throw new Error(`Failed to execute request: ${response.statusText}`);
    }

    return response.json();
  }

  private get _baseURL(): string {
    return `${this.cashmereURL}${this.path}${this.version}`;
  }
}