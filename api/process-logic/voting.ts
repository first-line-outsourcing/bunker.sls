import { Player, Game } from '@models/PostgreSQL';
import * as PlayerQueryes from '@services/queries/player.queries';
import * as GameQueryes from '@services/queries/game.queries';
import { Vote } from '../player/player.interface';

export async function countVotes(players) {
  let count: number = 0;

  players.forEach((value) => {
    if (value.selectedPlayer != 'none') count++;
  });

  return count;
}

export async function checkingParametres(player: Player, game: Game, vote: Vote) {
  //Check status
  if (game.statusOfRound != 'Voting') return 'Not yet!';

  //Check isOut and LastOuted
  if (player.isOut && player.playerId != game.outedPlayerInLastRound) {
    await PlayerQueryes.updateSelectedPlayer(player.playerId, 'cannot');
    return 'You cannot voting';
  }

  //Check banVotingAgainPlayer
  if (player.banVotingAgainPlayer == vote.playerOnVote) return 'Проголосуйте за кого-то другого!';

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

  if (choosenPlayer.banVoteOnThisPlayer) return 'You cannot vote on this player';

  return 200;
}

export async function calcVoting(players: Array<Player>) {
  const votes = players.map((value) => ({
    playerId: value.playerId,
    selectedPlayer: value.selectedPlayer,
    multiVote: value.multiVote,
  }));

  var counts = {};
  votes.forEach((value) => {
    if (value.selectedPlayer != 'cannot') {
      let i = 1;

      if (value.multiVote) i = i * 2;

      const player = players.find((elem) => elem.playerId == value.selectedPlayer);
      if (player.multiVoteOnPlayer) i = i * 2;

      counts[value.selectedPlayer] = (counts[value.selectedPlayer] || 0) + i;
    }
  });

  //
  //Check amount player with max vote
  //
  let keys = Object.keys(counts);
  let max = counts[keys[0]];
  let listOfMax: string[] = [];

  //Set max
  for (let i = 1; i < keys.length; i++) {
    let value = counts[keys[i]];
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
  if (listOfMax.length > 1) {
    for (let el in listOfMax) {
      await PlayerQueryes.updateBanVoteOnThisPlayer(el, true);
    }
    await GameQueryes.update(gameId, 'none', numVote - 1);
    return 0; //TODO ответ
  }
  await PlayerQueryes.updateIsOut(listOfMax[0], true);
  await GameQueryes.updateOutedPlayerInLastRound(gameId, listOfMax[0]);
  //TODO ответ
}
