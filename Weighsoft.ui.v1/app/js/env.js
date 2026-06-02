(function (window) {
  window.__env = window.__end || {};
  //window.__env.base = "http://" + window.location.hostname + "/weighsoft/backend/public";
  //window.__env.base = "https://api.weighsoft.co.za";
  window.__env.base = `https://${window.location.hostname}:5000`;
  window.__env.scale = `http://henzard-pi:3000`;
  window.__env.logo = "assets/images/logos/ZZesto.png";
})(this);
