import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { WebSocketService } from '../websocket.service';

@Component({
  selector: 'app-start-menu',
  templateUrl: './start-menu.component.html',
  styleUrls: ['./start-menu.component.css']
})
export class StartMenuComponent implements OnInit, OnDestroy {

  setupGame = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public webSocketService: WebSocketService
  ) { }

  ngOnInit(): void {
    this.webSocketService.openWebSocket();
  }

  ngOnDestroy(): void {
    this.webSocketService.closeWebSocket();
  }

  createGame(name: string): void {
    // TODO метод и подключения по вебсокету и тп. Отправлять запросы создания и входа по линку сразу же.
    this.gotoGame('1');
  }

  joinGame(name: string, link: string): void{
    // TODO аналогично но без создания
    this.gotoGame('1');
  }
  gotoGame(gameId: string): void {
    // Этот метод вызывают оба выше
    this.router.navigate(['/game', { id: gameId}]);
  }

  setSetupGame(): void {
    this.setupGame = true;
  }
}
