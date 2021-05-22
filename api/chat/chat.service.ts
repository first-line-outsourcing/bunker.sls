import { AppError, CommonErrors } from '@helper/app-error';
import { read } from '@services/queries/game.queries';
import { findPlayerByConnectionId } from '@services/queries/player.queries';
import { connect } from '@services/sequelize.service';
import { postToAllPlayersData } from '@services/websocket/websocket-endpoint.service';
import { makeErrorData, makePostData } from '@services/websocket/websocket-makePostData';
import { PostData } from '@services/websocket/websocket-postData.interface';
import { MessageData } from './chat.interface';

export class ChatService {
  async sendMessage(messageData: MessageData, connectionId: string) {
    //I dont know why its needed, in other is not...
    if (!connect()) return makeErrorData('Connection is failed');
    //
    const player = await findPlayerByConnectionId(connectionId);
    if (!player) return makeErrorData("Player hasn't found");
    const game = await read(player.gameId);
    if (game) {
      if (game.statusOfRound == 'excuse' || game.statusOfRound == 'voting') {
        if (game.activePlayer != player.playerId) {
          return makeErrorData('You cannot sending message now!');
        }
      }
    }
    messageData.name = player.name;
    const postData: PostData = makePostData('SEND_MESSAGE', messageData);
    await postToAllPlayersData(postData, player.gameId);
    return makePostData('MESSAGE_HAS_RECEIVED');
  }
}
