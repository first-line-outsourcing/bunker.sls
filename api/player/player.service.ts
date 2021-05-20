import { AppError, CommonErrors } from '@helper/app-error';
import { Player } from '@models/PostgreSQL';
import { findAllCardOfIsShow as findGameIsShowCards } from '@services/queries/gameDeck.queries';
import { findAllCards, read as cardRead } from '@services/queries/card.queries';
import {
  findAllCardOfIsShow as findPlayerIsShowCards,
  findAllCardWithIsShowByPlayerId,
} from '@services/queries/playerDeck.queries';
import { findAllPlayers, findPlayerByConnectionId } from '@services/queries/player.queries';
import { connect } from '@services/sequelize.service';
import * as GameQueryes from '@services/queries/game.queries';
import * as PlayerQueryes from '@services/queries/player.queries';
import { makePostData, makeErrorData } from '@services/websocket/websocket-makePostData';
import {
  PostActivePlayerData,
  PostAllData,
  PostCardData,
  PostGameData,
  PostPlayerData,
  setPostActivePlayerData,
  setPostPlayerData,
} from '@services/websocket/websocket-postData.interface';
import { ConnectionPlayer, ReconnectionPlayer, Vote } from './player.interface';
import * as Voting from '../process-logic/voting';

export class PlayerService {
  async connectPlayer() {
    try {
      return 'Connection is succesful';
    } catch (e) {
      return makeErrorData(e.message);
    }
  }

  async joinPlayer(connectionPlayer: ConnectionPlayer) {
    try {
      if (!connectionPlayer.body) return makeErrorData('Body is empty');

      const game = await GameQueryes.findGameByLink(connectionPlayer.body.link);

      if (!game) {
        console.log('Game not found');
        return makeErrorData('Game not found.');
      }

      // Check offline players for reconnect

      const offlinePlayers = await PlayerQueryes.findAllOfflinePlayers(game.id);
      if (offlinePlayers) {
        // return offlinePlayers for choosing special player

        console.log(offlinePlayers);
        return makePostData('EXIST_OFFLINE_PLAYERS', offlinePlayers);
      }

      if (game.numRound != -1) return makeErrorData("Game already started and hasn't offline players");

      // Standard create player

      if (await this.createPlayer(connectionPlayer.connectionId, game.id, connectionPlayer.body.name)) {
        // Send data about game
        //
        //find all cardId
        const cards = await findGameIsShowCards(game.id, true);
        //find all cards by id
        const cardsData = await findAllCards(cards);
        //put all cards
        const postGameCards: PostCardData[] = [];
        cardsData.forEach((value) => {
          postGameCards.push(value);
        });
        const postGameData: PostGameData = { game: game, cards: postGameCards };
        //Send data about players
        //
        //find all players and get id
        const players = await findAllPlayers(game.id);
        const postPlayersData: PostPlayerData[] = [];
        let postActivePlayerData: PostActivePlayerData = {};
        for (const value of players) {
          //Check on active player
          if (value.connectionId == connectionPlayer.connectionId) {
            postActivePlayerData = setPostActivePlayerData(value);
          } else {
            postPlayersData.push(setPostPlayerData(value));
          }
        }
        //find and get cards for each player
        for (const value of postPlayersData) {
          //find all cardId with isShow = true
          const cards = await findPlayerIsShowCards(value.playerId, true);
          //find all cards by id
          const cardsData = await findAllCards(cards);
          //put all cards
          const postPlayerCards: PostCardData[] = [];
          cardsData.forEach((value) => {
            postPlayerCards.push(value);
          });
          value.cards = postPlayerCards;
        }
        //
        //Send Active Player
        //find all cardId with isShow = true
        const activePlayerCards = await findAllCardWithIsShowByPlayerId(postActivePlayerData.playerId);
        //find all cards by id
        const cardsId: number[] = activePlayerCards.map((value) => value.cardId);
        const activePlayerCardsData = await findAllCards(cardsId);
        //put all cards
        const activePlayerPostCardData: PostCardData[] = [];
        activePlayerCardsData.forEach((value, index) => {
          const card: PostCardData = {
            id: value.id,
            type: value.type,
            name: value.name,
            description: value.description,
            isShow: activePlayerCards[index].isShow,
          };
          activePlayerPostCardData.push(value);
        });
        postActivePlayerData.cards = activePlayerPostCardData;
        //PostAllData
        const postAllData: PostAllData = {
          gameData: postGameData,
          playersData: postPlayersData,
          activePlayerData: postActivePlayerData,
        };
        return makePostData('YOU_JOINED', postAllData);
      }
      return makeErrorData('Game is full');
    } catch (e) {
      return makeErrorData(e.message);
    }
  }

  async reconnectPlayer(reconnectionPlayer: ReconnectionPlayer) {
    try {
      if (!connect()) return 'Connection is failed';

      const player = PlayerQueryes.updateConnectionId(reconnectionPlayer.playerId, reconnectionPlayer.connectionId);

      if (player) {
        console.log('Player was reconnected');
        return 'Player was reconnected';
      }
    } catch (e) {
      throw new AppError(CommonErrors.InternalServerError, e.message);
    }
  }

  async disconnectPlayer(connectionId: string) {
    try {
      await PlayerQueryes.updateIsOnline(connectionId);
      await PlayerQueryes.updateSelectedPlayerByConnectionId(connectionId, 'cannot');
    } catch (e) {
      throw new AppError(CommonErrors.InternalServerError, e.message);
    }

    console.log('Player leave game');
    return 'Player leave game';
  }

  async sendVote(vote: Vote) {
    const player = await PlayerQueryes.findPlayerByConnectionId(vote.connectionId);
    if (!player) return 'Player not find';
    const game = await GameQueryes.read(player.gameId);
    if (!game) return 'Game not found';

    if ((await Voting.checkingParametres(player, game, vote)) == 200) {
      //Voting

      await PlayerQueryes.updateSelectedPlayer(player.playerId, vote.playerOnVote);
    }
  }

  async endDiscuss(connectionId: string) {
    await PlayerQueryes.updateIsEndDiscuss(connectionId, true);
    return 'player finished discuss';
  }

  async createPlayer(connectionId, gameId, name) {
    if (this.checkAmountPlayers(gameId)) {
      await PlayerQueryes.create(connectionId, gameId, name);

      //Set Owner
      if ((await PlayerQueryes.countPlayers(gameId)) == 1) {
        await PlayerQueryes.setIsOwner(connectionId);
      }
      console.log('player was created');
      return true;
    }
  }

  async checkAmountPlayers(gameId) {
    const game = await GameQueryes.read(gameId);
    if (!game) return 0;

    return (await PlayerQueryes.countPlayers(gameId)) < game.amountPlayers;
  }
}
