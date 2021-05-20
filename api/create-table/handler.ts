import { giveStartCards } from '@services/cards-functions/operations';
import { connect } from '@services/sequelize.service';

if (process.env.LAMBDA_TASK_ROOT) {
  process.env.PATH = `${process.env.PATH}:${process.env.LAMBDA_TASK_ROOT}/bin`;
}

exports.createTable = async (event, context) => {
  connect();
  return 'get';
};
