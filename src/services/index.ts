import axios from 'axios';
import { API_URI } from 'src/constants';
import { isServer } from 'src/utils/isServer';
axios.defaults.baseURL = isServer() ? `http://localhost:3000${API_URI}` : API_URI;

export * from './board';
