import { ReactElement } from 'react';
import { NavLink } from 'react-router-dom';

import styles from './Nav.module.scss';
import { ROUTES } from '../common';

export function Nav(
    props: {
        bluetooth: Bluetooth;
        isConnected: boolean;
        isConnecting: boolean;
        isDisconnecting: boolean;
        onConnect: () => void;
        onDisconnect: () => void;
    }
): ReactElement {
    const navItems: ReactElement[] = [];
    if (props.isConnected) {
        navItems.push(
            <button onClick={props.onDisconnect} disabled={props.isDisconnecting}>Disconnect</button>,
            <NavLink to={ROUTES.hubProperties}
                     className={(isActive): string | undefined => isActive ? styles.activeLinkItem : undefined}
            >
                Hub properties
            </NavLink>,
            <NavLink to={ROUTES.ports}
                     className={(isActive): string | undefined => isActive ? styles.activeLinkItem : undefined}
            >
                Ports
            </NavLink>,
            <NavLink to={ROUTES.motors}
                     className={(isActive): string | undefined => isActive ? styles.activeLinkItem : undefined}
            >
                Motors
            </NavLink>,
            <NavLink to={ROUTES.sensors}
                     className={(isActive): string | undefined => isActive ? styles.activeLinkItem : undefined}
            >
                Ports
            </NavLink>
        );
    } else {
        navItems.push(
            <button onClick={props.onConnect} disabled={props.isConnecting}>Connect</button>
        );
    }

    return (
        <nav>
            <ol className={styles.navList}>
                {navItems.map((navItem, index) => <li key={index}>{navItem}</li>)}
            </ol>
        </nav>
    );
}
