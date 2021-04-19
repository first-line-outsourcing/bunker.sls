import { PlayerDeck } from '@models/PostgreSQL/playerDeck.model';
import { GameDeck } from '@models/PostgreSQL/gameDeck.model';
import {
  Column,
  DataType,
  Model,
  Length,
  AllowNull,
  PrimaryKey,
  Table,
  HasMany,
  AutoIncrement,
} from 'sequelize-typescript';

export interface CardSchema {
  //id: number;
  type: string;
  name: string;
  description?: string;
  type_condition?: string;
}

@Table({ timestamps: false, modelName: 'Card' })
export class Card extends Model<CardSchema> {
  // @AutoIncrement
  // @PrimaryKey
  // @Column(DataType.INTEGER)
  // id: number;
  //
  //   @HasMany(() => PlayerDeck, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  //   playerDecks: PlayerDeck[];
  //
  //  @HasMany(() => GameDeck, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  //  gameDecks: GameDeck[];

  @Length({ max: 20 })
  @AllowNull(false)
  @Column(DataType.TEXT)
  type: string;

  @Length({ max: 20 })
  @AllowNull(false)
  @Column(DataType.TEXT)
  name: string;

  @Length({ max: 500 })
  @Column(DataType.TEXT)
  description: string;

  @Length({ max: 20 })
  @Column(DataType.TEXT) //Only for special conditions
  type_condition: string;
}
