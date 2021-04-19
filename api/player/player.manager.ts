import { ConnectionPlayer } from './player.interface';
import { ReconnectionPlayer } from './player.interface';
import { PlayerService } from './player.service';

/**
 * It's the feature manager
 * Its methods should implement some feature's functionality
 */
export class PlayerManager {
  private readonly service: PlayerService;

  constructor() {
    this.service = new PlayerService();
  }

  connectPlayer() {
    return this.service.connectPlayer();
  }

  joinPlayer(connectionPlayer: ConnectionPlayer) {
    return this.service.joinPlayer(connectionPlayer);
  }

  reconnectPlayer(reconnectionPlayer: ReconnectionPlayer) {
    return this.service.reconnectPlayer(reconnectionPlayer);
  }

  disconnectPlayer(id) {
    return this.service.disconnectPlayer(id);
  }

  // const apigwManagementApi = apigwManagement(event);
  //
  // await apigwManagementApi.postToConnection( {ConnectionId: connectionId, Data: "Common"}).promise();
  // return {
  //   statusCode: 200,
  //   body: JSON.stringify("What"),
  // }
}
