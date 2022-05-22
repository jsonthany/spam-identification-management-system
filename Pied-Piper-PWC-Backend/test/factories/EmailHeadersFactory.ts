import Random from './Random';

export default class EmailHeadersFactory {
  private headers: Map<string, any>;

  public constructor() {
    const random = new Random();
    this.headers = new Map();

    // RFC 822 mandatory headers
    this.headers.set('date', random.date().toUTCString());
    this.headers.set('from', random.emailAddress());
    this.headers.set('to', random.emailAddress());
  }

  public withDate(date: Date) {
    this.headers.set('date', date.toUTCString());
    return this;
  }

  public withFrom(from: string) {
    this.headers.set('from', from);
    return this;
  }

  public withTo(to: string) {
    this.headers.set('to', to);
    return this;
  }

  public withSubject(subject: string) {
    this.headers.set('subject', subject);
    return this;
  }

  public withAuthenticationResults(spf: boolean, dkim: boolean, dmarc: boolean) {
    let auth: string = `mx.google.com;
      dkim=${dkim ? "pass" : "fail" } header.i=@ubc.ca header.s=s1 header.b=TbbsLwhP;
      spf=${spf ? "pass" : "fail" } (google.com: domain of ubc.systems@ubc.ca designates 142.103.203.6 as permitted sender) smtp.mailfrom=ubc.systems@ubc.ca;
      dmarc=${dmarc ? "pass" : "fail" } (p=NONE sp=NONE dis=NONE) header.from=ubc.ca`
    this.headers.set('authentication-results', auth);
    return this;
  }

  // ...add functions for setting other headers of interest

  public getHeaders(): Map<string, any> {
    return this.headers;
  }
}
