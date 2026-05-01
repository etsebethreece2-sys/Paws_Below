(function () {
  "use strict";

  window.PawsBelow = window.PawsBelow || {};

  var Renderer = window.PawsBelow.Renderer;
  var CONFIG = window.PawsBelow.CONFIG;

  if (!Renderer) {
    return;
  }

  Renderer.prototype.drawCroppedSprite = function (image, bounds, x, y, width, height) {
    this.ctx.drawImage(
      image,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      Math.round(x),
      Math.round(y),
      Math.round(width),
      Math.round(height)
    );
  };

  Renderer.prototype.drawCroppedSpriteSmooth = function (image, bounds, x, y, width, height) {
    this.ctx.drawImage(
      image,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      x,
      y,
      width,
      height
    );
  };

  Renderer.prototype.drawCroppedSpriteFlippedX = function (image, bounds, x, y, width, height, outline) {
    var ctx = this.ctx;
    var drawX = Math.round(x);
    var drawY = Math.round(y);
    var drawWidth = Math.round(width);
    var drawHeight = Math.round(height);

    ctx.save();
    ctx.translate(drawX + drawWidth, drawY);
    ctx.scale(-1, 1);

    if (outline) {
      this.drawFlippedSpriteOutline(image, bounds, drawWidth, drawHeight);
    }

    ctx.drawImage(
      image,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      0,
      0,
      drawWidth,
      drawHeight
    );
    ctx.restore();
  };

  Renderer.prototype.drawFlippedSpriteOutline = function (image, bounds, drawWidth, drawHeight) {
    var ctx = this.ctx;
    var offsets = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1]
    ];
    var previousFilter = ctx.filter;
    var i;

    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.filter = "brightness(0)";

    for (i = 0; i < offsets.length; i += 1) {
      ctx.drawImage(
        image,
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
        offsets[i][0],
        offsets[i][1],
        drawWidth,
        drawHeight
      );
    }

    ctx.filter = previousFilter || "none";
    ctx.restore();
  };

  Renderer.prototype.drawCat = function (cat, time) {
    var ctx = this.ctx;
    var size = CONFIG.tileSize;
    var visualSize = CONFIG.catVisualTileSize || size;
    var groundAnchor = size / 2;
    var bounce = Math.round(Math.sin(time * 12) * 1.1 * cat.bump);
    var cx = cat.getVisualX() * size + size / 2;
    var cy = cat.getVisualY() * size + size / 2 + bounce;
    var sprite = this.catSprite;
    var bounds = this.catSpriteBounds;
    var walking = cat.isWalking && cat.isWalking();
    var frameIndex;
    var frameScale;
    var groundBottom;
    var renderHeight = visualSize * 1.25;
    var renderWidth;

    if (!this.assetsReady || !bounds) {
      return;
    }

    if (walking && this.catRunFrames.length > 0) {
      frameIndex = Math.floor(time * CONFIG.catRunFramesPerSecond) % this.catRunFrames.length;
      sprite = this.catRunSprite;
      bounds = this.catRunFrames[frameIndex];
      renderHeight *= CONFIG.catRunScale;
    } else if (!walking && this.catIdleFrames.length > 0) {
      frameIndex = Math.floor(time * CONFIG.catIdleFramesPerSecond) % this.catIdleFrames.length;
      sprite = this.catIdleSprite;
      bounds = this.catIdleFrames[frameIndex];
      renderHeight *= CONFIG.catIdleScale;
    }

    if (bounds.cellWidth && bounds.cellHeight) {
      frameScale = renderHeight / bounds.baseHeight;
      groundBottom = walking ? bounds.baseBottom : bounds.offsetY + bounds.height;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(cat.facing, 1);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        sprite,
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
        -bounds.cellWidth * frameScale / 2 + bounds.offsetX * frameScale,
        groundAnchor + CONFIG.catGroundOffset + CONFIG.catSheetGroundOffset - groundBottom * frameScale + bounds.offsetY * frameScale,
        bounds.width * frameScale,
        bounds.height * frameScale
      );
      ctx.restore();
      return;
    }

    renderWidth = renderHeight * (bounds.width / bounds.height);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(cat.facing, 1);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      sprite,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      -renderWidth / 2,
      groundAnchor - renderHeight + CONFIG.catGroundOffset,
      renderWidth,
      renderHeight
    );
    ctx.restore();
  };
})();
