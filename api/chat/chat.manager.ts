import { AppError, CommonErrors } from '@helper/app-error';
import { findPlayerByConnectionId } from '@services/queries/player.queries';
import { MessageData } from './chat.interface';
import { ChatService } from './chat.service';

/**
 * It's the feature manager
 * Its methods should implement some feature's functionality
 */
export class ChatManager {
  private readonly service: ChatService;

  constructor() {
    /**
     * The feature service should be created in the constructor of the feature manager
     * Other services should be provided in the feature manager's methods
     */
    this.service = new ChatService();
  }

  async sendMessage(messageData: MessageData, connectionId: string) {
    return this.service.sendMessage(messageData, connectionId);
  }
}
