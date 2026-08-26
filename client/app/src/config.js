import { Platform } from 'react-native';

const DEV_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL || DEV_URL;
const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

export default API_URL;
