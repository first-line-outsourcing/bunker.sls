import ApiGatewayManagementApi = require('aws-sdk/clients/apigatewaymanagementapi');

//send to client

export function apigwManagement(event) {
  return new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: process.env.IS_OFFLINE
      ? 'http://localhost:3001'
      : `${event.requestContext.domainName}/${event.requestContext.stage}`,
  });
}
