import { AppError, CommonErrors } from '@helper/app-error';
import { updateNumVote } from '@services/queries/game.queries';
import * as GameQueryes from '@services/queries/game.queries';
import { findAllPlayers } from '@services/queries/player.queries';
import * as PlayerQueryes from '@services/queries/player.queries';
import * as Voting from '../process-logic/voting';
import { GameData } from './game.interface';
import { giveStartCards } from '@services/cards-functions/operations';
import { connect } from '@services/sequelize.service';
import { startRound } from './round';
import { checkNumVoting } from './round';

export class GameService {
  async createGame(gameData: GameData) {
    try {
      if (!connect()) return 'Connection is failed';

      const game = GameQueryes.create(gameData);
      if (!game) return 'Game wasnt created';

      console.log('Game was created');
      return 'Game was created';
    } catch (e) {
      throw new AppError(CommonErrors.InternalServerError, e.message);
    }
  }

  async updateRound(connectionId: string) {
    try {
      const player = await PlayerQueryes.findPlayerByConnectionId(connectionId);
      if (!player) return 'Player not found';
      if (!player.isOwner) return 'You are not owner';

      const game = await GameQueryes.read(player.gameId);
      if (!game) return 'Error';

      await GameQueryes.updateNumRound(player.gameId, game.numRound);

      switch (
        game.numRound++ //++  - For next round
      ) {
        case 0: {
          await giveStartCards(game.id);
          //TODO response to clients(times, status)
          break;
        }

        case 1:
        //TODO проверка на открытие только профессии
        case 2:
        case 3:
        case 4:
        case 5: {
          const numVoting = await checkNumVoting(game.amountPlayers, game.numRound++);
          await updateNumVote(game.id, numVoting);
          //TODO response data about gameDecks etc.
          await startRound(game.id, numVoting);
          break;
        }
        case 6: {
          //TODO finish game
          break;
        }
      }
    } catch (e) {
      throw new AppError(CommonErrors.InternalServerError, e.message);
    }
  }

  async updateStatus(connectionId: string) {
    const player = await PlayerQueryes.findPlayerByConnectionId(connectionId);
    if (!player) return 0;
    if (!player.isOwner) return 'You are not owner';

    const game = await GameQueryes.read(player.gameId);
    if (!game) return 0;

    //Check current status
    switch (game.statusOfRound) {
      case 'excuse': {
        const count = await PlayerQueryes.countIsEndDiscuss(player.gameId);
        if (count == game.amountPlayers) {
          await GameQueryes.updateStatusOfRound(game.id, 'discuss');
          return 'start discuss';
          //TODO доделать ответы
        }
        return 'not yet';
      }
      case 'discuss': {
        await GameQueryes.updateStatusOfRound(game.id, 'voting');
        return 'start voting';
      }
      case 'voting': {
        //Check amount voting
        const players = await findAllPlayers(player.gameId);

        if ((await Voting.countVotes(players)) != game.amountPlayers) return false;

        //calc all voting
        const listOfMax = await Voting.calcVoting(players);

        if (!(await Voting.defineResult(listOfMax, game.id, game.numVote))) return 'повторное голосование';
        //TODO ответ

        await GameQueryes.updateStatusOfRound(game.id, 'sendingVote');
        return 'finished voting';
      }
      case 'sendingVote': {
        await GameQueryes.updateStatusOfRound(game.id, 'excuse');
        await GameQueryes.updateNumRound(game.id, game.numRound++);
        return 'start new round';
      }
      default: {
        return 'default';
      }
    }
  }
}
