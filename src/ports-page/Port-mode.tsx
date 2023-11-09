import { Fragment, ReactElement } from 'react';
import { PortModeInformationType } from 'rxpoweredup';

import styles from './Port-mode.module.scss';
import { PortModeInfoState, PortModeState, hashPortIdModeId } from '../store';
import { InputPortModeId } from './Input-port-mode-id';
import { OutputPortModeId } from './Output-port-mode-id';

export function PortMode(
    props: {
        portMode: PortModeState;
        portModeInfoRecord?: Record<string, PortModeInfoState>;
        onPortModeIdRawValueReadRequest: (modeId: number) => void;
        onPortModeIdGetInfoRequest: (modeId: number, infoType: PortModeInformationType) => void;
    }
): ReactElement {
    return (
        <section>
            <section>
                <div>
                    <span className={styles.valueTitle}>Logical combinable:</span>
                    <span> {props.portMode.capabilities.logicalCombinable ? 'yes' : 'no'}</span>
                </div>
                <div>
                    <span className={styles.valueTitle}>Logical synchronizable:</span>
                    <span> {props.portMode.capabilities.logicalSynchronizable ? 'yes' : 'no'}</span>
                </div>
            </section>
            {
                props.portMode.inputModes.length > 0 &&
                <section>
                    <div className={styles.valueTitle}>Input modes:</div>
                    <section className={styles.modesList}>
                        {props.portMode.inputModes.map((modeId, idx) => <Fragment key={idx}>
                            <InputPortModeId modeId={modeId}
                                             data={props.portModeInfoRecord && props.portModeInfoRecord[hashPortIdModeId(props.portMode.portId, modeId)]}
                                             onPortModeIdRawValueReadRequest={(): void => props.onPortModeIdRawValueReadRequest(modeId)}
                                             onPortModeIdGetInfoRequest={(infoType): void => props.onPortModeIdGetInfoRequest(modeId, infoType)}
                            ></InputPortModeId>
                        </Fragment>)}
                    </section>
                </section>
            }
            {
                props.portMode.outputModes.length > 0 &&
                <section className={styles.modesSection}>
                    <div className={styles.valueTitle}>Output modes:</div>
                    <section className={styles.modesList}>
                        {props.portMode.outputModes.map((modeId, idx) => <Fragment key={idx}>
                            <OutputPortModeId modeId={modeId}
                                              data={props.portModeInfoRecord && props.portModeInfoRecord[hashPortIdModeId(props.portMode.portId, modeId)]}
                                              onPortModeIdGetInfoRequest={(infoType): void => props.onPortModeIdGetInfoRequest(modeId, infoType)}
                            />
                        </Fragment>)}
                    </section>
                </section>
            }
        </section>
    );
}
