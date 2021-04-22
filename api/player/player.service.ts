import { AppError, CommonErrors } from '@helper/app-error';
import { findAllPlayers } from '@services/queries/player.queries';
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
    const game = await GameQueryes.read(player.gameId);

    //Check status
    if (game.statusOfRound != 'SendingVote') return 'Not yet!';

    //Check isOut and LastOuted
    if (player.isOut && player.playerId != game.outedPlayerInLastRound) {
      await PlayerQueryes.updateSelectedPlayer(player.playerId, 'cannot');
      return 'You cannot voting';
    }

    //Check banVotingAgainPlayer
    if (player.banVotingAgainPlayer == vote.playerOnVote) return 'Проголосуйте за кого-то другого!';

    //Check voteOnYourself
    if (player.voteOnYourself == true) {
      await PlayerQueryes.updateSelectedPlayer(player.playerId, player.playerId);
      return 'Вы можете голосовать только против себя!';
    }

    //Check skipHisVote
    if (player.skipHisVote == true) {
      await PlayerQueryes.updateSelectedPlayer(player.playerId, 'skip');
      return 'Вы пропускаете это голосование!';
    }

    //Check on banVoteOnThisPlayer
    const choosenPlayer = await PlayerQueryes.findPlayerById(vote.playerOnVote);
    if (choosenPlayer.banVoteOnThisPlayer) return 'You cannot vote on this player';

    //Voting

    await PlayerQueryes.updateSelectedPlayer(player.playerId, vote.playerOnVote);

    //Check amount voting
    const players = await findAllPlayers(player.gameId);

    if ((await Voting.countVotes(players)) != game.amountPlayers) return false;

    const votes = players.map((value) => ({
      playerId: value.playerId,
      selectedPlayer: value.selectedPlayer,
      multiVote: value.multiVote,
    }));

    var counts = {};
    votes.forEach((value) => {
      if (value.selectedPlayer != 'cannot') {
        let i = 1;

        if (value.multiVote) i = i * 2;

        const player = players.find((elem) => elem.playerId == value.selectedPlayer);
        if (player.multiVoteOnPlayer) i = i * 2;

        counts[value.selectedPlayer] = (counts[value.selectedPlayer] || 0) + i;
      }
    });

    //
    //Check amount player with max vote
    //
    let keys = Object.keys(counts);
    let max = counts[keys[0]];
    let listOfMax: string[] = [];

    //Set max
    for (let i = 1; i < keys.length; i++) {
      let value = counts[keys[i]];
      if (value == max) {
        listOfMax.push(keys[i]);
      }
      if (value > max) {
        max = counts[keys[i]];
        listOfMax = [];
        listOfMax.push(keys[i]);
      }
    }

    //Checking
    if (listOfMax.length > 1) {
      for (let el in listOfMax) {
        await PlayerQueryes.updateBanVoteOnThisPlayer(el, true);
      }
      await GameQueryes.update(game.id, 'none', game.numVote - 1);
      return 'Повторное голосование'; //TODO ответ
    }

    await PlayerQueryes.updateIsOut(listOfMax[0], true);
    await GameQueryes.updateOutedPlayerInLastRound(game.id, listOfMax[0]);
    //TODO ответ
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
