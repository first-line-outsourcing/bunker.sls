export class ChatMessageDto {
  action: string;
  user: string;
  message: string;

  constructor(action: string, user: string, message: string){
    this.action = 'ECHO';
    this.user = user;
    this.message = message;
  }
}
