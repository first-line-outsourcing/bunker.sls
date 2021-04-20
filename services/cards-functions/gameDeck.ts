import { findCards } from '@services/queries/card.queries';
import { create } from '@services/queries/gameDeck.queries';

export async function giveCardsToGame(gameId) {
  const catastropheCard = await findCards('catastrophe', 1);

  const catastropheCardId: Array<number> = await catastropheCard.map((Card) => Card.id);

  console.log(catastropheCardId);
  catastropheCardId.forEach((value) => create(value, gameId));

  const shelterCards = await findCards('shelter', 5);

  const shelterIdCards: Array<number> = await shelterCards.map((Card) => Card.id);

  shelterIdCards.forEach((value) => create(value, gameId));
  // TODO Danger cards too
  //TODO response to clients cards

  return 'Game Cards is ready';
}
