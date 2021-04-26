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

exports.startGame = async (event, context) => {
  log(event);

  try {
    const manager = new GameManager();

    const connectionId = event.requestContext.connectionId;

    console.log(connectionId);
    return await manager.startGame(connectionId);
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
