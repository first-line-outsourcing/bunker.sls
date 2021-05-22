import { AppError, CommonErrors } from '@helper/app-error';
import { giveStartCards, makeGameCardsData } from '@services/cards-functions/operations';
import { sendActivePlayersCardData, sendUpdateGameCard, TwoIdOfPlayer } from '@services/cards-functions/sendFunctions';
import * as GameQueryes from '@services/queries/game.queries';
import { updateActivePlayer } from '@services/queries/game.queries';
import { findCardOfIsShow, updateIsShow } from '@services/queries/gameDeck.queries';
import { findAllPlayers, findPlayerWithIsShow } from '@services/queries/player.queries';
import { postToAllPlayersData } from '@services/websocket/websocket-endpoint.service';
import { makeErrorData, makePostData } from '@services/websocket/websocket-makePostData';
import { PostData, PostExcusePlayerData } from '@services/websocket/websocket-postData.interface';

export function checkNumVoting(amountPlayers, numRound) {
  switch (numRound) {
    case 1: {
      return 0;
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
  const player = await findPlayerWithIsShow(gameId, false);
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
        //TODO ответ
        await GameQueryes.destroy(gameId);

        break;
      }
    }
  } catch (e) {
    throw new AppError(CommonErrors.InternalServerError, e.message);
  }
}
