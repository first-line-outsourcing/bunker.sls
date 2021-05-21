import { findCards } from '@services/queries/card.queries';
import { create } from '@services/queries/playerDeck.queries';
import { findAndCountPlayers } from '@services/queries/player.queries';
import { getAmountSpecial } from '@services/queries/game.queries';

export async function giveCardsToPlayers(gameId) {
  const players = await findAndCountPlayers(gameId);
  const amountPlayers = players.count;

  const healthCards = await findCards('health', amountPlayers);
  players.rows.forEach((value) => {
    create(healthCards[healthCards.length - 1].id, value.playerId);
    healthCards.pop();
  });

  const factCards = await findCards('fact', amountPlayers);
  players.rows.forEach((value) => {
    create(factCards[factCards.length - 1].id, value.playerId);
    factCards.pop();
  });

  const professionCards = await findCards('profession', amountPlayers);
  players.rows.forEach((value) => {
    create(professionCards[professionCards.length - 1].id, value.playerId);
    professionCards.pop();
  });

  const hobbyCards = await findCards('hobby', amountPlayers);
  players.rows.forEach((value) => {
    create(hobbyCards[hobbyCards.length - 1].id, value.playerId);
    hobbyCards.pop();
  });

  const biologyCards = await findCards('biology', amountPlayers);
  players.rows.forEach((value) => {
    create(biologyCards[biologyCards.length - 1].id, value.playerId);
    biologyCards.pop();
  });

  const amountSpecial = await getAmountSpecial(gameId);

  const sumAmount = amountPlayers * +amountSpecial;
  const specialCards = await findCards('special', sumAmount);
  players.rows.forEach((value) => {
    for (let i = 0; i < amountSpecial; i++) {
      create(specialCards[specialCards.length - 1].id, value.playerId);
      healthCards.pop();
    }
  });
}
