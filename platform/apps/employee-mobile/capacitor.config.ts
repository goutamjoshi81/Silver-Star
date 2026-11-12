import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.silverstarindia.app',
  appName: 'Silver Star',
  webDir: 'dist',
  backgroundColor: '#030712',
  server: {
    androidScheme: 'http',
    cleartext: true,
  },
  ios: {
    backgroundColor: '#030712',
    contentInset: 'never',
    scrollEnabled: false,
  },
  plugins: {
    Geolocation: {},
    Camera: {},
  },
};

export default config;

