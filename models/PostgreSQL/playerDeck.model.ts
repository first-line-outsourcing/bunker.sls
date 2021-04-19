import { Card } from '@models/PostgreSQL/card.model';
import { Player } from '@models/PostgreSQL/player.model';
import {
  PrimaryKey,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Default,
  AllowNull,
  Table,
  DataType,
} from 'sequelize-typescript';

export interface PlayerDeckSchema {
  cardId?: number;
  playerId?: string;
  isShow?: boolean;
  isUse?: boolean;
}

@Table({ timestamps: false, modelName: 'PlayerDeck' })
export class PlayerDeck extends Model<PlayerDeckSchema> {
  @PrimaryKey
  @ForeignKey(() => Card)
  @Column(DataType.INTEGER)
  cardId: number;

  @BelongsTo(() => Card)
  card: Card;

  @PrimaryKey
  @ForeignKey(() => Player)
  @Column(DataType.TEXT)
  playerId: string;

  @BelongsTo(() => Player)
  player: Player;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isShow: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN) // For second game mode
  isUse: boolean;
}
