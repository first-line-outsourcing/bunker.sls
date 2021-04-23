import { errorHandler } from '@helper/error-handler';
import { log } from '@helper/logger';
import { apigwManagement } from '@services/websocket-endpoint.service';
import { ConnectionPlayer, ReconnectionPlayer, Vote, DiscussData } from './player.interface';
import { PlayerManager } from './player.manager';

exports.connect = async (event, context) => {
  try {
    /**
     * Create the manager object
     */
    const manager = new PlayerManager();

    /**
     * Prepare required data
     */

    return manager.connectPlayer();
  } catch (e) {
    /**
     * Handle all errors
     */
    errorHandler(e);
  }
};

exports.join = async (event, context) => {
  try {
    /**
     * Create the manager object
     */
    const manager = new PlayerManager();

    /**
     * Prepare required data
     */

    const connectionPlayer: ConnectionPlayer = {
      connectionId: event.requestContext.connectionId,
    };

    if (!event.body) return 'body is empty!';

    connectionPlayer.body = JSON.parse(event.body);
    return manager.joinPlayer(connectionPlayer);
  } catch (e) {
    /**
     * Handle all errors
     */
    errorHandler(e);
  }
};

exports.reconnect = async (event, context) => {
  try {
    /**
     * Create the manager object
     */
    const manager = new PlayerManager();

    /**
     * Prepare required data
     */

    if (!event.body) return 'body is empty!';

    const body = JSON.parse(event.body);

    const reconnectionPlayer: ReconnectionPlayer = {
      connectionId: event.requestContext.connectionId,
      playerId: body.playerId,
    };

    return manager.reconnectPlayer(reconnectionPlayer);
  } catch (e) {
    /**
     * Handle all errors
     */
    errorHandler(e);
  }
};

exports.disconnect = async (event, context) => {
  try {
    /**
     * Create the manager object
     */
    const manager = new PlayerManager();

    /**
     * Prepare required data
     */

    return manager.disconnectPlayer(event.requestContext.connectionId);
  } catch (e) {
    /**
     * Handle all errors
     */
    errorHandler(e);
  }
};

exports.defaults = async (event, context) => {
  return await {
    statusCode: 200,
  };
};

exports.sendVote = async (event, context) => {
  try {
    /**
     * Create the manager object
     */
    const manager = new PlayerManager();

    /**
     * Prepare required data
     */

    const vote: Vote = {
      connectionId: event.requestContext.connectionId,
    };

    if (!event.body) return 'body is empty!';

    vote.playerOnVote = JSON.parse(event.body);
    return manager.sendVote(vote);
  } catch (e) {
    /**
     * Handle all errors
     */
    errorHandler(e);
  }
};

exports.endDiscuss = async (event, context) => {
  try {
    /**
     * Create the manager object
     */
    const manager = new PlayerManager();

    /**
     * Prepare required data
     */

    const discussData: DiscussData = {
      connectionId: event.requestContext.connectionId,
    };

    return manager.endDiscuss(discussData);
  } catch (e) {
    /**
     * Handle all errors
     */
    errorHandler(e);
  }
};
