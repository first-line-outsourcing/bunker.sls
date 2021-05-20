import { Player } from '@models/PostgreSQL';

export interface PostData {
  status: string;
  body?: {};
}

export interface PostAllData {
  gameData: PostGameData;
  activePlayerData?: PostActivePlayerData;
  playersData: PostPlayerData[];
}

export interface PostGameData {
  game: {
    purpose: boolean;
    mode: boolean;
    amountPlayers: number;
    link: string;
    timeOnVote: number;
    timeOnExcuse: number;
    timeOnDiscuss: number;
    amountDangers: number;
    amountSpecialConditions: number;
  };
  cards?: PostCardData[];
}

export interface PostPlayerData {
  playerId: string;
  name: string;
  isOnline?: boolean;
  isOut?: boolean;
  isShow?: boolean;
  isEndDiscuss?: boolean;
  selectedPlayer?: string;
  voteOnYourself?: boolean;
  banVotingAgainPlayer?: string;
  banVoteOnThisPlayer?: boolean;
  skipHisVote?: boolean;
  multiVote?: boolean;
  multiVoteOnPlayer?: string;
  cards?: PostCardData[];
}

export function setPostPlayerData(player: Player) {
  return {
    playerId: player.playerId,
    name: player.name,
    isOnline: player.isOnline,
    isOut: player.isOut,
    isShow: player.isShow,
    isEndDiscuss: player.isEndDiscuss,
    selectedPlayer: player.selectedPlayer,
    voteOnYourself: player.voteOnYourself,
    banVotingAgainPlayer: player.banVotingAgainPlayer,
    banVoteOnThisPlayer: player.banVoteOnThisPlayer,
    skipHisVote: player.skipHisVote,
    multiVote: player.multiVote,
    multiVoteOnPlayer: player.multiVoteOnPlayer,
  };
}

export interface PostActivePlayerData {
  playerId?: string;
  name?: string;
  isOut?: boolean;
  isShow?: boolean;
  isEndDiscuss?: boolean;
  selectedPlayer?: string;
  voteOnYourself?: boolean;
  banVotingAgainPlayer?: string;
  banVoteOnThisPlayer?: boolean;
  skipHisVote?: boolean;
  multiVote?: boolean;
  multiVoteOnPlayer?: string;
  cards?: PostCardData[];
}

export function setPostActivePlayerData(player: Player) {
  return {
    playerId: player.playerId,
    name: player.name,
    isOut: player.isOut,
    isShow: player.isShow,
    isEndDiscuss: player.isEndDiscuss,
    selectedPlayer: player.selectedPlayer,
    voteOnYourself: player.voteOnYourself,
    banVotingAgainPlayer: player.banVotingAgainPlayer,
    banVoteOnThisPlayer: player.banVoteOnThisPlayer,
    skipHisVote: player.skipHisVote,
    multiVote: player.multiVote,
    multiVoteOnPlayer: player.multiVoteOnPlayer,
  };
}

export interface PostCardData {
  id?: number;
  name: string;
  type: string;
  description: string;
  isShow?: boolean;
}
