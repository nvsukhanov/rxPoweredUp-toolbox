import { ReactElement } from 'react';
import { PortModeInformationType } from 'rxpoweredup';

import { PhysicalPortState, PortModeInfoState, PortModeState, VirtualPortState } from '../store';
import { PhysicalPort } from './Physical-port';

export function PortsList(
    props: {
        physicalPorts: PhysicalPortState[];
        virtualPorts: VirtualPortState[];
        portModeDataRecord: Record<number, PortModeState>;
        portModeInfoRecord: Record<string, PortModeInfoState>;
        onPortModesRequest: (portId: number) => void;
        onPortModeIdGetInfoRequest: (portId: number, modeId: number, infoType: PortModeInformationType) => void;
        onPortModeIdRawValueReadRequest: (portId: number, modeId: number) => void;
    }
): ReactElement {
    const physicalPortElements: ReactElement[] = props.physicalPorts.map((port: PhysicalPortState) => {
        return (
            <li key={port.portId}>
                <PhysicalPort port={port}
                              onHandlePortModesRequest={(): void => props.onPortModesRequest(port.portId)}
                              portModeData={props.portModeDataRecord[port.portId]}
                              portModeInfoRecord={props.portModeInfoRecord}
                              onPortModeIdRawValueReadRequest={props.onPortModeIdRawValueReadRequest}
                              onPortModeIdGetInfoRequest={props.onPortModeIdGetInfoRequest}
                />
            </li>
        );
    });
    return (
        <>
            <h3>
                Physical ports
            </h3>
            <ul>
                {physicalPortElements}
            </ul>
        </>
    );
}
