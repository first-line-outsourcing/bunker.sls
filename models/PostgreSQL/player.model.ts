import { Game } from '@models/PostgreSQL/game.model';
import { PlayerDeck } from '@models/PostgreSQL/playerDeck.model';
import {
  BelongsTo,
  Column,
  Length,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  DataType,
  AllowNull,
  Unique,
} from 'sequelize-typescript';

export interface PlayerSchema {
  playerId: string;
  connectionId: string;
  gameId: string;
  name: string;
  isOwner?: boolean;
  isOut?: boolean;
  isUse?: boolean;
  isOnline?: boolean;
  selectedPlayer?: string;
  voteOnYourself?: boolean;
  banVotingAgainPlayer?: string;
  banVoteOnThisPlayer?: boolean;
  skipHisVote?: boolean;
  multiVote?: boolean;
  multiVoteOnPlayer?: string;
}

@Table({ timestamps: false, modelName: 'Player' })
export class Player extends Model<PlayerSchema> {
  @PrimaryKey
  @Column(DataType.TEXT)
  playerId: string;

  @HasMany(() => PlayerDeck, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  players: PlayerDeck[];

  @ForeignKey(() => Game)
  @AllowNull(false)
  @Column(DataType.TEXT)
  gameId: string;

  @BelongsTo(() => Game)
  game: Game;

  @Length({ max: 20 })
  @AllowNull(false)
  @Column(DataType.TEXT)
  name: string;

  @Unique
  @Column(DataType.TEXT)
  connectionId: string;

  @Default(false)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  isOwner: boolean;

  @Default(false)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  isOut: boolean;

  @Default(false)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  isUse: boolean;

  @Default(true)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  isOnline: boolean;

  @Column(DataType.TEXT) // Choosen player on vote
  selectedPlayer: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN) // For special condition
  voteOnYourself: boolean;

  @Column(DataType.TEXT) // For special condition
  banVotingAgainPlayer: string;

  @Column(DataType.BOOLEAN) // For repeat voting
  banVoteOnThisPlayer: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN) // For special condition
  skipHisVote: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN) // For special condition (double)
  multiVote: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN) //double vote on this player
  multiVoteOnPlayer: boolean;
}
