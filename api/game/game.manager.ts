import { AppError, CommonErrors } from '@helper/app-error';
import { GameData } from './game.interface';
import { GameService } from './game.service';

/**
 * It's the feature manager
 * Its methods should implement some feature's functionality
 */
export class GameManager {
  private readonly service: GameService;

  constructor() {
    /**
     * The feature service should be created in the constructor of the feature manager
     * Other services should be provided in the feature manager's methods
     */
    this.service = new GameService();
  }

  createGame(gameData: GameData) {
    if (!gameData.link) {
      throw new AppError(CommonErrors.BadRequest, "The param 'link' is required.");
    }

    return this.service.createGame(gameData);
  }

  updateRound(connectionId: string) {
    return this.service.updateRound(connectionId);
  }

  // readGame(gameData: GameData){
  //   // if (!gameData.link) {
  //   //   throw new AppError(CommonErrors.BadRequest, "The param 'link' is required.");
  //   // }
  //   return this.service.readGame( gameData );
  // };
  //
  // updateGame(gameData: GameData){
  //   // if (!gameData.link) {
  //   //   throw new AppError(CommonErrors.BadRequest, "The param 'link' is required.");
  //   // }
  //   return this.service.updateGame( gameData );
  // };
  //
  // deleteGame(gameData: GameData){
  //   // if (!gameData.link) {
  //   //   throw new AppError(CommonErrors.BadRequest, "The param 'link' is required.");
  //   // }
  //   return this.service.deleteGame( gameData );
  // };
}
