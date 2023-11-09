import { container } from 'tsyringe';

import { CONNECTED_HUB_PROVIDER, CONNECTED_HUB_REGISTRAR, NAVIGATOR, WINDOW } from './types';
import { ConnectedHubProvider } from './common';

export function provideRootDiTokens(): void {
    container.register(WINDOW, { useValue: window });
    container.register(NAVIGATOR, { useFactory: (c) => c.resolve(WINDOW).navigator });
    container.registerSingleton(ConnectedHubProvider);
    container.register(CONNECTED_HUB_PROVIDER, { useFactory: (c) => c.resolve(ConnectedHubProvider) });
    container.register(CONNECTED_HUB_REGISTRAR, { useFactory: (c) => c.resolve(ConnectedHubProvider) });
}
