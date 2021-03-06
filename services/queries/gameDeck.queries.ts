import { GameDeck } from '@models/PostgreSQL';

export async function create(cardId, gameId) {
  return await GameDeck.create({
    gameId: gameId,
    cardId: cardId,
  });
}

export async function findCardOfIsShow(gameId, isShow) {
  return await GameDeck.findOne({
    where: {
      gameId: gameId,
      isShow: isShow,
    },
  });
}

export async function findAllCardOfIsShow(gameId, isShow) {
  const gameDeck = await GameDeck.findAll({
    where: {
      gameId: gameId,
      isShow: isShow,
    },
  });
  const arrayId: number[] = [];
  gameDeck.map((value) => {
    arrayId.push(value.cardId);
  });
  return arrayId;
}

export async function updateIsShow(cardId, gameId, isShow) {
  await GameDeck.update(
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
