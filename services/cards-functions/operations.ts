import { giveCardsToGame } from '@services/cards-functions/gameDeck';
import { giveCardsToPlayers } from '@services/cards-functions/playerDeck';
import { findAllCards } from '@services/queries/card.queries';
import { findAllCardOfIsShow as findGameIsShowCards } from '@services/queries/gameDeck.queries';
import * as PlayerQueryes from '@services/queries/player.queries';
import {
  findAllCardOfIsShow as findPlayerIsShowCards,
  findAllCardWithIsShowByPlayerId,
} from '@services/queries/playerDeck.queries';
import { PostCardData } from '@services/websocket/websocket-postData.interface';

export async function giveStartCards(gameId) {
  await giveCardsToPlayers(gameId);
  await giveCardsToGame(gameId);
}

export async function makeGameCardsData(gameId) {
  const cards = await findGameIsShowCards(gameId, true);
  const cardsData = await findAllCards(cards);
  const postGameCards: PostCardData[] = [];
  cardsData.forEach((value) => {
    postGameCards.push(value);
  });
  return postGameCards;
}

export async function makePlayersCardsData(playersData) {
  //find and get cards for each player
  for (const value of playersData) {
    //find all cardId with isShow = true
    const cards = await findPlayerIsShowCards(value.playerId, true);
    //find all cards by id
    const cardsData = await findAllCards(cards);
    //put all cards
    const postPlayerCards: PostCardData[] = [];
    cardsData.forEach((value) => {
      postPlayerCards.push(value);
    });
    value.cards = postPlayerCards;
  }
  return playersData;
}

export async function makeActivePlayerCardsData(playerId) {
  //find all cardId with IsShow
  const activePlayerCards = await findAllCardWithIsShowByPlayerId(playerId);
  //find all cards by id
  const cardsId: number[] = activePlayerCards.map((value) => value.cardId);
  const activePlayerCardsData = await findAllCards(cardsId);
  //put all cards
  const activePlayerPostCardData: PostCardData[] = [];
  activePlayerCardsData.forEach((value, index) => {
    const card: PostCardData = {
      id: value.id,
      type: value.type,
      name: value.name,
      description: value.description,
      isShow: activePlayerCards[index].isShow,
    };
    activePlayerPostCardData.push(card);
  });
  return activePlayerPostCardData;
}

export async function updateIsShowForPlayers(gameId, isShow) {
  const players = await PlayerQueryes.findAllPlayers(gameId);
  const playerIdArray = players.map((value) => value.playerId);
  //Set IsShow false for repeat in next round
  await PlayerQueryes.updateIsShow(playerIdArray, isShow);
}
