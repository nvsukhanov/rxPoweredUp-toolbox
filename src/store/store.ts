import { create } from 'zustand';
import {
    AttachIoEvent,
    AttachedIOAttachVirtualInboundMessage,
    AttachedIODetachInboundMessage,
    AttachedIoAttachInboundMessage,
    HubType,
    IOType,
    PortModeInboundMessage,
    PortModeInformationInboundMessage,
    PortModeInformationType
} from 'rxpoweredup';

import { BluetoothAvailability, HubConnectionState } from '../types';

export function hashPortIdModeId(portId: number, modeId: number): string {
    return `${portId}-${modeId}`;
}

export type PhysicalPortState = {
    isPhysical: true;
    portId: number;
    hardwareRevision: string;
    softwareRevision: string;
    ioType: IOType;
};

export type VirtualPortState = {
    isPhysical: false;
    portId: number;
    ioType: IOType;
    portIdA: number;
    portIdB: number;
};

export type PortModeState = {
    portId: number;
    inputModes: number[];
    outputModes: number[];
    capabilities: {
        output: boolean;
        input: boolean;
        logicalCombinable: boolean;
        logicalSynchronizable: boolean;
    };
};

export type PortModeInfoState = {
    portId: number;
    modeId: number;
    rawValue?: number[];
    modeInfo: {
        [k in PortModeInformationType]?: object
    };
};

export type HubPropertiesState = {
    batteryLevel?: number;
    rssiLevel?: number;
    buttonState?: boolean;
    advertisingName?: string;
    systemTypeId?: HubType;
    manufacturerName?: string;
    primaryMacAddress?: string;
};

export type HubStore = {
    isBluetoothAvailable: BluetoothAvailability;
    hubConnection: HubConnectionState;
    hubProperties: HubPropertiesState;
    ports: {
        [portId in number]: PhysicalPortState | VirtualPortState;
    };
    portModes: {
        [portId in number]: PortModeState;
    };
    portModeInfo: {
        [hash in string]: PortModeInfoState;
    };
    setBluetoothAvailability: (bluetoothAvailable: boolean) => void;
    setHubConnection: (hubConnectionState: HubConnectionState) => void;
    setHubProperty<K extends keyof HubPropertiesState>(key: K, value: HubPropertiesState[K]): void;
    processIoAttachMessage(message: AttachedIoAttachInboundMessage | AttachedIOAttachVirtualInboundMessage): void;
    processIoDetachMessage(message: AttachedIODetachInboundMessage): void;
    processPortModeMessage(message: PortModeInboundMessage): void;
    processPortModeInformationMessage(message: PortModeInformationInboundMessage): void;
    processPortModeInformationRequestError(portId: number, modeId: number, infoType: PortModeInformationType, error: Error): void;
    processPortRawValue(portId: number, modeId: number, rawValue: number[]): void;
    onHubDisconnect: () => void;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const useHubStore = create<HubStore>((set) => ({
    isBluetoothAvailable: BluetoothAvailability.Unknown,
    hubConnection: HubConnectionState.Disconnected,
    hubProperties: {},
    ports: {},
    portModes: {},
    portModeInfo: {},
    setHubProperty<K extends keyof HubPropertiesState>(key: K, value: HubPropertiesState[K]): void {
        set((state) => {
            return {
                ...state,
                hubProperties: {
                    ...state.hubProperties,
                    [key]: value
                }
            };
        });
    },
    processIoAttachMessage(
        message: AttachedIoAttachInboundMessage | AttachedIOAttachVirtualInboundMessage
    ): void {
        switch (message.event) {
            case AttachIoEvent.Attached:
                set((state) => {
                    return {
                        ...state,
                        ports: {
                            ...state.ports,
                            [message.portId]: {
                                isPhysical: true,
                                portId: message.portId,
                                hardwareRevision: message.hardwareRevision,
                                softwareRevision: message.softwareRevision,
                                ioType: message.ioTypeId
                            }
                        }
                    };
                });
                break;
            case AttachIoEvent.AttachedVirtual:
                set((state) => {
                    return {
                        ...state,
                        ports: {
                            ...state.ports,
                            [message.portId]: {
                                isPhysical: false,
                                portId: message.portId,
                                ioType: message.ioTypeId,
                                portIdA: message.portIdA,
                                portIdB: message.portIdB
                            }
                        }
                    };
                });
                break;
        }
    },
    processIoDetachMessage(message: AttachedIODetachInboundMessage): void {
        set((state) => {
            const ports = { ...state.ports };
            delete ports[message.portId];
            return {
                ...state,
                ports
            };
        });
    },
    processPortModeMessage(message: PortModeInboundMessage): void {
        set((state) => {
            return {
                ...state,
                portModes: {
                    ...state.portModes,
                    [message.portId]: {
                        portId: message.portId,
                        inputModes: message.inputModes,
                        outputModes: message.outputModes,
                        capabilities: { ...message.capabilities }
                    }
                }
            };
        });
    },
    processPortRawValue(portId: number, modeId: number, rawValue: number[]): void {
        const hash = hashPortIdModeId(portId, modeId);
        set((state) => {
            return {
                ...state,
                portModeInfo: {
                    ...state.portModeInfo,
                    [hash]: {
                        ...(state.portModeInfo[hash] || { modeInfo: {} }),
                        portId,
                        modeId,
                        rawValue,
                    }
                }
            };
        });
    },
    processPortModeInformationMessage(message: PortModeInformationInboundMessage): void {
        const hash = hashPortIdModeId(message.portId, message.mode);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { portId, mode, modeInformationType, messageType, ...data } = message;

        set((state) => {
            return {
                ...state,
                portModeInfo: {
                    ...state.portModeInfo,
                    [hash]: {
                        ...(state.portModeInfo[hash] || { rawValue: undefined }),
                        portId: message.portId,
                        modeId: message.mode,
                        modeInfo: {
                            ...state.portModeInfo[hash]?.modeInfo,
                            [message.modeInformationType]: data
                        }
                    }
                }
            };
        });
    },
    processPortModeInformationRequestError(portId: number, modeId: number, infoType: PortModeInformationType, error: Error): void {
        const hash = hashPortIdModeId(portId, modeId);
        set((state) => {
            return {
                ...state,
                portModeInfo: {
                    ...state.portModeInfo,
                    [hash]: {
                        ...(state.portModeInfo[hash] || { rawValue: undefined }),
                        portId,
                        modeId,
                        modeInfo: {
                            ...state.portModeInfo[hash]?.modeInfo,
                            [infoType]: { status: 'Error', error: error.toString() }
                        }
                    }
                }
            };
        });
    },
    setHubConnection: (hubConnectionState: HubConnectionState): void => {
        return set((state) => {
            return {
                ...state,
                hubConnection: hubConnectionState
            };
        });
    },
    setBluetoothAvailability: (isAvailable: boolean): void => {
        return set((state) => {
            return {
                ...state,
                isBluetoothAvailable: isAvailable ? BluetoothAvailability.Available : BluetoothAvailability.Unavailable
            };
        });
    },
    onHubDisconnect: (): void => {
        return set((state) => {
            return {
                ...state,
                hubConnection: HubConnectionState.Disconnected,
                ports: {},
                portModes: {}
            };
        });
    }
}));
