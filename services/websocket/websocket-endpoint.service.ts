import ApiGatewayManagementApi = require('aws-sdk/clients/apigatewaymanagementapi');
import { PostData } from '@services/websocket/websocket-postData.interface';
import { findAllActiveConnectionId, updateIsOnlineByConnectionId } from '../queries/player.queries';

//send to client

export function apigwManagement() {
  //TODO сделать нормально
  return new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    accessKeyId: process.env.AWS_ACCESS_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    // endpoint: process.env.IS_OFFLINE
    //   ? 'http://localhost:3001'
    //   : `${event.requestContext.domainName}/${event.requestContext.stage}`,
    endpoint: 'http://localhost:3001',
  });
}

export async function postToPlayer(connectionId, postData: PostData) {
  //TODO переделать с connectionId
  const apigwManagementApi = await apigwManagement();
  try {
    await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(postData) }).promise();
  } catch (e) {
    if (e.statusCode === 410) {
      console.log(`Found stale connection set Offline ${connectionId}`);
      await updateIsOnlineByConnectionId(connectionId);
    } else {
      throw e;
    }
  }
}

export async function postToAllPlayersData(data, gameId) {
  const postData = JSON.stringify(data);
  let connectionArray: string[] = [];

  try {
    const connectionData = await findAllActiveConnectionId(gameId);
    connectionArray = connectionData.map((value) => value.connectionId);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  const apigwManagementApi = await apigwManagement();

  const postCalls = connectionArray.map(async (value) => {
    try {
      await apigwManagementApi.postToConnection({ ConnectionId: value, Data: postData }).promise();
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection set Offline ${value}`);
        await updateIsOnlineByConnectionId(value);
      } else {
        throw e;
      }
    }
  });

  try {
    await Promise.all(postCalls);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }
}
