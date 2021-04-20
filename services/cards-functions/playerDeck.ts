import { findCards } from '@services/queries/card.queries';
import { create } from '@services/queries/playerDeck.queries';
import { findAndCountPlayers } from '@services/queries/player.queries';
import { getAmountSpecial, read } from '@services/queries/game.queries';

export async function giveCardsToPlayers(gameId) {
  const players = await findAndCountPlayers(gameId);

  const amountPlayers = players.count;

  const healthCards = await findCards('health', amountPlayers);

  const factCards = await findCards('fact', amountPlayers);

  const professionCards = await findCards('profession', amountPlayers);

  const hobbyCards = await findCards('hobby', amountPlayers);

  const biologyCards = await findCards('biology', amountPlayers);

  const amountSpecial = await getAmountSpecial(gameId);
  const specialCards = await findCards('special', amountPlayers + amountSpecial);

  console.log(healthCards[healthCards.length - 1].id);

  players.rows.forEach((value) => {
    create(healthCards[healthCards.length - 1].id, value.playerId);
    healthCards.pop();
  });
  players.rows.forEach((value) => {
    create(factCards[factCards.length - 1].id, value.playerId);
    factCards.pop();
  });

  players.rows.forEach((value) => {
    create(professionCards[professionCards.length - 1].id, value.playerId);
    professionCards.pop();
  });

  players.rows.forEach((value) => {
    create(hobbyCards[hobbyCards.length - 1].id, value.playerId);
    hobbyCards.pop();
  });

  players.rows.forEach((value) => {
    create(biologyCards[biologyCards.length - 1].id, value.playerId);
    biologyCards.pop();
  });

  players.rows.forEach((value) => {
    for (let i = 0; i < amountSpecial; i++) {
      create(specialCards[specialCards.length - 1].id, value.playerId);
      healthCards.pop();
    }
  });

  return healthCards;

  //console.log(healthCards,factCards,professionCards,hobbyCards,biologyCards, specialCards);
  // return [healthCards,factCards,professionCards,hobbyCards,biologyCards,specialCards];

  // const shelterIdCards: Array<number> = await shelterCards.map(Card => Card.id);
  //
  // shelterIdCards.forEach(value => create(value,gameId));
  // // TODO Danger cards too
  // //TODO response to clients cards
  //
  // return "Game Cards is ready";
}
