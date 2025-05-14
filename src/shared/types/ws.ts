import { WS_MESSAGE_TYPE } from "../enums";

export type ActiveSocket = {
    socketId: string;
    userId: string;
}

export type WsMessage<T> = {
    type: WS_MESSAGE_TYPE;
    payload: T
}
