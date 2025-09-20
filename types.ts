
export enum HistoryItemType {
  COMMAND = 'COMMAND',
  OUTPUT = 'OUTPUT',
  SYSTEM = 'SYSTEM',
  ERROR = 'ERROR'
}

export interface HistoryItem {
  id: number;
  type: HistoryItemType;
  text: string;
}
