// Type declaration for react-native-config environment variables
declare module 'react-native-config' {
  export interface NativeConfig {
    API_URL: string;
    APP_ENV: 'development' | 'staging' | 'production';
    APP_NAME: string;
    MAPBOX_PUBLIC_TOKEN: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
