import { ReactElement } from 'react';
import { IHub } from 'rxpoweredup';

import { HubNotConnectedNotification } from '../common';
import { VoltageSensor } from './Voltage-sensor';
import styles from './Sensors-page.module.scss';
import { TemperatureSensor } from './Temperature-sensor';
import { TiltSensor } from './Tilt-sensor';

export function SensorsPage(
    props: {
        hub: IHub | undefined;
    }
): ReactElement {
    if (!props.hub) {
        return (<HubNotConnectedNotification/>);
    }
    return (
        <>
            <section>
                <h2>Voltage</h2>
                <section className={styles.sensorContainer}>
                    <VoltageSensor hub={props.hub}/>
                </section>
            </section>

            <section>
                <h2>Temperature</h2>
                <section className={styles.sensorContainer}>
                    <TemperatureSensor hub={props.hub}/>
                </section>
            </section>

            <section>
                <h2>Tilt</h2>
                <section className={styles.sensorContainer}>
                    <TiltSensor hub={props.hub}/>
                </section>
            </section>
        </>
    );
}
