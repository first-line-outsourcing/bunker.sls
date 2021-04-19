import { GameDeck } from '@models/PostgreSQL/gameDeck.model';
import { Player } from '@models/PostgreSQL/player.model';
import { Column, Default, Model, PrimaryKey, Table, Unique, DataType, HasMany, AllowNull } from 'sequelize-typescript';

export interface GameSchema {
  id: string;
  purpose?: boolean;
  mode?: boolean;
  amountPlayers?: number;
  // amountConnectedPlayers: number;
  timeOnVote?: number;
  timeOnExcuse?: number;
  timeOnDiscuss?: number;
  link: string;
  amountDangers?: number;
  amountSpecialConditions?: number;
  numRound?: number;
  numVote?: number;
  statusOfRound?: string;
  outedPlayerInLastRound?: string;
  firstPlayerShowHeal?: string;
  typeCardOnThisRound?: string;
}

@Table({ timestamps: false, modelName: 'Game' })
export class Game extends Model<GameSchema> {
  @PrimaryKey
  @Column(DataType.TEXT)
  id: string;

  @HasMany(() => Player, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  players: Player[];

  @HasMany(() => GameDeck, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  gameDecks: GameDeck[];

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  purpose: boolean;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  mode: boolean;

  @AllowNull(false)
  @Default(8)
  @Column(DataType.INTEGER)
  amountPlayers: number;

  @AllowNull(false)
  @Default(60)
  @Column(DataType.INTEGER)
  timeOnVote: number;

  @AllowNull(false)
  @Default(30)
  @Column(DataType.INTEGER)
  timeOnExcuse: number;

  @AllowNull(false)
  @Default(60)
  @Column(DataType.INTEGER)
  timeOnDiscuss: number;

  @Unique
  @AllowNull(false)
  @Column(DataType.TEXT)
  link: string;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  amountDangers: number;

  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  amountSpecialConditions: number;

  @AllowNull(false)
  @Default(-1)
  @Column(DataType.INTEGER)
  numRound: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  numVote: number;

  @AllowNull(false)
  @Default('Not Start')
  @Column(DataType.TEXT) //Excusing/Discuss/Voting/FinishedVoting/SendingVote
  statusOfRound: string;

  @Column(DataType.TEXT) //Last outed man
  outedPlayerInLastRound: string;

  @Column(DataType.TEXT)
  firstPlayerShowHeal: string;

  @Column(DataType.TEXT)
  typeCardOnThisRound: string;
}
