import { AppError, CommonErrors } from '@helper/app-error';
import { giveStartCards } from '@services/cards-functions/operations';
import * as GameQueryes from '@services/queries/game.queries';
import * as PlayerQueryes from '@services/queries/player.queries';
import { GameData } from './game.interface';

import { connect } from '@services/sequelize.service';

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

      switch (game.numRound) {
        case 0: {
          await giveStartCards(game.id);
          break;
        }
      }

      if (player.isOwner) return await GameQueryes.updateNumRound(player.gameId, game.numRound);
      return 'You are not owner';
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
