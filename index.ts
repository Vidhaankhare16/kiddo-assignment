import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent wires App as the root and ensures the environment is set
// up correctly whether running in Expo Go or a native build.
registerRootComponent(App);
