/**
 * This file should contain all required interfaces for the feature
 */

export interface ConnectionPlayer {
  connectionId: string;
  body?: {
    action: string;
    name: string;
    link: string;
    isOwner?: boolean;
    isOut?: boolean;
    isUse?: boolean;
    isOnline?: boolean;
    selectedPlayer?: string;
    voteOnYourself?: boolean;
    banVotingAgainPlayer?: string;
    skipHisVote?: boolean;
    multiVote?: boolean;
    multiVoteOnPlayer?: string;
  };
}

export interface ReconnectionPlayer {
  connectionId: string;
  playerId: string;
}
