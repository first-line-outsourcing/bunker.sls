import { PlayerDeck } from '@models/PostgreSQL';

export async function create(cardId, playerId) {
  return await PlayerDeck.create({
    cardId: cardId,
    playerId: playerId,
  });
}

export async function updateIsShow(cardId, playerId, isShow) {
  return await PlayerDeck.update(
    { isShow: isShow },
    {
      where: {
        cardId: cardId,
        playerId: playerId,
      },
    }
  );
}

export async function updateIsUse(cardId, playerId, isUse) {
  return await PlayerDeck.update(
    {
      isUse: isUse,
    },
    {
      where: {
        cardId: cardId,
        playerId: playerId,
      },
    }
  );
}

export async function destroy(cardId, playerId) {
  return await PlayerDeck.destroy({
    where: {
      cardId: cardId,
      playerId: playerId,
    },
  });
}

export async function read(cardId, playerId) {
  return await PlayerDeck.findOne({
    where: {
      cardId: cardId,
      playerId: playerId,
    },
  });
}
