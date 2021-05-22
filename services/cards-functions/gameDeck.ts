import { findCards } from '@services/queries/card.queries';
import { create, updateIsShow } from '@services/queries/gameDeck.queries';

export async function giveCardsToGame(gameId) {
  const catastropheCard = await findCards('catastrophe', 1);
  for (const value of catastropheCard) {
    await create(value.id, gameId);
    await updateIsShow(value.id, gameId, true);
  }
  const shelterCards = await findCards('shelter', 5);
  for (const value of shelterCards) {
    await create(value.id, gameId);
  }
  // await updateIsShow(shelterCards[0].id, gameId, true);
}
