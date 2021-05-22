import { sendUpdatePlayerCard } from '@services/cards-functions/sendFunctions';
import { updateCardData } from '@services/queries/playerDeck.queries';
import { findCardById } from '@services/queries/card.queries';
import * as PlayerQueryes from '@services/queries/player.queries';
import * as GameQueryes from '@services/queries/game.queries';
import { makeErrorData, makePostData } from '@services/websocket/websocket-makePostData';
import { sendExcusePlayers } from '../game/round';
import { PlayerCardData } from './playerDeck.interface';

export class PlayerDeckService {
  async updateCard(playerCardData: PlayerCardData, connectionId: string) {
    const player = await PlayerQueryes.findPlayerByConnectionId(connectionId);
    if (!player) return makeErrorData('Player not found');
    //Checking player show in this round or not;
    if (player.isShow) return makeErrorData('You cannot showing in this round');

    const game = await GameQueryes.read(player.gameId);
    if (!game) return makeErrorData('Game not found');
    if (game.statusOfRound != 'excuse') return makeErrorData('You cannot showing in this time');

    //Checking of type card;
    const card = await findCardById(playerCardData.cardId);
    if (!card) return makeErrorData('Card not found');

    if (card.type == game.typeCardOnThisRound || game.typeCardOnThisRound == 'none') {
      await updateCardData(playerCardData.cardId, player.playerId, true, false);
      await sendUpdatePlayerCard(game.id, playerCardData.cardId, player.playerId);
      //SET active player
      await PlayerQueryes.updateIsShow(player.playerId, true);
      await sendExcusePlayers(game.id);
      return makePostData('YOU_SHOW_CARD');
    }
    return makeErrorData('Is Wrong Type of Card');
  }
}
