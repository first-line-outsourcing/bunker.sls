import { errorHandler } from '@helper/error-handler';
import { log } from '@helper/logger';
import { apigwManagement } from '@services/websocket-endpoint.service';
import { GameData } from './game.interface';
import { GameManager } from './game.manager';

exports.createGame = async (event, context) => {
  log(event);

  try {
    const manager = new GameManager();

    const gameData: GameData = JSON.parse(event.body);

    console.log(gameData.link);
    return await manager.createGame(gameData);
  } catch (e) {
    /**
     * Handle all errors
     */
    errorHandler(e);
  }
};

exports.deleteGame = async (event, context) => {};

exports.updateRound = async (event, context) => {
  log(event);

  try {
    const manager = new GameManager();

    const connectionId = event.requestContext.connectionId;

    console.log(connectionId);
    return await manager.updateRound(connectionId);
  } catch (e) {
    /**
     * Handle all errors
     */
    errorHandler(e);
  }
};
