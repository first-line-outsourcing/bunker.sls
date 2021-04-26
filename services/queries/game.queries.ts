import { Game } from '@models/PostgreSQL';
import { ID } from '@services/generate-id.service';

export async function create(gameData) {
  return await Game.create({
    id: ID(),
    purpose: gameData.purpose,
    mode: gameData.mode,
    amountPlayers: gameData.amountPlayers,
    timeOnVote: gameData.timeOnVote,
    timeOnExcuse: gameData.timeOnExcuse,
    timeOnDiscuss: gameData.timeOnDiscuss,
    link: gameData.link,
    amountDangers: gameData.amountDangers,
    amountSpecialConditions: gameData.amountSpecialConditions,
  });
}

export async function destroy(id) {
  return await Game.destroy({
    where: {
      id: id,
    },
  });
}

export async function updateCustomization(gameData) {
  return await Game.update(
    {
      purpose: gameData.purpose,
      mode: gameData.mode,
      amountPlayers: gameData.amountPlayers,
      timeOnVote: gameData.timeOnVote,
      timeOnExcuse: gameData.timeOnExcuse,
      timeOnDiscuss: gameData.timeOnDiscuss,
      link: ID(),
      amountDangers: gameData.amountDangers,
      amountSpecialConditions: gameData.amountSpecialConditions,
    },
    {
      where: {
        id: gameData.id,
      },
    }
  );
}

export async function read(id) {
  return await Game.findByPk(id);
}

export async function update(gameId, outedPlayerInLastRound?, numVote?) {
  return await Game.update(
    {
      outedPlayerInLastRound: outedPlayerInLastRound,
      numVote: numVote,
    },
    {
      where: {
        id: gameId,
      },
    }
  );
}

export async function getAmountSpecial(id) {
  const game = await Game.findByPk(id, { attributes: ['amountSpecialConditions'] });
  if (!game) return 0;
  return game.amountSpecialConditions;
}

export async function updateNumRound(gameId, numRound) {
  return await Game.update(
    {
      numRound: numRound,
    },
    {
      where: {
        id: gameId,
      },
    }
  );
}

export async function findGameByLink(link: string) {
  return await Game.findOne({
    where: { link: link },
  });
}

export async function updateNumVote(gameId, numVote) {
  return await Game.update(
    {
      numVote: numVote,
    },
    {
      where: {
        id: gameId,
      },
    }
  );
}

export async function updateStatusOfRound(gameId, statusOfRound: string) {
  return await Game.update(
    {
      statusOfRound: statusOfRound,
    },
    {
      where: {
        id: gameId,
      },
    }
  );
}

export async function updateOutedPlayerInLastRound(gameId, outedPlayerInLastRound) {
  return await Game.update(
    {
      outedPlayerInLastRound: outedPlayerInLastRound,
    },
    {
      where: {
        id: gameId,
      },
    }
  );
}

export async function setFirstPlayerShowHeal(gameId, firstPlayerShowHeal) {
  return await Game.update(
    {
      firstPlayerShowHeal: firstPlayerShowHeal,
    },
    {
      where: {
        id: gameId,
      },
    }
  );
}

export async function setTypeCardOnThisRound(gameId, typeCardOnThisRound) {
  return await Game.update(
    {
      typeCardOnThisRound: typeCardOnThisRound,
    },
    {
      where: {
        id: gameId,
      },
    }
  );
}
