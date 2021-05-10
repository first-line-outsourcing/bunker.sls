import { Injectable } from '@angular/core';
import { ChatMessageDto } from './models/chatMessageDto';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  webSocket: WebSocket;
  chatMessages = [];


  constructor() { }

  public openWebSocket(): void{
    this.webSocket = new WebSocket('ws://localhost:8080');

    this.webSocket.onopen = (event) => {
      console.log('Open: ', event);
    };

    this.webSocket.onmessage = (event) => {
      console.log(event);
      // TODO получение данных
      const chatMessageDto = event.data;
      this.chatMessages.push(chatMessageDto);
    };


    this.webSocket.onclose = (event) => {
      console.log('Close: ', event);
    };
  }

  public sendData(Data): void {
    this.webSocket.send(JSON.stringify(Data));
  }

  public closeWebSocket(): void {
    this.webSocket.close();
  }

}
