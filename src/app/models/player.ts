import { Card } from './card';

export interface ConnectionPlayer {
    name: string;
    link: string;
}

// TODO на бэке надо будет отсылать отдельного данные игрока клиента
export interface ActivePlayer {
  name: string;
  isShow?: boolean;
  isEndDiscuss?: boolean;
  selectedPlayer?: string;
  voteOnYourself?: boolean;
  banVotingAgainPlayer?: string;
  banVoteOnThisPlayer?: boolean;
  skipHisVote?: boolean;
  multiVote?: boolean;
  multiVoteOnPlayer?: string;
  cards?: Card[];
}

export interface AnotherPlayer {
  name: string;
  isShow?: boolean;
  isEndDiscuss?: boolean;
  selectedPlayer?: string;
  voteOnYourself?: boolean;
  banVotingAgainPlayer?: string;
  banVoteOnThisPlayer?: boolean;
  skipHisVote?: boolean;
  multiVote?: boolean;
  multiVoteOnPlayer?: string;
  cards?: Card[];
}

