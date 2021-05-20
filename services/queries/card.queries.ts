import { Card } from '@models/PostgreSQL';
import sequelize from '@services/sequelize';

export async function read(id) {
  return await Card.findByPk(id);
}

export async function findAllCards(arrayId: number[]) {
  return await Card.findAll({
    where: {
      id: arrayId,
    },
  });
}

export async function findCards(type, amount: number) {
  return await Card.findAll({
    attributes: ['id'],
    where: { type: type },
    order: sequelize.random(),
    limit: amount,
  });
}
