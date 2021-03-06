import { AppError, ErrorStatusCode } from '@helper/app-error';
import { log, shortAxiosError } from '@helper/logger';
import { AxiosError } from 'axios';

export function errorHandler(caughtError: Error | AppError | AxiosError): undefined {
  let error = caughtError;
  const axiosError = (caughtError as AxiosError).isAxiosError && shortAxiosError(caughtError as AxiosError);

  if (!(error instanceof AppError)) {
    /**
     * It means that error was unexpected and can have unpredictable structure
     * For example, Axios errors have different structure
     * Also, we can send all unexpected errors to Sentry here
     */
    log('This error was not generated by us. We should extract the statusCode, name and message here');

    if (axiosError) {
      error = {
        statusCode: axiosError.error.status as ErrorStatusCode,
        message: axiosError.error.statusText,
        name: '',
      };
    } else {
      error = { statusCode: 500, message: error.message, name: error.name };
    }
  }

  /**
   * console.log allows displaying the error message and stack trace
   * But Axios error has complicated structure that doesn't allow debugging it easily
   */
  if (axiosError) {
    console.log(axiosError);
  } else {
    console.log(caughtError);
  }

  /**
   * Serverless supports following status codes:
   * 400  Bad Request
   * 401  Unauthorized
   * 403  Forbidden
   * 404  Not Found
   * 422  Unprocessable Entity
   * 500  Internal Server Error
   * 502  Bad Gateway
   * 504  Gateway Timeout
   */

  /**
   * The error message looks like: [404] Not Found. User does not exist
   */
  switch (error.statusCode) {
    case 400:
      throw `[${error.statusCode}] ${error.name ? `${error.name}. ` : ''}${error.message || 'Bad request'}`;
    case 401:
      throw `[${error.statusCode}] ${error.name ? `${error.name}. ` : ''}${error.message || 'Unauthorized'}`;
    case 403:
      throw `[${error.statusCode}] ${error.name ? `${error.name}. ` : ''}${error.message || 'Forbidden'}`;
    case 404:
      throw `[${error.statusCode}] ${error.name ? `${error.name}. ` : ''}${error.message || 'Not Found'}`;
    case 409:
      throw `[400] ${error.name ? `${error.name}. ` : ''}${error.message || 'Conflict'}`;
    case 422:
      throw `[${error.statusCode}] ${error.name ? `${error.name}. ` : ''}${error.message || 'Unprocessable Entity'}`;
    case 429:
      throw `[400] ${error.name ? `${error.name}. ` : ''}${error.message || 'Too Many Requests'}`;
    case 500:
      throw `[${error.statusCode}] ${error.name ? `${error.name}. ` : ''}${error.message || 'Internal Server Error'}`;
    case 502:
      throw `[${error.statusCode}] ${error.name ? `${error.name}. ` : ''}${error.message || 'Bad Gateway'}`;
    case 503:
      throw `[500] ${error.name ? `${error.name}. ` : ''}${error.message || 'Service Unavailable'}`;
    case 504:
      throw `[${error.statusCode}] ${error.name ? `${error.name}. ` : ''}${error.message || 'Gateway Timeout'}`;
    default:
      throw `[500] ${error.name ? `${error.name}. ` : ''}${error.message || 'Internal Server Error'}`;
  }
}
