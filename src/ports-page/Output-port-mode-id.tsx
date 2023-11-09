import { Fragment, ReactElement } from 'react';
import { PortModeInformationType } from 'rxpoweredup';

import { PortModeInfoState } from '../store';
import styles from './Output-port-mode-id.module.scss';
import { PORT_MODE_INFORMATION_TYPES_LIST } from './port-mode-information-types-list';

export function OutputPortModeId(
    props: {
        modeId: number;
        data?: PortModeInfoState;
        onPortModeIdGetInfoRequest: (infoType: PortModeInformationType) => void;
    }
): ReactElement {
    return (
        <section>
            <section className={styles.modeIdHeader}>
                <div className={styles.modeIdTitle}>Mode Id:</div>
                <div>{props.modeId}</div>
            </section>

            <dl className={styles.modeValuesContainer}>
                {
                    PORT_MODE_INFORMATION_TYPES_LIST.map((infoType, idx) => {
                        return (
                            <Fragment key={idx}>
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
