import { errorHandler } from '@helper/error-handler';
import { log } from '@helper/logger';
import { postToPlayer } from '@services/websocket/websocket-endpoint.service';
import { PostData } from '@services/websocket/websocket-postData.interface';
import { PlayerDeckManager } from './playerDeck.manager';
import { PlayerCardData } from './playerDeck.interface';

exports.updateCard = async (event, context) => {
  log(event);

  try {
    const manager = new PlayerDeckManager();

    const data = JSON.parse(event.body);
    const playerCardData: PlayerCardData = { cardId: data.body.id };
    const connectionId = event.requestContext.connectionId;
    const postData: PostData = await manager.updateCard(playerCardData, connectionId);
    return postToPlayer(event.requestContext.connectionId, postData);
  } catch (e) {
    /**
     * Handle all errors
     */
    errorHandler(e);
  }
};
