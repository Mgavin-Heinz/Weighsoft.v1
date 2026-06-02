(function (window) {
  window.__env = window.__end || {};
  //window.__env.base = "http://" + window.location.hostname + "/weighsoft/backend/public";
  //window.__env.base = "http://api.weighsoft.co.za";
  window.__env.base = `http://${window.location.hostname}:5000`;
  window.__env.logo = "assets/images/logos/ZZesto.png";
})(this);
