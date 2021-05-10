import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { WebSocketService } from '../websocket.service';
import { ChatMessageDto } from '../models/chatMessageDto';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  constructor(public webSocketService: WebSocketService) { }

  ngOnInit(): void {
    this.webSocketService.openWebSocket();
  }

  ngOnDestroy(): void {
    this.webSocketService.closeWebSocket();
  }

  sendMessage(sendForm: NgForm): void {
    const chatMessageDto = new ChatMessageDto('Echdo', sendForm.value.user, sendForm.value.message);
    this.webSocketService.sendData(chatMessageDto);
    sendForm.controls.message.reset();
  }
}
