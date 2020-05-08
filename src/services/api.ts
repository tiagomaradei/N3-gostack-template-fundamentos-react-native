import axios from 'axios';

const api = axios.create({
  baseURL: 'http://bff41fe5.ngrok.io',
});

export default api;
