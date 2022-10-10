import axios from 'axios';
import { API_URI } from 'src/constants';
axios.defaults.baseURL = API_URI;

export * from './board';
