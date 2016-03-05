import $ from "bootstrap";
import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {SessionService} from '../services/sessionService';

@inject(EventAggregator, SessionService)
export class NavBar {
  constructor(eventAggregator, sessionService) {
    this.searchQuery = '';
    this.onlineIndicatorStyle = {'background-color': 'green'};
    this.user = sessionService.getCurrentUser();

    // declare websocket event listeners for backend api
    eventAggregator.subscribe('websocketConnected', () => {
      this.onlineIndicatorStyle = {'background-color': 'green'};
    });
    eventAggregator.subscribe('websocketDisconnected', () => {
      this.onlineIndicatorStyle = {'background-color': 'lightgrey'};
    });
  }

  logout() {
    delete window.sessionStorage.token;
    delete window.sessionStorage.user;
    delete window.localStorage.token;
    delete window.localStorage.user;
    window.location.replace('/login.html');
  }

  search() {
    alert(`Not implemented... Should search for: ${this.searchQuery}`);
  }
}
