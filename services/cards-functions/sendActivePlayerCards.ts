import { makeActivePlayerCardsData } from '@services/cards-functions/operations';
import { postToPlayer } from '@services/websocket/websocket-endpoint.service';
import { makePostData } from '@services/websocket/websocket-makePostData';

export async function sendActivePlayerCards(connectionIdArray: TwoIdOfPlayer[]) {
  for (const value of connectionIdArray) {
    const cards = await makeActivePlayerCardsData(value.playerId);
    await postToPlayer(value.connectionId, makePostData('SEND_PLAYER_START_CARDS', cards));
  }
}

export interface TwoIdOfPlayer {
  connectionId: string;
  playerId: string;
}
