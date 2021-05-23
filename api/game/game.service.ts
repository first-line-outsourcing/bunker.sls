import { AppError, CommonErrors } from '@helper/app-error';
import { updateIsShowForPlayers } from '@services/cards-functions/operations';
import { sendUpdatedGameData, sendUpdateGameCard } from '@services/cards-functions/sendFunctions';
import { TimeFactor } from '@services/execByTime.service';
import * as GameQueryes from '@services/queries/game.queries';
import * as PlayerQueryes from '@services/queries/player.queries';
import { makeErrorData, makePostData } from '@services/websocket/websocket-makePostData';
import { GameData } from './game.interface';
import { goToDiscuss, goToEndDiscuss, goToEndVoting, goToExcuse, goToRound, sendExcusePlayers } from './round';

export class GameService {
  async createGame(gameData: GameData) {
    try {
      //if (!connect()) return makeErrorData('Connection is failed');

      const game = await GameQueryes.create(gameData);
      //TODO  обновление статусов и тд и ответ
      if (!game) return makeErrorData('Game wasnt created');

      console.log('Game was created');
      return makePostData('GAME_CREATE');
    } catch (e) {
      return makeErrorData(e.message);
    }
  }

  async startGame(connectionId: string) {
    //TODO  дисконнекты
    try {
      const player = await PlayerQueryes.findPlayerByConnectionId(connectionId);
      if (!player) return makeErrorData('Player has been suspended...');
      if (!player.isOwner) return makeErrorData('You are not owner');

      const game = await GameQueryes.read(player.gameId);
      if (!game) return makeErrorData('Game not found');

      const count = await PlayerQueryes.countPlayers(player.gameId);
      //TODO временно для отладки
      // if (count != game.amountPlayers) return makeErrorData(`Not enough players. Need: ${game.amountPlayers}`);
      console.log('startGoToRound');
      const numRound = game.numRound + 1;
      console.log('numRound', numRound);
      await GameQueryes.updateNumRound(game.id, numRound);
      await goToRound(game.id, numRound, game.amountPlayers);
      await sendUpdatedGameData(game.id);
      return makePostData('GAME_START');
    } catch (e) {
      return makeErrorData(e.message);
    }
  }

  async updateStatus(connectionId: string) {
    const player = await PlayerQueryes.findPlayerByConnectionId(connectionId);
    if (!player) return makeErrorData('player has been found');
    if (!player.isOwner) return makeErrorData('You are not owner');

    const game = await GameQueryes.read(player.gameId);
    if (!game) return makeErrorData('Game not found');

    // Check current status
    //Any case contains function of next case/status
    switch (game.statusOfRound) {
      //Костыль, используется один раз в начале игры после создания, чтобы не создавать отдельные роуты на обновление раунда
      case 'Not Start': {
        //Start Round
        return await goToExcuse(game);
      }
      case 'excuse': {
        return await goToDiscuss(game);
      }
      case 'discuss': {
        return await goToEndDiscuss(game.id);
      }
      case 'end_discuss': {
        //Check amount votes in this round;
        if (game.numVote == 0) {
          await updateIsShowForPlayers(game.id, false);
          await sendUpdatedGameData(game.id);
          return await goToExcuse(game);
        }
        //Standard process
        await GameQueryes.updateStatusOfRound(game.id, 'voting');
        await sendUpdatedGameData(game.id);
        const timeFactor = new TimeFactor();
        setTimeout(async () => {
          const updatedGame = await GameQueryes.read(game.id);
          if (updatedGame?.statusOfRound == 'voting') {
            await goToEndVoting(game.id, game.numVote, game.amountPlayers);
          }
        }, game.timeOnVote * timeFactor.factor);
        return makePostData('START_VOTING');
      }
      case 'voting': {
        return await goToEndVoting(game.id, game.numVote, game.amountPlayers);
      }
      case 'end_voting': {
        const updatedGame = await GameQueryes.read(game.id);
        if (updatedGame?.numVote != 0) {
          return await goToDiscuss(game);
        }
        //START NEW ROUND
        return await goToExcuse(game);
      }

      default: {
        return makeErrorData('Incorrect value');
      }
    }
  }
}
