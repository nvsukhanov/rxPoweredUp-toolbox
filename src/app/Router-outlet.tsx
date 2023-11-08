import { JSX } from 'react';
import { Routes } from 'react-router-dom';

import { buildRoutes } from './routes-factory';
import { HubConnectionState, HubConnectionStateModel } from './hub-connection-state-model';

export function RouterOutlet(
    props: {
        hubConnectionState: HubConnectionStateModel;
    }
): JSX.Element {
    const routes = buildRoutes(
        props.hubConnectionState.connectionState === HubConnectionState.Connected ? props.hubConnectionState.hub : undefined
    );
    return (
        <Routes>
            {routes}
        </Routes>
    );
}
