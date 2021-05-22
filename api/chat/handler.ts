import { errorHandler } from '@helper/error-handler';
import { log } from '@helper/logger';
import { PostData } from '@services/websocket/websocket-postData.interface';
import { MessageData } from './chat.interface';
import { ChatManager } from './chat.manager';
import { postToPlayer } from '@services/websocket/websocket-endpoint.service';

exports.sendMessage = async (event, context) => {
  log(event);

  try {
    const manager = new ChatManager();

    const data = JSON.parse(event.body);

    const messageData: MessageData = data.body;
    const postData: PostData = await manager.sendMessage(messageData, event.requestContext.connectionId);
    return postToPlayer(event.requestContext.connectionId, postData);
  } catch (e) {
    /**
     * Handle all errors
     */
    errorHandler(e);
  }
};
