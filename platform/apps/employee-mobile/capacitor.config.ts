import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.silverstarindia.app',
  appName: 'Silver Star',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    Geolocation: {},
    Camera: {},
  },
};

export default config;

