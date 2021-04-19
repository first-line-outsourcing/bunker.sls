import { GameDeck } from '@models/PostgreSQL';

export async function create(cardId, gameId) {
  return await GameDeck.create({
    where: {
      cardId: cardId,
      gameId: gameId,
    },
  });
}

export async function updateIsShow(cardId, gameId, isShow) {
  return await GameDeck.update(
    { isShow: isShow },
    {
      where: {
        cardId: cardId,
        gameId: gameId,
      },
    }
  );
}

export async function updateIsUse(cardId, gameId, isUse) {
  return await GameDeck.update(
    {
      isUse: isUse,
    },
    {
      where: {
        cardId: cardId,
        gameId: gameId,
      },
    }
  );
}

export async function destroy(cardId, gameId) {
  return await GameDeck.destroy({
    where: {
      cardId: cardId,
      gameId: gameId,
    },
  });
}

export async function read(cardId, gameId) {
  return await GameDeck.findOne({
    where: {
      cardId: cardId,
      gameId: gameId,
    },
  });
}

export async function updateStatusOfShelter(cardId, gameId, status) {
  return await GameDeck.update(
    { statusOfShelter: status },
    {
      where: {
        cardId: cardId,
        gameId: gameId,
      },
    }
  );
}
