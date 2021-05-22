import { makeActivePlayerCardsData } from '@services/cards-functions/operations';
import { findCardById } from '@services/queries/card.queries';
import * as GameQueryes from '@services/queries/game.queries';
import { postToAllPlayersData, postToPlayer } from '@services/websocket/websocket-endpoint.service';
import { makePostData } from '@services/websocket/websocket-makePostData';
import { PostCardData, UpdatePlayerCardData } from '@services/websocket/websocket-postData.interface';

export async function sendActivePlayersCardData(connectionIdArray: TwoIdOfPlayer[]) {
  for (const value of connectionIdArray) {
    const cards = await makeActivePlayerCardsData(value.playerId);
    await postToPlayer(value.connectionId, makePostData('SEND_PLAYER_START_CARDS', cards));
  }
}

export async function sendUpdatedGameData(gameId) {
  const updateGame = await GameQueryes.read(gameId);
  if (updateGame) {
    const postData = makePostData('UPDATE_GAME_DATA', updateGame);
    await postToAllPlayersData(postData, updateGame.id);
  }
}
export async function sendUpdateGameCard(gameId, cardId) {
  const cardData = await findCardById(cardId);
  if (cardData) {
    const postCardData: PostCardData = cardData;
    const postData = await makePostData('UPDATE_GAME_CARDS', postCardData);
    await postToAllPlayersData(postData, gameId);
  }
}
//CRINGE
export async function sendUpdatePlayerCard(gameId, cardId, playerId) {
  const cardData = await findCardById(cardId);
  if (cardData) {
    const postCardData: PostCardData = cardData;
    const updatePlayerData: UpdatePlayerCardData = {
      playerId: playerId,
      postCardData: postCardData,
    };
    const postData = await makePostData('UPDATE_PLAYER_CARDS', updatePlayerData);
    await postToAllPlayersData(postData, gameId);
  }
}

export interface TwoIdOfPlayer {
  connectionId: string;
  playerId: string;
}
