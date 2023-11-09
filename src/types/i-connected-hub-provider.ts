import { IHub } from 'rxpoweredup';
import { InjectionToken } from 'tsyringe';

export interface IConnectedHubProvider {
    readonly hub: IHub;
}

export const CONNECTED_HUB_PROVIDER: InjectionToken<IConnectedHubProvider> = Symbol('CONNECTED_HUB_PROVIDER');
