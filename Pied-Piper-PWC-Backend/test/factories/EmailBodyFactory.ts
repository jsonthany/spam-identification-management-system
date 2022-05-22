export default class EmailBodyFactory {
  private lines: string[];
  private boundary: string;

  public constructor(boundary: string) {
    this.lines = [];
    this.boundary = boundary;
  }

  public withTextPlain(textPlain: string) {
    this.lines.push(this.boundary);
    this.lines.push('Content-Type: text/plain; charset=utf-8');
    this.lines.push(textPlain);
    return this;
  }

  // ...add functions for appending other parts of body

  public getBody(): string {
    return this.lines.join('\n');
  }
}
