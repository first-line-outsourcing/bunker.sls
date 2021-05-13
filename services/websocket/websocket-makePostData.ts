import { PostData } from '@services/websocket/websocket-postData.interface';

export function makeErrorData(description: string): PostData {
  return { status: 'ERROR', body: { description: description } };
}

export function makePostData(name: string, body?: {}): PostData {
  return { status: name, body: body };
}
