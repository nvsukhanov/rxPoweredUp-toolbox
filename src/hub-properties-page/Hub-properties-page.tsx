import { JSX } from 'react';
import { IHub } from 'rxpoweredup';

import { HubNotConnectedNotification } from '../common';

export function HubPropertiesPage(
    props: {
        hub: IHub | undefined;
    }
): JSX.Element {
    if (!props.hub) {
        return (<HubNotConnectedNotification/>);
    }
    return (
        <p>Hub Properties Page</p>
    );
}
