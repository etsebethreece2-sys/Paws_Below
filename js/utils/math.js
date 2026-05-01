(function () {
  "use strict";

  window.PawsBelow = window.PawsBelow || {};

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(start, end, amount) {
    return start + (end - start) * amount;
  }

  function sign(value) {
    if (value < 0) {
      return -1;
    }

    if (value > 0) {
      return 1;
    }

    return 0;
  }

  window.PawsBelow.MathUtil = {
    clamp: clamp,
    lerp: lerp,
    sign: sign
  };
})();
