import { IHub } from 'rxpoweredup';

import { IConnectedHubProvider, IConnectedHubRegistrar } from '../../types';

export class ConnectedHubProvider implements IConnectedHubProvider, IConnectedHubRegistrar {
    private _hub?: IHub;

    public get hub(): IHub {
        if (!this._hub) {
            throw new Error('Hub not set');
        }
        return this._hub;
    }

    public setConnectedHub(hub: IHub): void {
        this._hub = hub;
    }
}
