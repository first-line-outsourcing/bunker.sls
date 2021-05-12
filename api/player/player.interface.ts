/**
 * This file should contain all required interfaces for the feature
 */

export interface ConnectionPlayer {
  connectionId: string;
  body?: {
    name: string;
    link: string;
  };
}

export interface ReconnectionPlayer {
  connectionId: string;
  playerId: string;
}

export interface Vote {
  connectionId: string;
  playerOnVote?: string;
}

export interface DiscussData {
  connectionId?: string;
}
