import configFile from '../../samples.config';
const axios = require('axios');

axios.interceptors.request.use(req => {
  req.headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `SSWS ${configFile.token}`
  }
  return req;
});

export default axios;
