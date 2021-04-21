import { updateCardData } from '@services/queries/playerDeck.queries';
import { PlayerCardData } from './playerDeck.interface';

export class PlayerDeckService {
  async updateCard(playerCardData: PlayerCardData) {
    //
    await updateCardData(playerCardData.cardId, playerCardData.playerId, playerCardData.isShow, playerCardData.isUse);
  }
}
