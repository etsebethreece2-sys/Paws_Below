(function () {
  "use strict";

  window.PawsBelow = window.PawsBelow || {};

  var CONFIG = window.PawsBelow.CONFIG;
  var MathUtil = window.PawsBelow.MathUtil;

  function Camera() {
    this.x = 0;
    this.y = 0;
    this.ready = false;
  }

  Camera.prototype.update = function (cat, viewportWidth, viewportHeight, world, dt) {
    var tile = CONFIG.tileSize;
    var catX = typeof cat.getVisualX === "function" ? cat.getVisualX() : cat.x;
    var catY = typeof cat.getVisualY === "function" ? cat.getVisualY() : cat.y;
    var targetX = catX * tile + tile / 2 - viewportWidth / 2;
    var targetY = catY * tile + tile / 2 - viewportHeight * 0.42 + tile * (CONFIG.cameraVerticalOffsetTiles || 0);
    var maxX = world.width * tile - viewportWidth;
    var followSpeed = CONFIG.cameraFollowSpeed || 8;
    var follow = Math.min(1, dt * followSpeed);

    targetX = MathUtil.clamp(targetX, 0, Math.max(0, maxX));
    targetY = Math.max(0, targetY);

    if (!this.ready) {
      this.x = targetX;
      this.y = targetY;
      this.ready = true;
      return;
    }

    this.x = MathUtil.lerp(this.x, targetX, follow);
    this.y = MathUtil.lerp(this.y, targetY, follow);
  };

  window.PawsBelow.Camera = Camera;
})();
