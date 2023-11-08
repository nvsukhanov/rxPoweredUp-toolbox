import { IHub } from 'rxpoweredup';

export enum HubConnectionState {
    Disconnected,
    Connecting,
    Connected,
    Disconnecting,
}

export type HubIsNotConnected = {
    connectionState: HubConnectionState.Disconnected;
};

export type HubIsConnecting = {
    connectionState: HubConnectionState.Connecting;
};

export type HubIsConnected = {
    connectionState: HubConnectionState.Connected;
    hub: IHub;
};

export type HubIsDisconnecting = {
    connectionState: HubConnectionState.Disconnecting;
    hub: IHub;
};

export type HubConnectionStateModel = HubIsNotConnected | HubIsConnecting | HubIsConnected | HubIsDisconnecting;
