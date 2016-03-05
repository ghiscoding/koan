// if user logs in with oauth, user token will be in query string so look for it. otherwise, check browser storage for token
var tokenParamMatch = RegExp('[?&]user=([^&]*)').exec(window.location.search),
    tokenParam = tokenParamMatch && decodeURIComponent(tokenParamMatch[1].replace(/\+/g, ' '));
if (tokenParam) {
  var data = JSON.parse(tokenParam);
  window.localStorage.token = data.token;
  window.localStorage.user = JSON.stringify(data.user);
} else {
  var token = window.sessionStorage.token || window.localStorage.token,
      user = token && JSON.parse(window.sessionStorage.user || window.localStorage.user);
  if (!user || user.exp < Math.round(new Date().getTime() / 1000)) window.location.replace('/login.html');
}
