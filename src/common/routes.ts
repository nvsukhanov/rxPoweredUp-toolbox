export const ROUTES = {
    root: '/',
    hubProperties: 'hub',
    motors: 'motors',
    sensors: 'sensors',
    ports: 'ports',
} as const satisfies { [k in string]: string };
