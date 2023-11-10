import { Fragment, ReactElement } from 'react';
import { PortModeInformationType } from 'rxpoweredup';

import { PortModeInfoState } from '../store';
import { numberFromLeArray, numberToHex } from '../common';
import styles from './Input-port-mode-id.module.scss';
import { PORT_MODE_INFORMATION_TYPES_LIST } from './port-mode-information-types-list';

export function InputPortModeId(
    props: {
        modeId: number;
        data?: PortModeInfoState;
        onPortModeIdRawValueReadRequest: () => void;
        onPortModeIdGetInfoRequest: (infoType: PortModeInformationType) => void;
    }
): ReactElement {
    const rawValue = props.data?.rawValue;
    const rawNumber = rawValue && numberFromLeArray(rawValue);
    const rawNumberHex = rawValue && rawValue.map((byte) => numberToHex(byte)).join(' ');
    return (
        <section>
            <section className={styles.modeIdHeader}>
                <div className={styles.modeIdTitle}>Mode Id:</div>
                <div>{props.modeId}</div>
                <div>
                    <button onClick={props.onPortModeIdRawValueReadRequest}>Read raw value</button>
                </div>
            </section>

            <dl className={styles.modeValuesContainer}>
                <dd>Raw value</dd>
                <dt>{
                    props.data?.rawValue
                    ? <dl className={styles.rawValueResultsContainer}>
                        <dt>Numeric:</dt>
                        <dd>{rawNumber}</dd>
                        <dt>Raw:</dt>
                        <dd>{JSON.stringify(props.data.rawValue, null, 2)}</dd>
                        <dt>Hex:</dt>
                        <dd>{rawNumberHex}</dd>
                    </dl>
                    : <span>--</span>
                }</dt>
                {
                    PORT_MODE_INFORMATION_TYPES_LIST.map((infoType) => {
                        return (
                            <Fragment key={infoType}>
                                <dd>{PortModeInformationType[infoType]}</dd>
                                <dt>{
                                    props.data?.modeInfo[infoType]
                                    ? <>{JSON.stringify(props.data?.modeInfo[infoType] || null, null, 2)}</>
                                    : <button onClick={(): void => props.onPortModeIdGetInfoRequest(infoType)}>Get</button>
                                }</dt>
                            </Fragment>
                        );
                    })
                }
            </dl>
        </section>
    );
}
