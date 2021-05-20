import { GameDeck, PlayerDeck } from '@models/PostgreSQL';

export async function create(cardId, playerId) {
  return await PlayerDeck.create({
    cardId: cardId,
    playerId: playerId,
  });
}

export async function updateCardData(cardId, playerId, isShow, isUse) {
  return await PlayerDeck.update(
    { isShow: isShow, isUse: isUse },
    {
      where: {
        cardId: cardId,
        playerId: playerId,
      },
    }
  );
}

export async function findAllCardOfIsShow(playerId, isShow) {
  const playerDeck = await PlayerDeck.findAll({
    where: {
      playerId: playerId,
      isShow: isShow,
    },
  });
  const arrayId: number[] = [];
  playerDeck.map((value) => {
    arrayId.push(value.cardId);
  });
  return arrayId;
}

export async function findAllCardWithIsShowByPlayerId(playerId) {
  const playerDeck = await PlayerDeck.findAll({
    where: {
      playerId: playerId,
    },
  });
  const arrayCard: { cardId: number; isShow: boolean }[] = [];
  playerDeck.map((value) => {
    arrayCard.push({ cardId: value.cardId, isShow: value.isShow });
  });
  return arrayCard;
}

// export async function updateIsUse(cardId, playerId, isUse) {
//   return await PlayerDeck.update(
//     {
//       isUse: isUse,
//     },
//     {
//       where: {
//         cardId: cardId,
//         playerId: playerId,
//       },
//     }
//   );
// }

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
