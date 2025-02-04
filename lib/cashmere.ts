import { createClient } from "@/utils/supabase/server";
import EventEmitter from "events";
import { IOmnibookData, uuid } from "omnibook";
import { IBookData, ILicenseReport } from "./types";

export default class Cashmere extends EventEmitter {
  private readonly cashmereURL: string = 'https://omnibk.ai';
  private readonly path: string = '/api';
  private readonly version: string = '/v1';
  private headers: Headers = new Headers();
  
  constructor(private readonly _cashmereAPIKey: string) {
    super();
    this.headers.set('Authorization', `Bearer ${this._cashmereAPIKey}`);
  }


  // This method will be used to report the usage of a license to the Cashmere API. In general, the client should operate optimistically
  // in good faith, and assume their usage of the book data is valid. If everything is good, the response from the API will basically be a
  // 200 OK, confirmation of receipt. However, if there are issues, the issues will be returned in the report, along with instruction on what
  // to do. 
  async reportLicenseUsage(usage: ILicenseReport[]): Promise<void | ILicenseResponse> {

    // This implementation is for illustration purposes only. The actual implementation will be done on the Cashmere API
    const sb = await createClient();
    
    // The transactionId should be created by the API.
    const transactionId = uuid();
    
    // this timestamp will be created by the API
    const timestamp = Date.now();
    
    // this should come from the header of the response
    const apiKey = this._cashmereAPIKey;


    const payload = usage.map((report: ILicenseReport) => {
      return {
        block_id: report.blockId,
        transaction_id: transactionId,
        api_key: apiKey,
        license_type: report.licenseType,
        reported_at: timestamp,
        used_at: report.timestamp,
        data: report.data,
      };
    });
    
    
    return {
      transactionId,
      timestamp,
    };
  }

  // returns omnibook data for a single book
  async getBook(id: string): Promise<{id: string, data: IOmnibookData}> {
    const url: string = `${this._baseURL}/book/${id}`;
    return this._executeRequest(url, 'GET');
  }
  
  // DEPRECATED. This still works, but no longer necessary.
  async getBookCoverURL(id: string): Promise<string> {
    const url: string = `${this._baseURL}/book/${id}/cover_image`;
    return this._executeRequest(url, 'GET');
  }

  // returns all of the blocks for a section, in the standard API format
  async getBookSection(id: string, order: number, format: 'json' | 'html' = 'json'): Promise<any> {
    const url: string = `${this._baseURL}/book/${id}/section/${order}/${format}`;
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
    const url: string = `${this._baseURL}/book/${bookId}/block/${blockId}`;

    return this._executeRequest(url, 'GET');
  }
  
  // returns a list of books that match the query parameters
  async listBooks(qry: { search?: string, limit?: number | string, offset?: number | string, collection?: number | string }): Promise<{ item: IBookData[], count: number}[]> {
    const params = new URLSearchParams({
      search: qry.search || '',
      limit: qry.limit?.toString() || '10',
      offset: qry.offset?.toString() || '0',
      collection: qry.collection?.toString() || '',
    });

    const url: string = `${this._baseURL}/books?${params.toString()}`;

    return this._executeRequest(url, 'GET');
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