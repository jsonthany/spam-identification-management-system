// import jwt_decode from 'jwt-decode';
// import http from './httpService';
// eslint-disable-next-line camelcase
import { FixMeLater } from '../fixMeLater';

declare global {
  interface Window {
    apiUrl: string;
  }
}

// const path = '/users';
// const apiEndpoint = window.apiUrl + path;

export async function register(accountInfo: FixMeLater): Promise<FixMeLater> {
  // TODO: remove dummy account once backend is updated
  localStorage.setItem('jwtTokenCybermail', `${accountInfo}`);
  return 1;

  // try {
  //   const response = await http.post(apiEndpoint + '/register', accountInfo);
  //   if (response.data) return response.data;
  // } catch (err) {
  //   // return err.err;  TODO determine how this should work
  //   throw new Error('Registration failed');
  // }
}

export async function login(accountInfo: FixMeLater): Promise<unknown> {
  // TODO: remove dummy account once backend is updated
  localStorage.setItem('jwtTokenCybermail', `${accountInfo}`);
  return 1;

  // try {
  //   const response = await http.post(apiEndpoint + '/login', accountInfo);
  //   if (response.data) {
  //     const { token } = response.data;
  //     localStorage.setItem('jwtTokenCybermail', token);
  //     return jwt_decode(token);
  //   }
  // } catch (err) {
  //   // return response.err;  TODO determine how this should work
  //   throw new Error('Login failed');
  // }
}
