// send form data with AJAX and store the incoming access token before redirecting user to index page
$('form').submit(function (event) {
  event.preventDefault();
  $.ajax({
    type: 'POST',
    url: '/login',
    data: JSON.stringify({email: $('#email').val(), password: $('#password').val()}),
    contentType: 'application/json',
    dataType: 'json',
    success: function (data) {
      var storage = $("#rememberme").is(':checked') ? window.localStorage : window.sessionStorage;
      storage.token = data.token;
      storage.user = JSON.stringify(data.user);
      window.location.replace('/');
    },
    error: function (res) {
      $('form p.help-block').text(res.responseText);
    }
  });
});
