import { AppError, CommonErrors } from '@helper/app-error';
import { Game } from '@models/PostgreSQL';
import { giveStartCards, makeGameCardsData, updateIsShowForPlayers } from '@services/cards-functions/operations';
import {
  sendActivePlayersCardData,
  sendUpdatedGameData,
  sendUpdateGameCard,
  TwoIdOfPlayer,
} from '@services/cards-functions/sendFunctions';
import { TimeFactor } from '@services/execByTime.service';
import * as GameQueryes from '@services/queries/game.queries';
import { updateActivePlayer } from '@services/queries/game.queries';
import { findCardOfIsShow, updateIsShow } from '@services/queries/gameDeck.queries';
import * as PlayerQueryes from '@services/queries/player.queries';
import { findAllPlayers, findPlayerById, findPlayerWithIsShowIsOut } from '@services/queries/player.queries';
import { postToAllPlayersData } from '@services/websocket/websocket-endpoint.service';
import { makeErrorData, makePostData } from '@services/websocket/websocket-makePostData';
import { PlayerVotes, PostData, PostExcusePlayerData } from '@services/websocket/websocket-postData.interface';
import * as Voting from '../process-logic/voting';

export function checkNumVoting(amountPlayers, numRound) {
  switch (numRound) {
    case 1: {
      return 2;
    }

    case 2: {
      if (amountPlayers == 4 || amountPlayers == 5 || amountPlayers == 6) {
        return 0;
      }
      if (amountPlayers == 15 || amountPlayers == 16) {
        return 2;
      }
      return 1;
    }

    case 3: {
      if (amountPlayers == 4) {
        return 0;
      }
      if (amountPlayers == 13 || amountPlayers == 14 || amountPlayers == 15 || amountPlayers == 16) {
        return 2;
      }
      return 1;
    }

    case 4: {
      if (
        amountPlayers == 11 ||
        amountPlayers == 12 ||
        amountPlayers == 13 ||
        amountPlayers == 14 ||
        amountPlayers == 15 ||
        amountPlayers == 16
      ) {
        return 2;
      }
      return 1;
    }

    case 5: {
      if (amountPlayers == 4 || amountPlayers == 5 || amountPlayers == 6 || amountPlayers == 7 || amountPlayers == 8) {
        return 1;
      }
      return 2;
    }

    default: {
      return 0;
    }
  }
}

export async function sendExcusePlayers(gameId) {
  //SEND Data how active player and can show cards
  //Choose only player how not outed and not show cards yet
  const player = await findPlayerWithIsShowIsOut(gameId, false, false);
  console.log(player);
  if (!player) {
    await updateActivePlayer(gameId, '');
    await postToAllPlayersData(makePostData('ALL_PLAYERS_EXCUSE'), gameId);
  } else {
    await updateActivePlayer(gameId, player.playerId);
    const playerData: PostExcusePlayerData = { playerId: player.playerId };
    const postData: PostData = makePostData('SEND_EXCUSE_PLAYER', playerData);
    await postToAllPlayersData(postData, gameId);
  }
}

//This function only called on update game round
export async function goToRound(gameId, numRound, amountPlayers) {
  try {
    await GameQueryes.setTypeCardOnThisRound(gameId, 'none');

    switch (numRound) {
      // START GAME
      case 0: {
        await giveStartCards(gameId);
        //Send start game cards
        const gameCards = await makeGameCardsData(gameId);
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
        await sendActivePlayersCardData(collectionIds);
        break;
      }

      case 1: {
        await GameQueryes.setTypeCardOnThisRound(gameId, 'profession');
        // falls through
      }
      case 2:
      case 3:
      case 4:
      case 5: {
        const numVoting = checkNumVoting(amountPlayers, numRound);
        await GameQueryes.updateNumVote(gameId, numVoting);
        //GameDeck change IsShow for bunker;
        const card = await findCardOfIsShow(gameId, false);
        if (!card) return makeErrorData('Game cards not found');
        await updateIsShow(card.cardId, gameId, true);
        await sendUpdateGameCard(gameId, card.cardId);
        break;
      }
      case 6: {
        await GameQueryes.destroy(gameId);
        const postData: PostData = makePostData('GAME_FINISHED');
        await postToAllPlayersData(postData, gameId);
        break;
      }
    }
  } catch (e) {
    throw new AppError(CommonErrors.InternalServerError, e.message);
  }
}

export async function goToEndDiscuss(gameId: string) {
  await GameQueryes.updateStatusOfRound(gameId, 'end_discuss');
  await sendUpdatedGameData(gameId);
  return makePostData('END_DISCUSS');
}

export async function goToEndVoting(gameId: string, numVote: number, amountPlayers) {
  //Check amount voting
  const players = await PlayerQueryes.findAllPlayers(gameId);

  //TODO Временно, так-то должно быть неравно количеству игроков
  if ((await Voting.countVotes(players)) != amountPlayers) return makeErrorData('Not enough players voted');

  //calc all voting
  const listOfMax = await Voting.calcVoting(players);

  const result = await Voting.defineResult(listOfMax, gameId, numVote);
  if (!result) return makePostData('REPEAT_VOTING');
  console.log('Посчитали успешно');
  //TODO сделать нормально, через массив
  const playerOnVote = await findPlayerById(result);
  if (playerOnVote) {
    const player: PlayerVotes = { playerId: playerOnVote.playerId, name: playerOnVote.name };
    await GameQueryes.updateStatusOfRound(gameId, 'end_voting');
    await sendUpdatedGameData(gameId);
    const postData = makePostData('SHOW_RESULT', player);
    await postToAllPlayersData(postData, gameId);
    return makePostData('FINISH_VOTING');
  }
  return makeErrorData('playerOnVote is not found');
}

export async function goToExcuse(game: Game) {
  const numRound = game.numRound + 1;
  await GameQueryes.updateNumRound(game.id, numRound);
  await updateIsShowForPlayers(game.id, false);
  await GameQueryes.updateStatusOfRound(game.id, 'excuse');
  console.log('Алло', numRound);
  await goToRound(game.id, numRound, game.amountPlayers);
  await sendUpdatedGameData(game.id);
  await sendExcusePlayers(game.id);
  return makePostData('START_NEW_ROUND');
}

export async function goToDiscuss(game: Game) {
  const count = await PlayerQueryes.countIsEndExcuse(game.id);
  if (count == game.amountPlayers) {
    await GameQueryes.updateStatusOfRound(game.id, 'discuss');
    await sendUpdatedGameData(game.id);
    const timeFactor = new TimeFactor();
    setTimeout(async () => {
      const updatedGame = await GameQueryes.read(game.id);
      if (updatedGame?.statusOfRound == 'discuss') {
        await goToEndDiscuss(game.id);
      }
    }, game.timeOnDiscuss * timeFactor.factor);
    return makePostData('START_DISCUSS');
  }
  return makeErrorData('Not enough players shows their cards');
}
