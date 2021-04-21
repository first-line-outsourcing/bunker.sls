import { AppError, CommonErrors } from '@helper/app-error';
import { updateNumVote } from '@services/queries/game.queries';
import * as GameQueryes from '@services/queries/game.queries';
import * as PlayerQueryes from '@services/queries/player.queries';
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

      const game = await GameQueryes.read(player.gameId);

      if (!game) return 'Error';

      if (!player.isOwner) return 'You are not owner';

      await GameQueryes.updateNumRound(player.gameId, game.numRound);

      switch (game.numRound++) {
        case 0: {
          await giveStartCards(game.id);
          //TODO response to clients(times, status)
          break;
        }

        case 1:
        case 2:
        case 3:
        case 4:
        case 5: {
          //TODO check amount Voting in round by amount players
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

  async readGame(gameId) {
    try {
      if (connect()) {
        const game = GameQueryes.read(gameId);

        if (!game) return 'Game not found!';

        return game;
      }
    } catch (e) {
      throw new AppError(CommonErrors.InternalServerError, e.message);
    }
  }

  async updateGame(gameData: GameData) {
    try {
      if (connect()) {
        const game = await GameQueryes.updateCustomization(gameData);

        if (!game) return 'Game not found!';

        return 'Game was updated';
      }
    } catch (e) {
      throw new AppError(CommonErrors.InternalServerError, e.message);
    }
  }

  async deleteGame(gameId: string) {
    try {
      if (connect()) {
        const game = await GameQueryes.destroy(gameId);

        return 'Game was deleted';
      }
    } catch (e) {
      throw new AppError(CommonErrors.InternalServerError, e.message);
    }
  }
}
