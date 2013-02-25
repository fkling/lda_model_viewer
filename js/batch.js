(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame =
  window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
  window.requestAnimationFrame = function(callback, element) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = window.setTimeout(function() { callback(currTime + timeToCall); },
      timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };

  if (!window.cancelAnimationFrame) { 
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
}());

function batch(data, iterations, callback) {
  var deferred = new $.Deferred();
  var rAF = window.requestAnimationFrame.bind(window);

  if(typeof data === 'number') { 
    var total = data;
    var current_index = 0;
    (function loop() {
      var result;
      for (
        var i = current_index, l = current_index + iterations; 
        i < l && i < total;
        i++
      ) {
        result = callback(i, total);
        if (result === false) {
          break;
        }
      }
      current_index = i;

      if (result !== false && current_index < total) {
        rAF(loop);
      }
      else {
        deferred.resolve();
      }
    }());
  }

  else if (typeof data === 'string') {
    (function loop() {
      var result;
      for (var i = 0; i < iterations; i++) {
        result = callback(data, i);
        if (result === false) {
          break;
        }
      }

      if (result !== false) {
        rAF(loop);
      }
      else {
        deferred.resolve();
      }
    }());
  }
  else if(Array.isArray(data)) {
    var total_length = data.length;
    var current_index = 0;
    (function loop() {
      var result;
      for (
        var i = current_index, l = current_index + iterations; 
        i < l && i < total_length;
        i++
      ) {
        result = callback(i, data[i], i, total_length);

        if (result === false) {
          break;
        }
      }
      current_index = i;

      if (result !== false && current_index < total_length) {
        rAF(loop);
      }
      else {
        deferred.resolve();
      }
    }());
  }
  else if (typeof data === 'object') {
    var keys = Object.keys(data);
    var total_length = keys.length;
    var current_index = 0;
    (function loop() {
      var result;
      for (
        var i = current_index, l = current_index + iterations; 
        i < l && i < total_length;
        i++
      ) {
        result = callback(keys[i], data[keys[i]], i, total_length);

        if (result === false) {
          break;
        }
      }
      current_index = i;

      if (result !== false && current_index < total_length) {
        rAF(loop);
      }
      else {
        deferred.resolve();
      }
    }());
  }

  return deferred.promise();
}
