import { ReactElement, useState } from 'react';
import { container } from 'tsyringe';
import { connectHub } from 'rxpoweredup';

import styles from './App.module.scss';
import { Nav } from '../nav';
import { BluetoothAvailability, NAVIGATOR } from '../types';
import { RouterOutlet } from './Router-outlet';
import { HubConnectionState, HubConnectionStateModel } from './hub-connection-state-model';
import { BluetoothAvailabilityStateModel } from './bluetooth-availability-state-model.ts';

export function App(
    _: unknown,
    __: unknown,
    navigator: Navigator = container.resolve(NAVIGATOR),
): ReactElement {
    const [ bluetoothState, setBluetooth ] = useState<BluetoothAvailabilityStateModel>({ availability: BluetoothAvailability.Unknown });
    const [ connectionState, setConnectionState ] = useState<HubConnectionStateModel>({ connectionState: HubConnectionState.Disconnected });

    if (bluetoothState.availability === BluetoothAvailability.Unknown) {
        navigator.bluetooth.getAvailability().then((isAvailable) => {
            return isAvailable ? navigator.bluetooth : null;
        }).then((bluetooth: Bluetooth | null) => {
            if (bluetooth) {
                setBluetooth({ availability: BluetoothAvailability.Available, bluetooth });
            } else {
                setBluetooth({ availability: BluetoothAvailability.Unavailable });
            }
        });
    }

    function connect(bluetooth: Bluetooth): void {
        if (connectionState.connectionState !== HubConnectionState.Disconnected) {
            throw new Error('Cannot connect when already connected or connecting.');
        }
        setConnectionState({ connectionState: HubConnectionState.Connecting });
        connectHub(bluetooth).subscribe({
            next: (hub) => setConnectionState({ connectionState: HubConnectionState.Connected, hub }),
            error: () => setConnectionState({ connectionState: HubConnectionState.Disconnected }),
        });
    }

    function disconnect(): void {
        if (connectionState.connectionState !== HubConnectionState.Connected) {
            throw new Error('Cannot disconnect when not connected.');
        }
        setConnectionState({ connectionState: HubConnectionState.Disconnecting, hub: connectionState.hub });
        connectionState.hub.disconnect().subscribe({
            complete: () => setConnectionState({ connectionState: HubConnectionState.Disconnected }),
        });
    }

    switch (bluetoothState.availability) {
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
                        <Nav bluetooth={bluetoothState.bluetooth}
                             isConnected={connectionState.connectionState === HubConnectionState.Connected}
                             isConnecting={connectionState.connectionState === HubConnectionState.Connecting}
                             isDisconnecting={connectionState.connectionState === HubConnectionState.Disconnecting}
                             onConnect={(): void => connect(bluetoothState.bluetooth)}
                             onDisconnect={(): void => disconnect()}
                        />
                    </header>
                    <main className={styles.main}>
                        <RouterOutlet hubConnectionState={connectionState}/>
                    </main>
                </>
            );
        case BluetoothAvailability.Unavailable:
            return (
                <main className={styles.main}>
                    Bluetooth is not available.
                </main>
            );
    }
}
