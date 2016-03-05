import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {HttpClient, json} from 'aurelia-fetch-client';
import {SessionService} from '../services/sessionService';
import {WebsocketService} from '../services/websocketService';

@inject(EventAggregator, HttpClient, SessionService, WebsocketService)
export class PostsData {
  constructor(eventAggregator, http, sessionService, websocketService) {
    this.eventAggregator = eventAggregator;
    this.apiBase = 'api'; // base /api

    this.api = {};
    let headers = {Authorization: 'Bearer ' + sessionService.getCurrentToken()};
    headers['Accepts'] = 'application/json';
    headers['Content-Type'] = 'application/x-www-form-urlencoded';

    http.configure(x => {
        x.withDefaults({headers: headers, credentials: 'same-origin'});
        x.rejectErrorResponses();
    });

    this.headers = headers;
    this.http = http;

    // subscribe to websocket event listeners for backend api
    websocketService.connect();
    eventAggregator.subscribe('websocketOnMessage', data => {
      this.api.callback(data.type, data.content);
    });
  }

  getAll() {
    return this.http.fetch(this.apiBase + '/posts', {headers: this.headers});
  }

  clearDatabase() {
    return this.http.fetch(this.apiBase + '/debug/clearDatabase', {
        method: 'POST',
        headers: this.headers
      });
  }

  addComment(postId, comment) {
    return this.http.fetch(this.apiBase + '/posts/' + postId + '/comments', {
        method: 'POST',
        body: json(comment),
        headers: this.headers
      });
  }

  createPost(post) {
    return this.http.fetch(this.apiBase + '/posts', {
        method: 'POST',
        body: json(post),
        headers: this.headers
      });
  }

  subscribe(callback) {
    this.api.callback = callback;
  }
}
