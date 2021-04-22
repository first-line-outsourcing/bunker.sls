import { findAllVoting } from '@services/queries/player.queries';
import * as GameQueryes from '@services/queries/game.queries';

export async function countVotes(players) {
  let count: number = 0;

  players.forEach((value) => {
    if (value.selectedPlayer != 'none') count++;
  });

  return count;
}

export async function calcVoting(players: Array<string>) {
  let arr = players.map((value) => value);
}
