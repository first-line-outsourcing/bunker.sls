import ApiGatewayManagementApi = require('aws-sdk/clients/apigatewaymanagementapi');
import { findAllActiveConnectionId, updateIsOnlineByConnectionId } from '@services/queries/player.queries';

//send to client

export function apigwManagement(event) {
  return new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: process.env.IS_OFFLINE
      ? 'http://localhost:3001'
      : `${event.requestContext.domainName}/${event.requestContext.stage}`,
  });
}

export async function postData(connectionId, data, event, gameId) {
  const postData = JSON.parse(data);
  let connectionArray: string[] = [];

  try {
    const connectionData = await findAllActiveConnectionId(gameId);
    connectionArray = connectionData.map((value) => value.connectionId);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  const apigwManagementApi = await apigwManagement(event);
  const postCalls = connectionArray.map(async ({ connectionId }) => {
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