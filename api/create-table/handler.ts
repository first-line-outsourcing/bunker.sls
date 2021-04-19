import { errorHandler } from '@helper/error-handler';
import { log } from '@helper/logger';
import { connect } from '@services/sequelize.service';

if (process.env.LAMBDA_TASK_ROOT) {
  process.env.PATH = `${process.env.PATH}:${process.env.LAMBDA_TASK_ROOT}/bin`;
}

exports.createTable = (event, context) => {
  connect();
};
