import { ReactElement } from 'react';
import { IHub } from 'rxpoweredup';

import { HubNotConnectedNotification } from '../common';

export function MotorsPage(
    props: {
        hub: IHub | undefined;
    }
): ReactElement {
    if (!props.hub) {
        return (<HubNotConnectedNotification/>);
    }
    return (
        <p>Motors Page</p>
    );
}
