import { Card } from '@models/PostgreSQL';

export async function read(id) {
  return await Card.findByPk(id);
}
