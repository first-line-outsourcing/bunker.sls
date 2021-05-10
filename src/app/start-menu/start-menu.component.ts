import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-start-menu',
  templateUrl: './start-menu.component.html',
  styleUrls: ['./start-menu.component.css']
})
export class StartMenuComponent implements OnInit {

  setGame = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
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
}
