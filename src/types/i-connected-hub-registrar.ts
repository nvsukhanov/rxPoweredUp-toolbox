import { IHub } from 'rxpoweredup';
import { InjectionToken } from 'tsyringe';

export interface IConnectedHubRegistrar {
    setConnectedHub(hub: IHub | undefined): void;
}

export const CONNECTED_HUB_REGISTRAR: InjectionToken<IConnectedHubRegistrar> = Symbol('CONNECTED_HUB_REGISTRAR');
