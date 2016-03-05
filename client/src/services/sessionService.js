export class SessionService {
  constructor() {
    this.token = (window.sessionStorage.token || window.localStorage.token);
    this.user = JSON.parse(window.sessionStorage.user || window.localStorage.user);
  }

  getCurrentUser() {
    return this.user;
  }

  getCurrentToken() {
    return this.token;
  }
}
