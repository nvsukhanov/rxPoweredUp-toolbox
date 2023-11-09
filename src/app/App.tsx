import { ReactElement, useCallback, useEffect, useState } from 'react';
import { container } from 'tsyringe';
import { IHub, connectHub } from 'rxpoweredup';

import styles from './App.module.scss';
import { Nav } from '../nav';
import { BluetoothAvailability, HubConnectionState, NAVIGATOR } from '../types';
import { RouterOutlet } from './Router-outlet';
import { BluetoothUnavailableNotification } from '../common';
import { useHubStore } from '../store';

export function App(
    _: unknown,
    __: unknown,
    navigator: Navigator = container.resolve(NAVIGATOR),
): ReactElement {
    const [ hub, setHub ] = useState<IHub | undefined>(undefined);
    const isBluetoothAvailable = useHubStore((state) => state.isBluetoothAvailable);
    const setBluetoothAvailability = useHubStore((state) => state.setBluetoothAvailability);
    const hubConnection = useHubStore((state) => state.hubConnection);
    const setHubConnectionState = useHubStore((state) => state.setHubConnection);

    useEffect(() => {
        if (!isBluetoothAvailable) {
            if (navigator.bluetooth === undefined) {
                setBluetoothAvailability(false);
            } else {
                navigator.bluetooth.getAvailability().then((isAvailable) => {
                    setBluetoothAvailability(isAvailable);
                });
            }
        }
    }, [ isBluetoothAvailable, setBluetoothAvailability, navigator.bluetooth ]);

    const connect = useCallback(() => {
        if (hubConnection !== HubConnectionState.Disconnected) {
            throw new Error('Cannot connect when already connected or connecting.');
        }
        setHub(undefined);
        setHubConnectionState(HubConnectionState.Connecting);
        connectHub(navigator.bluetooth).subscribe({
            next: (connectedHub) => {
                setHub(connectedHub);
                setHubConnectionState(HubConnectionState.Connected);
            },
            error: () => setHubConnectionState(HubConnectionState.Disconnected),
        });
    }, [ hubConnection, setHubConnectionState, setHub, navigator.bluetooth ]);

    const disconnect = useCallback(() => {
        if (hubConnection !== HubConnectionState.Connected) {
            throw new Error('Cannot disconnect when not connected.');
        }
        setHubConnectionState(HubConnectionState.Disconnecting);
        hub?.disconnect().subscribe({
            complete: () => {
                setHubConnectionState(HubConnectionState.Disconnected);
                setHub(undefined);
            },
        });
    }, [ hubConnection, setHubConnectionState, setHub, hub ]);

    switch (isBluetoothAvailable) {
        case BluetoothAvailability.Unknown:
            return (
                <main className={styles.main}>
                    Checking Bluetooth availability...
                </main>
            );
        case BluetoothAvailability.Available:
            return (
                <>
                    <header>
                        <Nav connectionState={hubConnection}
                             onConnect={(): void => connect()}
                             onDisconnect={(): void => disconnect()}
                        />
                    </header>
                    <main className={styles.main}>
                        <RouterOutlet hub={hub}/>
                    </main>
                </>
            );
        case BluetoothAvailability.Unavailable:
            return (
                <main className={styles.main}>
                    <BluetoothUnavailableNotification/>
                </main>
            );
    }
}
