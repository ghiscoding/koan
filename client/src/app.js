import {inject} from 'aurelia-framework';
import {PostsData} from './data/postsData';

@inject(PostsData)
export class App {
  configureRouter(config, router) {
    config.title = 'Aurelia';
    config.map([
      { route: ['', 'home'], name: 'home', moduleId: './pages/home', nav: true, title:'Home', settings: { icon: 'glyphicon glyphicon-home'} },
      { route: 'profile', name: 'profile', moduleId: './pages/profile', nav: true, title:'Profile', settings: { icon: 'glyphicon glyphicon-user'} }
    ]);

    this.router = router;
  }
  constructor(postsData) {
    this.postsData = postsData;
  }
  clearDatabase() {
    this.postsData.clearDatabase();
    this.logout();
  }

  logout() {
    delete window.sessionStorage.token;
    delete window.sessionStorage.user;
    delete window.localStorage.token;
    delete window.localStorage.user;
    window.location.replace('/login.html');
  }
}
