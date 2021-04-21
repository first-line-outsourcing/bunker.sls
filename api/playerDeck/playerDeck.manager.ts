import { AppError, CommonErrors } from '@helper/app-error';
import { PlayerCardData } from './playerDeck.interface';
import { PlayerDeckService } from './playerDeck.service';

/**
 * It's the feature manager
 * Its methods should implement some feature's functionality
 */
export class PlayerDeckManager {
  private readonly service: PlayerDeckService;

  constructor() {
    /**
     * The feature service should be created in the constructor of the feature manager
     * Other services should be provided in the feature manager's methods
     */
    this.service = new PlayerDeckService();
  }

  updateCard(playerCardData: PlayerCardData) {
    //TODO ERRORs

    return this.service.updateCard(playerCardData);
  }
}
