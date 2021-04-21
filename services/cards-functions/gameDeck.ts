import { findCards } from '@services/queries/card.queries';
import { create } from '@services/queries/gameDeck.queries';

export async function giveCardsToGame(gameId) {
  const catastropheCard = await findCards('catastrophe', 1);
  catastropheCard.forEach((value) => create(value.id, gameId));

  const shelterCards = await findCards('shelter', 5);
  shelterCards.forEach((value) => create(value.id, gameId));

  // TODO Danger cards too
  //TODO response to clients cards

  return 'Game Cards is ready';
}
