import { AppError, CommonErrors } from '@helper/app-error';
import { connect } from '@services/sequelize.service';
import * as GameQueryes from '@services/queries/game.queries';
import * as PlayerQueryes from '@services/queries/player.queries';
import { ConnectionPlayer, ReconnectionPlayer, Vote } from './player.interface';
import * as Voting from '../process-logic/voting';

export class PlayerService {
  async connectPlayer() {
    try {
      return 'Connection is succesful';
    } catch (e) {
      throw new AppError(CommonErrors.InternalServerError, e.message);
    }
  }

  async joinPlayer(connectionPlayer: ConnectionPlayer) {
    try {
      if (!connect()) return 'Connection is failed';

      if (!connectionPlayer.body) return 'body empty';

      const game = await GameQueryes.findGameByLink(connectionPlayer.body.link);

      if (!game) return 'Game not found';

      // Check offline players for reconnect

      const offlinePlayers = await PlayerQueryes.findAllOfflinePlayers(game.id);
      if (offlinePlayers) {
        // return offlinePlayers for choosing special player

        console.log(offlinePlayers);
        return offlinePlayers;
      }

      if (game.numRound != -1) return 'Game is started';

      // Standard create player

      return await this.createPlayer(connectionPlayer.connectionId, game.id, connectionPlayer.body.name);
    } catch (e) {
      throw new AppError(CommonErrors.InternalServerError, e.message);
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
    let online;
    try {
      online = await PlayerQueryes.updateIsOnline(connectionId);
    } catch (e) {
      throw new AppError(CommonErrors.InternalServerError, e.message);
    }

    if (!online) {
      throw new AppError(CommonErrors.BadRequest, "Can't extract media info. Please, check your URL");
    }

    console.log('Player leave game');
    return 'Player leave game';
  }

  async sendVote(vote: Vote) {
    const player = await PlayerQueryes.findPlayerByConnectionId(vote.connectionId);

    const game = await GameQueryes.read(player.gameId);

    if (game.statusOfRound != 'SendingVote') return 'Not yet!';

    //TODO проверки на кучу условий специальных карточек

    if (await PlayerQueryes.updateSelectedPlayer(player.playerId, vote.playerOnVote)) return 'Voting is okay';

    if (await Voting.checkAmountVote(player.gameId)) await Voting.calcVoting(player.gameId);
    //TODO проверка на изгнанных + голосовавших, да и в принципе
  }

  async createPlayer(connectionId, gameId, name) {
    if (this.checkAmountPlayers(gameId)) {
      await PlayerQueryes.create(connectionId, gameId, name);

      //Set Owner
      if ((await PlayerQueryes.countPlayers(gameId)) == 1) {
        await PlayerQueryes.setIsOwner(connectionId);
      }
      console.log('player was created');
      return 'Player has been created';
    } else return 'Game is full';
  }

  async checkAmountPlayers(gameId) {
    const game = await GameQueryes.read(gameId);

    return (await PlayerQueryes.countPlayers(gameId)) < game.amountPlayers;
  }
}
