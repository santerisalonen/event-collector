(function (n, loc) {
  window.EventTracker = n;
  window.eventTrackerQueue = [];
  window[n] = window[n] || function () { window.eventTrackerQueue.push(arguments) }
  var s = document.createElement('script');
  var m = document.getElementsByTagName('script')[0];
  s.async = 1;
  s.src = loc;
  m.parentNode.insertBefore(s, m);
})('mytracker', 'https://s3.amazonaws.com/mehi-collect-api/mt.min.js');

mytracker('init', {
   endpoint : 'https://a8qk2a5vo7.execute-api.eu-west-1.amazonaws.com/v1/collect',
   cookieName : "m_cid",
   enableBeacon : true
});
mytracker('track', { event:'testevent', myvar: 1, test: true});
