import ApiGatewayManagementApi = require('aws-sdk/clients/apigatewaymanagementapi');
import { PostData } from '@services/websocket/websocket-postData.interface';
import { findAllActiveConnectionId, updateIsOnlineByConnectionId } from '../queries/player.queries';

//send to client

export function apigwManagement(event) {
  return new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    accessKeyId: process.env.AWS_ACCESS_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    endpoint: process.env.IS_OFFLINE
      ? 'http://localhost:3001'
      : `${event.requestContext.domainName}/${event.requestContext.stage}`,
  });
}

export async function postToPlayer(connectionId, postData: PostData, event) {
  //TODO переделать с connectionId
  const apigwManagementApi = await apigwManagement(event);
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

export async function postToAllPlayersData(connectionId, data, event, gameId) {
  const postData = JSON.parse(data);
  let connectionArray: string[] = [];

  try {
    const connectionData = await findAllActiveConnectionId(gameId);
    connectionArray = connectionData.map((value) => value.connectionId);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  const apigwManagementApi = await apigwManagement(event);

  const postCalls = connectionArray.map(async ({}) => {
    try {
      await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: postData }).promise();
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection set Offline ${connectionId}`);
        await updateIsOnlineByConnectionId(connectionId);
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
