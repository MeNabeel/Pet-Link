import { Platform } from 'react-native';

const DEV_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
const API_URL = process.env.EXPO_PUBLIC_API_URL || DEV_URL;

export default API_URL;
