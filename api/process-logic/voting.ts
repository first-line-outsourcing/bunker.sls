import { Player, Game } from '@models/PostgreSQL';
import * as PlayerQueryes from '@services/queries/player.queries';
import * as GameQueryes from '@services/queries/game.queries';
import { Vote } from '../player/player.interface';
//Count players, how voted and cannot
export async function countVotes(players) {
  let count: number = 0;

  players.forEach((value) => {
    if (value.selectedPlayer != 'none') count++;
  });

  return count;
}

export async function checkingParametres(player: Player, game: Game, vote: Vote) {
  //Check status
  if (game.statusOfRound != 'voting') return 'Not yet!';

  //Check isOut and LastOuted
  if (player.isOut && player.playerId != game.outedPlayerInLastRound) {
    await PlayerQueryes.updateSelectedPlayer(player.playerId, 'cannot');
    return 'You cannot voting';
  }

  //Check banVotingAgainPlayer
  if (player.banVotingAgainPlayer == vote.playerOnVote) {
    console.log(player.banVotingAgainPlayer, vote.playerOnVote);
    return 'Проголосуйте за кого-то другого!';
  }
  //Check voteOnYourself
  if (player.voteOnYourself) {
    await PlayerQueryes.updateSelectedPlayer(player.playerId, player.playerId);
    return 'Вы можете голосовать только против себя!';
  }

  //Check skipHisVote
  if (player.skipHisVote) {
    await PlayerQueryes.updateSelectedPlayer(player.playerId, 'skip');
    return 'Вы пропускаете это голосование!';
  }

  //Check on banVoteOnThisPlayer
  const choosenPlayer = await PlayerQueryes.findPlayerById(vote.playerOnVote);
  if (!choosenPlayer) return 'choosen player not found';

  if (choosenPlayer.banVoteOnThisPlayer) return 'You cannot vote on this player';

  return 'SUCCESS';
}

export async function calcVoting(players: Array<Player>) {
  //TODO проверка если никто не проголосовал
  const votes = players.map((value) => ({
    playerId: value.playerId,
    selectedPlayer: value.selectedPlayer,
    multiVote: value.multiVote,
  }));
  console.log('Считаем голоса');
  console.log(votes);

  //Count with all values
  const counts = {};
  votes.forEach((value) => {
    if (value.selectedPlayer != 'cannot') {
      let i = 1;

      if (value.multiVote) i = i * 2;

      const player = players.find((elem) => elem.playerId == value.selectedPlayer);
      if (!player) return 0;
      if (player.multiVoteOnPlayer) i = i * 2;

      counts[value.selectedPlayer] = (counts[value.selectedPlayer] || 0) + i;
    }
  });
  console.log(counts);

  //
  //Check amount player with max vote
  //Find keys for take max value
  //
  const keys = Object.keys(counts);
  console.log(keys);
  let max = counts[keys[0]];
  console.log(max);
  let listOfMax: string[] = [];

  //Set max
  for (let i = 0; i < keys.length; i++) {
    const value = counts[keys[i]];
    if (value == max) {
      listOfMax.push(keys[i]);
    }
    if (value > max) {
      max = counts[keys[i]];
      listOfMax = [];
      listOfMax.push(keys[i]);
    }
  }

  return listOfMax;
}

export async function defineResult(listOfMax: Array<string>, gameId, numVote) {
  //Checking
  //TODO доделать и протестить, тут что-то непонятное.
  if (listOfMax.length > 1) {
    for (const el in listOfMax) {
      console.log(el);
      await PlayerQueryes.updateBanVoteOnThisPlayer(el, true);
    }
    await GameQueryes.update(gameId, 'none', numVote);
    return 0; //TODO ответ
  }
  console.log('Мы здесь');
  console.log(listOfMax);
  //TODO При специальных условиях надо будет переделать, тк могут измениться результаты

  await PlayerQueryes.updateIsOut(listOfMax[0], true);
  // await GameQueryes.updateOutedPlayerInLastRound(gameId, listOfMax[0]);
  await GameQueryes.update(gameId, listOfMax[0], numVote - 1);

  //set numVote for checking next;
  return listOfMax[0];
}
