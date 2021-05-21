import { AppError, CommonErrors } from '@helper/app-error';
import { sendActivePlayerCards, TwoIdOfPlayer } from '@services/cards-functions/sendActivePlayerCards';
import * as GameQueryes from '@services/queries/game.queries';
import { findCardOfIsShow, updateIsShow } from '@services/queries/gameDeck.queries';
import { findAllPlayers } from '@services/queries/player.queries';
import * as PlayerQueryes from '@services/queries/player.queries';
import { postToAllPlayersData } from '@services/websocket/websocket-endpoint.service';
import { makeErrorData, makePostData } from '@services/websocket/websocket-makePostData';
import * as Voting from '../process-logic/voting';
import { GameData } from './game.interface';
import { giveStartCards, makeGameCardsData } from '@services/cards-functions/operations';
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
      return makePostData('GAME_CREATED');
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
      await this.goToRound(game.id, numRound, game.amountPlayers);
      return makePostData('GAME_STARTED');
    } catch (e) {
      return makeErrorData(e.message);
    }
  }

  async updateStatus(connectionId: string) {
    const player = await PlayerQueryes.findPlayerByConnectionId(connectionId);
    if (!player) return 0;
    if (!player.isOwner) return makeErrorData('You are not owner');

    const game = await GameQueryes.read(player.gameId);
    if (!game) return makeErrorData('Game not found');

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

        await this.goToRound(game.id, game.numRound, game.amountPlayers);
        return 'start new round';
      }
      default: {
        return 'default';
      }
    }
  }

  //This function only called on update game round
  async goToRound(gameId, numRound, amountPlayers) {
    try {
      await GameQueryes.setTypeCardOnThisRound(gameId, 'none');

      switch (numRound) {
        // START GAME
        case 0: {
          await giveStartCards(gameId);
          console.log('выдали карты');
          //Send start game cards
          const gameCards = await makeGameCardsData(gameId);
          console.log('сделали раз');
          console.log('sending game cards for players');
          await postToAllPlayersData(makePostData('SEND_GAME_START_CARDS', gameCards), gameId);
          //Send start players cards
          const players = await findAllPlayers(gameId);
          //Need for sending data to players
          const collectionIds: TwoIdOfPlayer[] = [];
          players.forEach((value) => {
            collectionIds.push({ connectionId: value.connectionId, playerId: value.playerId });
          });
          console.log('sending players cards for players');
          await sendActivePlayerCards(collectionIds);
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
