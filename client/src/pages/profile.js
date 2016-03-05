import {inject} from 'aurelia-framework';
import {SessionService} from '../services/sessionService';

@inject(SessionService)
export class Profile {
  constructor(sessionService) {
    this.user = sessionService.getCurrentUser();
  }
}
