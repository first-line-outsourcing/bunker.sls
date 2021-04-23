import { updateCardData } from '@services/queries/playerDeck.queries';
import * as PlayerQueryes from '@services/queries/player.queries';
import * as GameQueryes from '@services/queries/game.queries';
import { PlayerCardData } from './playerDeck.interface';

export class PlayerDeckService {
  async updateCard(playerCardData: PlayerCardData) {
    const player = await PlayerQueryes.findPlayerByConnectionId(playerCardData.connectionId);
    if (!player) return 'Error!';
    //Checking player show in this round or not;
    if (player.isShow) return 'You cannot showing in this round';

    const game = await GameQueryes.read(player.gameId);
    if (!game) return 'Error!';
    if (game.statusOfRound != 'Excusing') return 'You cannot showing right now';

    await updateCardData(playerCardData.cardId, player.playerId, playerCardData.isShow, playerCardData.isUse);
    //for checking
    await PlayerQueryes.updateIsShow(playerCardData.playerId, true);
    //TODO response проверку на тип карты
    return 'Is showing';
  }
}
