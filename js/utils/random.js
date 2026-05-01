(function () {
  "use strict";

  window.PawsBelow = window.PawsBelow || {};

  function hashInt(x, y, seed) {
    var h = seed | 0;
    h ^= Math.imul(x | 0, 374761393);
    h = (h << 13) | (h >>> 19);
    h ^= Math.imul(y | 0, 668265263);
    h = Math.imul(h ^ (h >>> 15), 2246822519);
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    return (h ^ (h >>> 16)) >>> 0;
  }

  function value2D(x, y, seed) {
    return hashInt(x, y, seed) / 4294967295;
  }

  function smoothNoise(x, y, seed) {
    var ix = Math.floor(x);
    var iy = Math.floor(y);
    var fx = x - ix;
    var fy = y - iy;
    var a = value2D(ix, iy, seed);
    var b = value2D(ix + 1, iy, seed);
    var c = value2D(ix, iy + 1, seed);
    var d = value2D(ix + 1, iy + 1, seed);
    var sx = fx * fx * (3 - 2 * fx);
    var sy = fy * fy * (3 - 2 * fy);
    var top = a + (b - a) * sx;
    var bottom = c + (d - c) * sx;
    return top + (bottom - top) * sy;
  }

  function pickWeighted(entries, roll) {
    var total = 0;
    var index;

    for (index = 0; index < entries.length; index += 1) {
      total += entries[index].weight;
    }

    var target = roll * total;

    for (index = 0; index < entries.length; index += 1) {
      target -= entries[index].weight;

      if (target <= 0) {
        return entries[index].type;
      }
    }

    return entries[entries.length - 1].type;
  }

  window.PawsBelow.Random = {
    hashInt: hashInt,
    value2D: value2D,
    smoothNoise: smoothNoise,
    pickWeighted: pickWeighted
  };
})();
