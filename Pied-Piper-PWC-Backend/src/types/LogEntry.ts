export default interface LogEntry {
  id: string;
  timestamp: string;
  operation: string;
  parameters: string[];
  outcome: string;
}
