import { AppError, CommonErrors } from '@helper/app-error';
import * as GameQueryes from '@services/queries/game.queries';
import { findCardOfIsShow, updateIsShow } from '@services/queries/gameDeck.queries';
import * as PlayerQueryes from '@services/queries/player.queries';
import { makeErrorData, makePostData } from '@services/websocket/websocket-makePostData';
import * as Voting from '../process-logic/voting';
import { GameData } from './game.interface';
import { giveStartCards } from '@services/cards-functions/operations';
import { connect } from '@services/sequelize.service';
import { checkNumVoting } from './round';

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
      // throw new AppError(CommonErrors.InternalServerError, e.message);
    }
  }

  async startGame(connectionId: string) {
    //TODO  дисконнекты
    const player = await PlayerQueryes.findPlayerByConnectionId(connectionId);
    if (!player) return 0;
    if (!player.isOwner) return 'You are not owner';

    const game = await GameQueryes.read(player.gameId);
    if (!game) return 0;

    const count = await PlayerQueryes.countPlayers(player.gameId);
    if (count != game.amountPlayers) return 'Where a u players?';

    await this.startRound(game.id, game.numRound, game.amountPlayers);
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
        const players = await PlayerQueryes.findAllPlayers(player.gameId);

        if ((await Voting.countVotes(players)) != game.amountPlayers) return false;

        //calc all voting
        const listOfMax = await Voting.calcVoting(players);

        if (!(await Voting.defineResult(listOfMax, game.id, game.numVote))) return 'повторное голосование';
        //TODO ответ

        await GameQueryes.updateStatusOfRound(game.id, 'sendingVote');
        return 'finished voting';
      }
      case 'sendingVote': {
        await GameQueryes.updateNumRound(game.id, game.numRound++);
        await GameQueryes.updateStatusOfRound(game.id, 'excuse');

        await this.startRound(game.id, game.numRound, game.amountPlayers);
        return 'start new round';
      }
      default: {
        return 'default';
      }
    }
  }

  async startRound(gameId, numRound, amountPlayers) {
    try {
      await GameQueryes.setTypeCardOnThisRound(gameId, 'none');

      switch (numRound) {
        // START GAME
        case 0: {
          await giveStartCards(gameId);
          //TODO ответ
          break;
        }

        case 1: {
          await GameQueryes.setTypeCardOnThisRound(gameId, 'Profession');
          //break;
        }
        case 2:
        case 3:
        case 4:
        case 5: {
          const numVoting = await checkNumVoting(amountPlayers, numRound);
          await GameQueryes.updateNumVote(gameId, numVoting);

          //GameDeck change IsShow for bunker;
          const card = await findCardOfIsShow(gameId, false);
          if (!card) return 0;
          await updateIsShow(card.cardId, gameId, true);
          //TODO ответ
          break;
        }
        case 6: {
          //TODO ответ
          await GameQueryes.destroy(gameId);

          break;
        }
      }
    } catch (e) {
      throw new AppError(CommonErrors.InternalServerError, e.message);
    }
  }
}
