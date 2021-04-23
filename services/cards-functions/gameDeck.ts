import { findCards } from '@services/queries/card.queries';
import { create, updateIsShow } from '@services/queries/gameDeck.queries';

export async function giveCardsToGame(gameId) {
  const catastropheCard = await findCards('catastrophe', 1);
  catastropheCard.forEach((value) => {
    create(value.id, gameId);
    updateIsShow(value.id, gameId, true);
  });

  const shelterCards = await findCards('shelter', 5);
  shelterCards.forEach((value) => create(value.id, gameId));
  await updateIsShow(shelterCards[0], gameId, true);
  // TODO Danger cards too
  //TODO response to clients cards

  return 'Game Cards is ready';
}
