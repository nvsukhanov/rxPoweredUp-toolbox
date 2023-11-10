import { IHub } from 'rxpoweredup';
import { ChangeEvent, ReactElement, useCallback, useEffect, useId, useRef, useState } from 'react';
import { Subject, takeUntil } from 'rxjs';
import { container } from 'tsyringe';

import styles from './Temperature-sensor.module.scss';
import { useHubStore } from '../store';
import { ERROR_HANDLER, IErrorHandler } from '../types';

export function TemperatureSensor(
    props: {
        hub: IHub;
    },
    _: unknown,
    errorHandler: IErrorHandler = container.resolve(ERROR_HANDLER)
): ReactElement {
    const portIdInputId = useId();
    const modeIdInputId = useId();
    const thresholdInputId = useId();
    const [ portId, setPortId ] = useState<number | null>(0);
    const [ modeId, setModeId ] = useState<number | null>(0);
    const [ threshold, setThreshold ] = useState<number | null>(0.01);
    const [ isSubscribed, setIsSubscribed ] = useState<boolean>(false);
    const disposeRef = useRef(new Subject<void>());
    const dispose$ = disposeRef.current;
    const unsubscribeRef = useRef(new Subject<void>());
    const unsubscribe$ = unsubscribeRef.current;
    const sensorTemperature = useHubStore((state) => state.sensorsData.temperature);
    const updateSensorTemperature = useHubStore((state) => state.updateSensorTemperature);

    useEffect(() => {
        return () => {
            dispose$.next();
            dispose$.complete();
        };
    }, [ dispose$ ]);

    const canRead = useCallback(() => {
        return portId !== null && portId >= 0
            && modeId !== null && modeId >= 0;
    }, [ portId, modeId ]);

    const canSubscribe = useCallback(() => {
        return portId !== null && portId >= 0
            && modeId !== null && modeId >= 0
            && threshold !== null && threshold >= 0.01
            && !isSubscribed;
    }, [ portId, modeId, threshold, isSubscribed ]);

    function handlePortIdChange(
        event: ChangeEvent<HTMLInputElement>
    ): void {
        const value = event.target.value !== '' ? +event.target.value : null;
        setPortId(value);
    }

    function handleModeIdChange(
        event: ChangeEvent<HTMLInputElement>
    ): void {
        const value = event.target.value !== '' ? +event.target.value : null;
        setModeId(value);
    }

    function handleThresholdChange(
        event: ChangeEvent<HTMLInputElement>
    ): void {
        const value = event.target.value !== '' ? +event.target.value : null;
        setThreshold(value);
    }

    const handleTemperatureRead = useCallback(() => {
        if (canRead() && portId !== null && modeId !== null) {
            props.hub.sensors.getTemperature(portId, modeId).pipe(
                takeUntil(dispose$)
            ).subscribe({
                next: (temperature) => updateSensorTemperature(temperature),
                error: (error) => errorHandler.handleError(error)
            });
        }
    }, [ canRead, props.hub, portId, modeId, updateSensorTemperature, dispose$, errorHandler ]);

    const handleTemperatureSubscribe = useCallback(() => {
        if (canSubscribe() && portId !== null && modeId !== null && threshold !== null) {
            setIsSubscribed(true);
            props.hub.sensors.temperatureChanges(portId, modeId, threshold).pipe(
                takeUntil(unsubscribe$)
            ).subscribe({
                next: (voltage) => updateSensorTemperature(voltage),
                error: (error) => errorHandler.handleError(error),
                complete: () => setIsSubscribed(false)
            });
        }
    }, [ canSubscribe, props.hub, portId, modeId, threshold, updateSensorTemperature, unsubscribe$, errorHandler, setIsSubscribed ]);

    const handleTemperatureUnsubscribe = useCallback(() => {
        unsubscribe$.next();
    }, [ unsubscribe$ ]);

    return (
        <section>
            <div>Value: {sensorTemperature === undefined ? 'Unknown' : sensorTemperature}</div>
            <section className={styles.controlsContainer}>
                <section>
                    <label htmlFor={portIdInputId}>Port ID</label>
                    <input id={portIdInputId}
                           type={'number'}
                           value={portId ?? ''}
                           min={0}
                           max={256}
                           onChange={handlePortIdChange}
                    />
                </section>
                <section>
                    <label htmlFor={modeIdInputId}>Mode ID</label>
                    <input id={modeIdInputId}
                           type={'number'}
                           value={modeId ?? ''}
                           min={0}
                           max={256}
                           onChange={handleModeIdChange}
                    />
                </section>
                <section>
                    <label htmlFor={thresholdInputId}>Threshold</label>
                    <input id={thresholdInputId}
                           type={'number'}
                           min={0.01}
                           max={10}
                           value={threshold ?? ''}
                           onChange={handleThresholdChange}
                    />
                </section>
                <button disabled={!canRead()}
                        onClick={handleTemperatureRead}
                >
                    Read
                </button>
                <button disabled={!canSubscribe()}
                        onClick={handleTemperatureSubscribe}
                >
                    Subscribe
                </button>
                <button disabled={!isSubscribed}
                        onClick={handleTemperatureUnsubscribe}
                >
                    Unsubscribe
                </button>
            </section>
        </section>
    );
}
