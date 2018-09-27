(function(){

  var t = {
    config : {
      cookieName : 'm_cid',
      endpoint : 'https://nf2qhd0ps9.execute-api.eu-central-1.amazonaws.com/v1/collect',
      enableBeacon : true,
      sessionLengthMins : 30,
      cookieExpirationDays:  14,
      startSession : true,
      cookieDomain : null,
      appId : null
    },

    detect : function(){

      var splitter = '=';
      var regex = new RegExp('^[a-zA-Z0-9]+-[a-zA-Z0-9]+'+splitter+'\\d+$')

      var cid, newUser, newSession, _t;
      var now = (new Date()).getTime();
      cid = getCookie(t.config.cookieName);
      if(cid && cid.match(regex)) {
        _t = cid.split(splitter);
        cid = _t[0];
        newUser = false;
        newSession = now - parseInt(_t[1]) > t.config.sessionLengthMins * 60 * 1000
      }
      else {
        cid = now.toString(36) + '-' + Math.random().toString(36).substr(-3);
        newUser = true;
        newSession = true;
      }
      setCookie(t.config.cookieName, [cid, now ].join(splitter), t.config.cookieExpirationDays, t.config.cookieDomain);
      return {
        cid : cid,
        newSession : newSession,
        newUser : newUser
      };
    },
    track : function(data){
      var api = t.config.endpoint;
      data = data || {};
      data.clientId = t.detect().cid;

      if(!data.appId && t.config.appId) data.appId = t.config.appId;
      if(!data.r && document.referrer) data.r = document.referrer;

      if(typeof navigator.sendBeacon === 'function' && t.config.enableBeacon){
        navigator.sendBeacon(api, JSON.stringify(data));
      }
      else {
        var trackerUrl = api + '?data=' + encodeURIComponent(JSON.stringify(data))
        var img = new Image();
        img.src = trackerUrl;
      }
    },
    init : function(data){

      console.log('init', data);

      data = data || {};
      for(var key in data){
        if(typeof t.config[key] !== 'undefined') t.config[key] = data[key];
      }

      console.log('config', t.config);

      if(t.config.startSession && t.detect().newSession){
        t.track({event:'startSession'});
      }

      // no need for callback probably?
      // if(typeof data.ready === 'function') data.ready();

    }
  };

  var tracker = window[EventTracker] = function(action, data){
    if(typeof t[action] === 'function') t[action](data);
  }

  if(window.eventTrackerQueue.length){
    var q = eventTrackerQueue;
    for(var i = 0; i < q.length; i++){
      tracker(q[i][0], q[i][1]);
    }
  }

  function setCookie(name,value,days,domain) {
    var cookie_str = name + "=" + (value || "") + "; path=/";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        cookie_str += "; expires=" + date.toUTCString();
    }
    if(domain){
      cookie_str += "; domain=" + domain;
    }
    console.log(cookie_str);
    document.cookie = cookie_str;
    return value;
  }
  function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }
  function getQueryParam(param) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == param) {
        return decodeURIComponent(pair[1]);
      }
    }
    return null;
  }
})();
