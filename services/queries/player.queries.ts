//****//

import { Player } from '../../models/PostgreSQL';
import { ID } from '../generate-id.service';

export async function findPlayerByConnectionId(connectionId: string) {
  return await Player.findOne({
    where: { connectionId: connectionId },
  });
}

export async function findPlayerById(playerId) {
  return await Player.findOne({
    where: { playerId: playerId },
  });
}
export async function findAndCountPlayers(gameId) {
  const players = await Player.findAndCountAll({
    where: {
      gameId: gameId,
    },
    attributes: ['playerId'],
  });
  return players;
}

export async function findAllPlayers(gameId) {
  return await Player.findAll({
    where: {
      gameId: gameId,
    },
  });
}

export async function countPlayers(gameId) {
  return Player.count({ where: { gameId: gameId } });
}

export async function findAllOfflinePlayers(gameId) {
  const { count, rows } = await Player.findAndCountAll({
    where: {
      gameId: gameId,
      isOnline: false,
    },
  });
  if (count === 0) return false;

  console.log(count);
  return rows;
}

export async function create(connectionId: string, gameId: string, name: string) {
  return await Player.create({
    playerId: ID(),
    connectionId: connectionId, // Websocket connectionId
    gameId: gameId,
    name: name,
  });
}

export async function setIsOwner(connectionId) {
  return await Player.update(
    {
      isOwner: true,
    },
    {
      where: {
        connectionId: connectionId,
      },
    }
  );
}

export async function updateBanVoteOnThisPlayer(playerId, banVoteOnThisPlayer) {
  return await Player.update(
    {
      banVoteOnThisPlayer: banVoteOnThisPlayer,
    },
    {
      where: {
        id: playerId,
      },
    }
  );
}

export async function updateIsOut(playerId, isOut) {
  return await Player.update(
    {
      isOut: isOut,
    },
    {
      where: {
        id: playerId,
      },
    }
  );
}

export async function updateIsUse(playerId, isUse) {
  return await Player.update(
    {
      isUse: isUse,
    },
    {
      where: {
        id: playerId,
      },
    }
  );
}

export async function updateConnectionId(playerId, connectionId) {
  return await Player.update(
    {
      connectionId: connectionId,
    },
    {
      where: {
        id: playerId,
      },
    }
  );
}

export async function updateSelectedPlayer(playerId, selectedPlayer) {
  return await Player.update(
    {
      selectedPlayer: selectedPlayer,
    },
    {
      where: {
        id: playerId,
      },
    }
  );
}

export async function updateSelectedPlayerByConnectionId(connectionId, selectedPlayer) {
  return await Player.update(
    {
      selectedPlayer: selectedPlayer,
    },
    {
      where: {
        connectionid: connectionId,
      },
    }
  );
}

export async function updateIsOnline(playerId: string) {
  return await Player.update(
    { isOnline: false },
    {
      where: {
        playerId: playerId,
      },
    }
  );
}

export async function updateVoteOnYourself(playerId, voteOnYourself) {
  return await Player.update(
    {
      voteOnYourself: voteOnYourself,
    },
    {
      where: {
        id: playerId,
      },
    }
  );
}

export async function updateBanVotingAgainPlayer(playerId, banVotingAgainPlayer) {
  return await Player.update(
    {
      banVotingAgainPlayer: banVotingAgainPlayer,
    },
    {
      where: {
        id: playerId,
      },
    }
  );
}

export async function updateSkipHisVote(playerId, skipHisVote) {
  return await Player.update(
    {
      skipHisVote: skipHisVote,
    },
    {
      where: {
        id: playerId,
      },
    }
  );
}

export async function updateMultiVote(playerId, multiVote) {
  return await Player.update(
    {
      multiVote: multiVote,
    },
    {
      where: {
        id: playerId,
      },
    }
  );
}

export async function updateMultiVoteOnPlayer(playerId, multiVoteOnPlayer) {
  return await Player.update(
    {
      multiVoteOnPlayer: multiVoteOnPlayer,
    },
    {
      where: {
        id: playerId,
      },
    }
  );
}
