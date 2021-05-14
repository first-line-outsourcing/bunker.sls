import { AppError, CommonErrors } from '@helper/app-error';
import { connect } from '@services/sequelize.service';
import * as GameQueryes from '@services/queries/game.queries';
import * as PlayerQueryes from '@services/queries/player.queries';
import { makePostData, makeErrorData } from '@services/websocket/websocket-makePostData';
import { ConnectionPlayer, ReconnectionPlayer, Vote } from './player.interface';
import * as Voting from '../process-logic/voting';

export class PlayerService {
  async connectPlayer() {
    try {
      return 'Connection is succesful';
    } catch (e) {
      return makeErrorData(e.message);
      //throw new AppError(CommonErrors.InternalServerError, e.message);
    }
  }

  async joinPlayer(connectionPlayer: ConnectionPlayer) {
    try {
      // if (!connect()) return makeErrorData('Connection is failed');

      if (!connectionPlayer.body) return makeErrorData('Body is empty');

      const game = await GameQueryes.findGameByLink(connectionPlayer.body.link);

      if (!game) {
        console.log('Game not found');
        return makeErrorData('Game not found.');
      }

      // Check offline players for reconnect

      const offlinePlayers = await PlayerQueryes.findAllOfflinePlayers(game.id);
      if (offlinePlayers) {
        // return offlinePlayers for choosing special player

        console.log(offlinePlayers);
        return makePostData('EXIST_OFFLINE_PLAYERS', offlinePlayers);
      }

      if (game.numRound != -1) return makeErrorData('Game already started and hasnt offline players');

      // Standard create player

      if (await this.createPlayer(connectionPlayer.connectionId, game.id, connectionPlayer.body.name))
        return makePostData('SUCCESS');

      return makeErrorData('Game is full');
    } catch (e) {
      return makeErrorData(e.message);
      // throw new AppError(CommonErrors.InternalServerError, e.message);
    }
  }

  async reconnectPlayer(reconnectionPlayer: ReconnectionPlayer) {
    try {
      if (!connect()) return 'Connection is failed';

      const player = PlayerQueryes.updateConnectionId(reconnectionPlayer.playerId, reconnectionPlayer.connectionId);

      if (player) {
        console.log('Player was reconnected');
        return 'Player was reconnected';
      }
    } catch (e) {
      throw new AppError(CommonErrors.InternalServerError, e.message);
    }
  }

  async disconnectPlayer(connectionId: string) {
    try {
      await PlayerQueryes.updateIsOnline(connectionId);
      await PlayerQueryes.updateSelectedPlayerByConnectionId(connectionId, 'cannot');
    } catch (e) {
      throw new AppError(CommonErrors.InternalServerError, e.message);
    }

    console.log('Player leave game');
    return 'Player leave game';
  }

  async sendVote(vote: Vote) {
    const player = await PlayerQueryes.findPlayerByConnectionId(vote.connectionId);
    if (!player) return 'Player not find';
    const game = await GameQueryes.read(player.gameId);
    if (!game) return 'Game not found';

    if ((await Voting.checkingParametres(player, game, vote)) == 200) {
      //Voting

      await PlayerQueryes.updateSelectedPlayer(player.playerId, vote.playerOnVote);
    }
  }

  async endDiscuss(connectionId: string) {
    await PlayerQueryes.updateIsEndDiscuss(connectionId, true);
    return 'player finished discuss';
  }

  async createPlayer(connectionId, gameId, name) {
    if (this.checkAmountPlayers(gameId)) {
      await PlayerQueryes.create(connectionId, gameId, name);

      //Set Owner
      if ((await PlayerQueryes.countPlayers(gameId)) == 1) {
        await PlayerQueryes.setIsOwner(connectionId);
      }
      console.log('player was created');
      return true;
    }
  }

  async checkAmountPlayers(gameId) {
    const game = await GameQueryes.read(gameId);
    if (!game) return 0;

    return (await PlayerQueryes.countPlayers(gameId)) < game.amountPlayers;
  }
}
