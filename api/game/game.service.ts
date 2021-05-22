import { AppError, CommonErrors } from '@helper/app-error';
import { sendUpdatedGameData } from '@services/cards-functions/sendFunctions';
import * as GameQueryes from '@services/queries/game.queries';
import * as PlayerQueryes from '@services/queries/player.queries';
import { makeErrorData, makePostData } from '@services/websocket/websocket-makePostData';
import * as Voting from '../process-logic/voting';
import { GameData } from './game.interface';
import { goToRound, sendExcusePlayers } from './round';

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

    //Check current status
    switch (game.statusOfRound) {
      //Костыль, используется один раз в начале игры после создания, чтобы не создавать отдельные роуты на обновление раунда
      case 'Not Start': {
        const numRound = game.numRound + 1;
        await GameQueryes.updateNumRound(game.id, numRound);
        await GameQueryes.updateStatusOfRound(game.id, 'excuse');
        const test = await GameQueryes.read(game.id);
        console.log(test?.numRound);
        await goToRound(game.id, numRound, game.amountPlayers);
        await sendUpdatedGameData(game.id);
        await sendExcusePlayers(game.id);
        return makePostData('START_FIRST_ROUND');
      }
      case 'excuse': {
        const count = await PlayerQueryes.countIsEndDiscuss(player.gameId);
        if (count == game.amountPlayers) {
          await GameQueryes.updateStatusOfRound(game.id, 'discuss');
          //TODO доделать ответы
        }
        return makePostData('START_DISCUSS');
      }
      case 'discuss': {
        await GameQueryes.updateStatusOfRound(game.id, 'voting');
        return makePostData('START_VOTING');
      }
      case 'voting': {
        //Check amount voting
        const players = await PlayerQueryes.findAllPlayers(player.gameId);

        if ((await Voting.countVotes(players)) != game.amountPlayers) return makeErrorData('Not enough players voted');

        //calc all voting
        const listOfMax = await Voting.calcVoting(players);

        if (!(await Voting.defineResult(listOfMax, game.id, game.numVote))) return makePostData('REPEAT_VOTING');
        //TODO ответ

        await GameQueryes.updateStatusOfRound(game.id, 'sendingVote');
        return makePostData('START_SENDING_VOTE');
      }
      case 'sendingVote': {
        await GameQueryes.updateNumRound(game.id, game.numRound++);

        await GameQueryes.updateStatusOfRound(game.id, 'excuse');

        await goToRound(game.id, game.numRound, game.amountPlayers);
        return makePostData('START_NEW_ROUND');
      }
      default: {
        return makeErrorData('Incorrect value');
      }
    }
  }
}
