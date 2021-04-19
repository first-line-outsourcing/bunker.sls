import { Game } from '@models/PostgreSQL/game.model';
import { Card } from '@models/PostgreSQL/card.model';

import {
  BelongsTo,
  Column,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  DataType,
  AllowNull,
} from 'sequelize-typescript';

export interface GameDeckSchema {
  gameId: string;
  cardId: number;
  isShow: boolean;
  isUse: boolean;
  statusOfShelter: string;
}

@Table({ timestamps: false, modelName: 'GameDeck' })
export class GameDeck extends Model<GameDeckSchema> {
  @PrimaryKey
  @ForeignKey(() => Game)
  @Column(DataType.TEXT)
  gameId: string;

  @BelongsTo(() => Game)
  game: Game;

  @PrimaryKey
  @ForeignKey(() => Card)
  @Column(DataType.INTEGER)
  cardId: number;

  @BelongsTo(() => Card)
  card: Card;

  @Default(false)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  isShow: boolean;

  @Default(false)
  @AllowNull(false)
  @Column(DataType.BOOLEAN) //For second game mode
  isUse: boolean;

  @Default('none')
  @AllowNull(false)
  @Column(DataType.TEXT) //For second game mode
  statusOfShelter: string;
}
