import { errorHandler } from '@helper/error-handler';
import { log } from '@helper/logger';
import { PlayerDeckManager } from './playerDeck.manager';
import { PlayerCardData } from './playerDeck.interface';

exports.updateCard = async (event, context) => {
  log(event);

  try {
    const manager = new PlayerDeckManager();

    const playerCardData: PlayerCardData = JSON.parse(event.body);
    return await manager.updateCard(playerCardData);
  } catch (e) {
    /**
     * Handle all errors
     */
    errorHandler(e);
  }
};
