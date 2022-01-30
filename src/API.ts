import axios from 'axios';

export default axios.create({
  baseURL: `${
    (process.env.NODE_ENV || 'development') === 'development'
      ? 'http://localhost:3000'
      : `${process.env.NEXT_PUBLIC_INFO_URL}`
  }/api/`,
  responseType: 'json',
});
