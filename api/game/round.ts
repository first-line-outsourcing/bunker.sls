export async function checkNumVoting(amountPlayers, numRound) {
  switch (numRound) {
    case 1: {
      return 0;
    }

    case 2: {
      if (amountPlayers == 4 || amountPlayers == 5 || amountPlayers == 6) {
        return 0;
      }
      if (amountPlayers == 15 || amountPlayers == 16) {
        return 2;
      }
      return 1;
    }

    case 3: {
      if (amountPlayers == 4) {
        return 0;
      }
      if (amountPlayers == 13 || amountPlayers == 14 || amountPlayers == 15 || amountPlayers == 16) {
        return 2;
      }
      return 1;
    }

    case 4: {
      if (
        amountPlayers == 11 ||
        amountPlayers == 12 ||
        amountPlayers == 13 ||
        amountPlayers == 14 ||
        amountPlayers == 15 ||
        amountPlayers == 16
      ) {
        return 2;
      }
      return 1;
    }

    case 5: {
      if (amountPlayers == 4 || amountPlayers == 5 || amountPlayers == 6 || amountPlayers == 7 || amountPlayers == 8) {
        return 1;
      }
      return 2;
    }

    default: {
      return 0;
    }
  }
}
