import { IHub } from 'rxpoweredup';
import { ChangeEvent, ReactElement, useCallback, useEffect, useId, useRef, useState } from 'react';
import { Subject, takeUntil } from 'rxjs';
import { container } from 'tsyringe';

import styles from './Tilt-sensor.module.scss';
import { useHubStore } from '../store';
import { ERROR_HANDLER, IErrorHandler } from '../types';

export function TiltSensor(
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
    const [ threshold, setThreshold ] = useState<number | null>(1);
    const [ isSubscribed, setIsSubscribed ] = useState<boolean>(false);
    const disposeRef = useRef(new Subject<void>());
    const dispose$ = disposeRef.current;
    const unsubscribeRef = useRef(new Subject<void>());
    const unsubscribe$ = unsubscribeRef.current;
    const sensorTilt = useHubStore((state) => state.sensorsData.tilt);
    const updateSensorTilt = useHubStore((state) => state.updateSensorTilt);

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
            && threshold !== null && threshold >= 1
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

    const handleTiltRead = useCallback(() => {
        if (canRead() && portId !== null && modeId !== null) {
            props.hub.sensors.getTilt(portId, modeId).pipe(
                takeUntil(dispose$)
            ).subscribe({
                next: (temperature) => updateSensorTilt(temperature),
                error: (error) => errorHandler.handleError(error)
            });
        }
    }, [ canRead, props.hub, portId, modeId, updateSensorTilt, dispose$, errorHandler ]);

    const handleTiltSubscribe = useCallback(() => {
        if (canSubscribe() && portId !== null && modeId !== null && threshold !== null) {
            setIsSubscribed(true);
            props.hub.sensors.tiltChanges(portId, modeId, threshold).pipe(
                takeUntil(unsubscribe$)
            ).subscribe({
                next: (voltage) => updateSensorTilt(voltage),
                error: (error) => errorHandler.handleError(error),
                complete: () => setIsSubscribed(false)
            });
        }
    }, [ canSubscribe, props.hub, portId, modeId, threshold, updateSensorTilt, unsubscribe$, errorHandler, setIsSubscribed ]);

    const handleTiltUnsubscribe = useCallback(() => {
        unsubscribe$.next();
    }, [ unsubscribe$ ]);

    return (
        <section>
            <div>
                <div>Roll: {sensorTilt !== undefined ? sensorTilt.roll : 'Unknown'}</div>
                <div>Pitch: {sensorTilt !== undefined ? sensorTilt.pitch : 'Unknown'}</div>
                <div>Yaw: {sensorTilt !== undefined ? sensorTilt.yaw : 'Unknown'}</div>
            </div>
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
                           min={1}
                           max={360}
                           value={threshold ?? ''}
                           onChange={handleThresholdChange}
                    />
                </section>
                <button disabled={!canRead()}
                        onClick={handleTiltRead}
                >
                    Read
                </button>
                <button disabled={!canSubscribe()}
                        onClick={handleTiltSubscribe}
                >
                    Subscribe
                </button>
                <button disabled={!isSubscribed}
                        onClick={handleTiltUnsubscribe}
                >
                    Unsubscribe
                </button>
            </section>
        </section>
    );
}
