import LogEntry from './types/LogEntry';

export class Logger {
  private entries: LogEntry[];

  public constructor() {
    this.entries = [];
  }

  public add(entry: LogEntry): void {
    this.entries.push(entry);
  }

  public getEntries(): typeof this.entries {
    return this.entries;
  }
}
