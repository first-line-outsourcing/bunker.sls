import { findAllVoting } from '@services/queries/player.queries';
import * as GameQueryes from '@services/queries/game.queries';

export async function checkAmountVote(gameId) {
  const players = await findAllVoting(gameId);
  let count: number = 0;

  players.forEach((value) => {
    if (value.selectedPlayer != 'None') count++;
  });

  const game = await GameQueryes.read(gameId);

  return count == game.amountPlayers;
}

export async function calcVoting(gameId) {
  //TODO
}
