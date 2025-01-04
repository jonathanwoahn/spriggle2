export default class Cashmere {
  private readonly cashmereURL: string = 'https://omnibk.ai';
  private readonly path: string = '/api';
  
  constructor(private readonly cashmereAPIKey: string) {

  }

  async getBookCoverURL(id: string): Promise<string> {
    const url: string = `${this.baseURL}/book/${id}/cover`;

    const headers = {
      'Authorization': `Bearer ${this.cashmereAPIKey}`,
      // 'Content-Type': 'application/json',
    };

    const response = await fetch(url, {method: 'GET', headers});

    if(!response.ok) {
      throw new Error(`Failed to retrieve book coverURL: ${response.statusText}`)
      
    }

    const { cover_image} = await response.json();
    return cover_image;
  }

  private get baseURL(): string {
    return `${this.cashmereURL}${this.path}`;
  }
  
}