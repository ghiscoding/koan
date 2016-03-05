import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {SessionService} from '../services/sessionService';

@inject(EventAggregator, SessionService)
export class WebsocketService {
  constructor(eventAggregator, sessionService) {
    this.eventAggregator = eventAggregator;
    this.interval = 0;

    this.apiBase = 'api'; // base /api
    this.token = sessionService.getCurrentToken();
    this.wsHost = (window.document.location.origin || (window.location.protocol + '//' + window.location.host)).replace(/^http/, 'ws');
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.wsHost + '?access_token=' + this.token, 'json');
    this.attachListeners();
    /*
    // keep-alive signal (needed for heroku)... but can't find a way to cancel it in Aurelia
    this.interval = window.setInterval(function () {
      self.ws.send('ping');
    }, 1000 * 25);
    */
  }

  close() {
    this.ws.close(1000);
  }

  attachListeners() {
    let self = this;

    this.ws.onopen = function () {
      console.info("Succeeded to open a connection");
      self.eventAggregator.publish('websocketConnected');
    };
    this.ws.onerror = function() {
      console.error("Failed to open a connection");
      self.eventAggregator.publish('websocketInError');
      window.clearInterval(self.interval); // this doesn't work with Aurelia
    }
    this.ws.onclose = function () {
      console.warn("Closed the connection");
      self.eventAggregator.publish('websocketDisconnected');
      window.clearInterval(self.interval); // this doesn't work with Aurelia
    };

    this.ws.onmessage = event => {
      let data = JSON.parse(event.data); // rpc event object (data)
      let dataType = data.method === "posts.created" ? "post" : "comment";

      this.eventAggregator.publish('websocketOnMessage', { type: dataType, content: data.params });
    };
  }
}
