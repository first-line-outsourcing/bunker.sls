import { Component, OnInit, Input } from '@angular/core';
import { Data } from '../models/data';
import {GameData} from '../models/game';
import {WebSocketService} from '../websocket.service';


@Component({
  selector: 'app-game-setup',
  templateUrl: './game-setup.component.html',
  styleUrls: ['./game-setup.component.css']
})
export class GameSetupComponent implements OnInit {
  selectedPurpose = false;
  selectedMode = false;
  selectedAmountPlayers = 8;
  selectedLink = this.generateLink();
  selectedTimeOnVote = 60;
  selectedTimeOnExcuse = 30;
  selectedTimeOnDiscuss = 60;
  selectedAmountDangers = 0;
  selectedAmountSpecialConditions = 1;


  @Input() setupGame?: boolean;
  constructor(public webSocketService: WebSocketService,) { }

  ngOnInit(): void {
  }

  generateLink(): string {
      // Math.random should be unique because of its seeding algorithm.
      // Convert it to base 36 (numbers + letters), and grab the first 9 characters
      // after the decimal.
    return this.selectedLink = Math.random().toString(36).substr(2, 9);
  }

  createGame(): void {
    const gameData: GameData = {
      purpose: this.selectedPurpose,
      mode: this.selectedMode,
      amountPlayers: this.selectedAmountPlayers,
      link: this.selectedLink,
      timeOnVote: this.selectedTimeOnVote,
      timeOnExcuse: this.selectedTimeOnExcuse,
      timeOnDiscuss: this.selectedTimeOnDiscuss,
      amountDangers: this.selectedAmountDangers,
      amountSpecialConditions: this.selectedAmountSpecialConditions,
    };
    const data = new Data('create', gameData);
    this.webSocketService.sendData(data);
  }

}
