import { ReactElement, useCallback, useEffect } from 'react';
import { IHub } from 'rxpoweredup';
import { useShallow } from 'zustand/react/shallow';

import { HubNotConnectedNotification } from '../common';
import { PhysicalPortState, VirtualPortState, useHubStore } from '../store';
import { PortsList } from './Ports-list';

export function PortsPage(
    props: {
        hub: IHub | undefined;
    }
): ReactElement {
    const ports = useHubStore(useShallow((state) => state.ports));
    const portModes = useHubStore(useShallow((state) => state.portModes));
    const portModeInfo = useHubStore(useShallow((state) => state.portModeInfo));

    const processIoAttach = useHubStore((state) => state.processIoAttachMessage);
    const processIoDetach = useHubStore((state) => state.processIoDetachMessage);
    const processPortModeMessage = useHubStore((state) => state.processPortModeMessage);
    const processPortModeInformationMessage = useHubStore((state) => state.processPortModeInformationMessage);
    const processPortModeInformationRequestError = useHubStore((state) => state.processPortModeInformationRequestError);
    const processPortRawValue = useHubStore((state) => state.processPortRawValue);

    useEffect(() => {
        if (props.hub) {
            const portAddSub = props.hub.ports.onIoAttach().subscribe((v) => processIoAttach(v));
            const portRemoveSub = props.hub.ports.onIoDetach().subscribe((v) => processIoDetach(v));
            return () => {
                portAddSub.unsubscribe();
                portRemoveSub.unsubscribe();
            };
        }
    }, [ props.hub, processIoAttach, processIoDetach ]);

    const handlePortModesRequest = useCallback((portId: number): void => {
        props.hub?.ports.getPortModes(portId).subscribe((r) => processPortModeMessage(r));
    }, [ props.hub, processPortModeMessage ]);

    const handleReadRawPortValueRequest = useCallback((portId: number, modeId: number): void => {
        props.hub?.ports.getRawPortValue(portId, modeId).subscribe((r) => processPortRawValue(portId, modeId, r));
    }, [ props.hub, processPortRawValue ]);

    const handlePortModeInfoRequest = useCallback((portId: number, modeId: number, infoType: number): void => {
        props.hub?.ports.getPortModeInformation(portId, modeId, infoType).subscribe({
            next: (r) => processPortModeInformationMessage(r),
            error: (e) => processPortModeInformationRequestError(portId, modeId, infoType, e)
        });
    }, [ props.hub, processPortModeInformationMessage, processPortModeInformationRequestError ]);

    if (!props.hub) {
        return (<HubNotConnectedNotification/>);
    }

    const physicalPorts = Object.values(ports).filter((port): port is PhysicalPortState => port.isPhysical);
    const virtualPorts = Object.values(ports).filter((port): port is VirtualPortState => !port.isPhysical);
    return (
        <>
            <h2>Ports</h2>
            <PortsList physicalPorts={physicalPorts}
                       virtualPorts={virtualPorts}
                       portModeDataRecord={portModes}
                       portModeInfoRecord={portModeInfo}
                       onPortModesRequest={handlePortModesRequest}
                       onPortModeIdRawValueReadRequest={handleReadRawPortValueRequest}
                       onPortModeIdGetInfoRequest={handlePortModeInfoRequest}
            />
        </>

    );
}
