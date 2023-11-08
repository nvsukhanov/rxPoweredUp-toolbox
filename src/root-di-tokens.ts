import { container } from 'tsyringe';

import { NAVIGATOR, WINDOW } from './types';

export function provideRootDiTokens(): void {
    container.register(WINDOW, { useValue: window });
    container.register(NAVIGATOR, { useFactory: (c) => c.resolve(WINDOW).navigator });
}
