import { ReactElement } from 'react';
import { IOType, PortModeInformationType } from 'rxpoweredup';

import styles from './Physical-port.module.scss';
import { PhysicalPortState, PortModeInfoState, PortModeState } from '../store';
import { PortMode } from './Port-mode.tsx';

export function PhysicalPort(
    props: {
        port: PhysicalPortState;
        portModeData?: PortModeState;
        portModeInfoRecord?: Record<string, PortModeInfoState>;
        onHandlePortModesRequest: () => void;
        onPortModeIdRawValueReadRequest: (portId: number, modeId: number) => void;
        onPortModeIdGetInfoRequest: (portId: number, modeId: number, infoType: PortModeInformationType) => void;
    }
): ReactElement {
    return (
        <>
            <section className={styles.portData}>
                <div className={styles.portName}>Port {props.port.portId}</div>
                <div>{IOType[props.port.ioType]}</div>
                <div>HW rev. {props.port.hardwareRevision}</div>
                <div>SW rev. {props.port.softwareRevision}</div>
            </section>
            <section className={styles.portModeData}>
                {
                    props.portModeData
                    ? <PortMode portMode={props.portModeData}
                                portModeInfoRecord={props.portModeInfoRecord}
                                onPortModeIdRawValueReadRequest={(modeId): void => props.onPortModeIdRawValueReadRequest(props.port.portId, modeId)}
                                onPortModeIdGetInfoRequest={(modeId, infoType): void => props.onPortModeIdGetInfoRequest(props.port.portId, modeId, infoType)}
                    ></PortMode>
                    : <button onClick={props.onHandlePortModesRequest}>Get port modes info</button>
                }
            </section>
        </>
    );
}
