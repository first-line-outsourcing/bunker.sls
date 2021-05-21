import { errorHandler } from '@helper/error-handler';
import { log } from '@helper/logger';
import { postToAllPlayersData, postToPlayer } from '@services/websocket/websocket-endpoint.service';
import { PostData } from '@services/websocket/websocket-postData.interface';
import { GameData } from './game.interface';
import { GameManager } from './game.manager';

exports.createGame = async (event, context) => {
  log(event);

  try {
    const manager = new GameManager();

    const data = JSON.parse(event.body);

    const gameData: GameData = data.body;

    console.log(gameData);

    const postData: PostData = await manager.createGame(gameData);
    return postToPlayer(event.requestContext.connectionId, postData);
  } catch (e) {
    /**
     * Handle all errors
     */
    errorHandler(e);
  }
};

exports.deleteGame = async (event, context) => {};

exports.startGame = async (event, context) => {
  log(event);

  try {
    const manager = new GameManager();

    const connectionId = event.requestContext.connectionId;
    const postData: PostData = await manager.startGame(connectionId);
    return postToPlayer(connectionId, postData);
  } catch (e) {
    /**
     * Handle all errors
     */
    errorHandler(e);
  }
};

exports.updateStatus = async (event, context) => {
  log(event);

  try {
    const manager = new GameManager();

    const connectionId = event.requestContext.connectionId;

    console.log(connectionId);
    return await manager.updateStatus(connectionId);
  } catch (e) {
    /**
     * Handle all errors
     */
    errorHandler(e);
  }
};
