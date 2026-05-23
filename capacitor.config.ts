import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.willx1xu.fittrack',
  appName: 'FitTrack',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000',
    },
  },
}

export default config
