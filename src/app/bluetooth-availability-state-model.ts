import { BluetoothAvailability } from '../types';

export type BluetoothAvailabilityUnknown = {
    availability: BluetoothAvailability.Unknown;
};

export type BluetoothAvailabilityAvailable = {
    availability: BluetoothAvailability.Available;
    bluetooth: Bluetooth;
};

export type BluetoothAvailabilityUnavailable = {
    availability: BluetoothAvailability.Unavailable;
};

export type BluetoothAvailabilityStateModel = BluetoothAvailabilityUnknown | BluetoothAvailabilityAvailable | BluetoothAvailabilityUnavailable;
