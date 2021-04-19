import { giveCardsToGame } from '@services/cards-functions/gameDeck';
import { giveCardsToPlayers } from '@services/cards-functions/playerDeck';

export async function giveStartCards(gameId) {
  await giveCardsToPlayers(gameId);
  await giveCardsToGame(gameId);
}
