import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bacf078b54534301b99d888d6c6b7485',
  appName: 'SafeCampus - University Emergency App',
  webDir: 'dist',
  server: {
    url: 'https://bacf078b-5453-4301-b99d-888d6c6b7485.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Geolocation: {
      permissions: {
        location: "always"
      }
    }
  }
};

export default config;