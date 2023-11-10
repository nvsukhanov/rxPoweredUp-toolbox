import { HubType, IHub } from 'rxpoweredup';
import { ChangeEvent, ReactElement, useCallback, useEffect, useId, useRef, useState } from 'react';
import { Subject, takeUntil } from 'rxjs';
import { container } from 'tsyringe';

import styles from './Voltage-sensor.module.scss';
import { useHubStore } from '../store';
import { ERROR_HANDLER, HUB_TYPES_LIST, IErrorHandler } from '../types';

export function VoltageSensor(
    props: {
        hub: IHub;
    },
    _: unknown,
    errorHandler: IErrorHandler = container.resolve(ERROR_HANDLER)
): ReactElement {
    const portIdInputId = useId();
    const modeIdInputId = useId();
    const hubTypeSelectId = useId();
    const thresholdInputId = useId();
    const [ portId, setPortId ] = useState<number | null>(0);
    const [ modeId, setModeId ] = useState<number | null>(0);
    const [ hubTypeSelect, setHubTypeSelect ] = useState<HubType>(HubType.Unknown);
    const [ hubTypeSelectDirty, setHubTypeSelectDirty ] = useState<boolean>(false);
    const [ threshold, setThreshold ] = useState<number | null>(0.01);
    const [ isSubscribed, setIsSubscribed ] = useState<boolean>(false);
    const disposeRef = useRef(new Subject<void>());
    const dispose$ = disposeRef.current;
    const unsubscribeRef = useRef(new Subject<void>());
    const unsubscribe$ = unsubscribeRef.current;
    const sensorVoltage = useHubStore((state) => state.sensorsData.voltage);
    const updateSensorVoltage = useHubStore((state) => state.updateSensorVoltage);
    const storeHubType = useHubStore((state) => state.hubProperties.systemTypeId);

    useEffect(() => {
        if (!hubTypeSelectDirty && storeHubType !== undefined) {
            setHubTypeSelect(storeHubType);
        }

        return () => {
            dispose$.next();
            dispose$.complete();
        };
    }, [ dispose$, hubTypeSelectDirty, storeHubType ]);

    const canRead = useCallback(() => {
        return portId !== null && portId >= 0
            && modeId !== null && modeId >= 0;
    }, [ portId, modeId ]);

    const canSubscribe = useCallback(() => {
        return portId !== null && portId >= 0
            && modeId !== null && modeId >= 0
            && threshold !== null && threshold >= 0.001
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

    function handleHubTypeChange(
        event: ChangeEvent<HTMLSelectElement>
    ): void {
        setHubTypeSelectDirty(true);
        setHubTypeSelect(+event.target.value as HubType);
        unsubscribe$.next();
        updateSensorVoltage(undefined);
    }

    const handleVoltageRead = useCallback(() => {
        if (canRead() && portId !== null && modeId !== null) {
            props.hub.sensors.getVoltage(portId, modeId, hubTypeSelect).pipe(
                takeUntil(dispose$)
            ).subscribe({
                next: (voltage) => updateSensorVoltage(voltage),
                error: (error) => errorHandler.handleError(error)
            });
        }
    }, [ canRead, props.hub, portId, modeId, updateSensorVoltage, dispose$, hubTypeSelect, errorHandler ]);

    const handleVoltageSubscribe = useCallback(() => {
        if (canSubscribe() && portId !== null && modeId !== null && threshold !== null) {
            setIsSubscribed(true);
            props.hub.sensors.voltageChanges(portId, modeId, threshold, hubTypeSelect).pipe(
                takeUntil(unsubscribe$)
            ).subscribe({
                next: (voltage) => updateSensorVoltage(voltage),
                error: (error) => errorHandler.handleError(error),
                complete: () => setIsSubscribed(false)
            });
        }
    }, [ canSubscribe, props.hub, portId, modeId, threshold, updateSensorVoltage, unsubscribe$, hubTypeSelect, errorHandler, setIsSubscribed ]);

    const handleVoltageUnsubscribe = useCallback(() => {
        unsubscribe$.next();
    }, [ unsubscribe$ ]);

    return (
        <section>
            <div>Value: {sensorVoltage === undefined ? 'Unknown' : sensorVoltage}</div>
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
                    <select id={hubTypeSelectId}
                            onChange={handleHubTypeChange}
                            value={hubTypeSelect}
                    >
                        {HUB_TYPES_LIST.map((hubType) => (
                            <option value={hubType}
                                    key={hubType}
                            >
                                {HubType[hubType]}
                            </option>))
                        }
                    </select>
                </section>
                <section>
                    <label htmlFor={thresholdInputId}>Threshold</label>
                    <input id={thresholdInputId}
                           type={'number'}
                           min={0.001}
                           max={10}
                           value={threshold ?? ''}
                           onChange={handleThresholdChange}
                    />
                </section>
                <button disabled={!canRead()}
                        onClick={handleVoltageRead}
                >
                    Read
                </button>
                <button disabled={!canSubscribe()}
                        onClick={handleVoltageSubscribe}
                >
                    Subscribe
                </button>
                <button disabled={!isSubscribed}
                        onClick={handleVoltageUnsubscribe}
                >
                    Unsubscribe
                </button>
            </section>
        </section>
    );
}
