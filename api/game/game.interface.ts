export interface GameData {
  purpose: boolean;
  mode: boolean;
  amountPlayers: number;
  timeOnVote?: number;
  timeOnExcuse?: number;
  timeOnDiscuss?: number;
  link: string;
  amountDangers?: number;
  amountSpecialConditions?: number;
}
