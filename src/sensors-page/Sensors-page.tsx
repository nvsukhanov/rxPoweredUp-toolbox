import { ReactElement } from 'react';
import { IHub } from 'rxpoweredup';

import { HubNotConnectedNotification } from '../common';

export function SensorsPage(
    props: {
        hub: IHub | undefined;
    }
): ReactElement {
    if (!props.hub) {
        return (<HubNotConnectedNotification/>);
    }
    return (
        <p>Sensors Page</p>
    );
}
