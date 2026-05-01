(function () {
  "use strict";

  window.PawsBelow = window.PawsBelow || {};

  var Renderer = window.PawsBelow.Renderer;
  var CONFIG = window.PawsBelow.CONFIG;
  var Random = window.PawsBelow.Random;

  if (!Renderer) {
    return;
  }

  Renderer.prototype.drawBackground = function (world, camera, zoom, time) {
    var ctx = this.ctx;
    var tile = CONFIG.tileSize;
    var surface = (world.surfaceY * tile - camera.y) * zoom;
    var skyHeight = Math.max(0, Math.min(this.height, surface));
    var skyPanBucket = this.getSkyPanBucket(camera, zoom, skyHeight);
    var undergroundPanBucketX = Math.floor(camera.x * zoom * 0.025);
    var undergroundPanBucketY = Math.floor(camera.y * zoom * 0.025);
    var cacheKey = [
      this.width,
      this.height,
      Math.round(surface),
      Math.round(skyHeight),
      skyPanBucket,
      undergroundPanBucketX,
      undergroundPanBucketY,
      CONFIG.skyboxOpacity,
      world.skyTint || "",
      CONFIG.colors.tunnel,
      CONFIG.skyUnderlay
    ].join(":");

    if (!this.backgroundCacheCanvas) {
      this.backgroundCacheCanvas = document.createElement("canvas");
      this.backgroundCacheCtx = this.backgroundCacheCanvas.getContext("2d");
    }

    if (
      this.backgroundCacheCanvas.width !== this.width ||
      this.backgroundCacheCanvas.height !== this.height
    ) {
      this.backgroundCacheCanvas.width = this.width;
      this.backgroundCacheCanvas.height = this.height;
      this.backgroundCacheKey = "";
    }

    if (this.backgroundCacheKey !== cacheKey) {
      this.drawStaticBackgroundToCache(world, camera, zoom, surface, skyHeight);
      this.backgroundCacheKey = cacheKey;
    }

    ctx.drawImage(this.backgroundCacheCanvas, 0, 0);

    if (skyHeight > 0) {
      this.drawWindStreaks(camera, skyHeight, time);
    }
  };

  Renderer.prototype.getSkyPanBucket = function (camera, zoom, skyHeight) {
    var bounds = this.skyboxSpriteBounds;
    var imageRatio;
    var drawRatio;

    if (!bounds || skyHeight <= 0) {
      return 0;
    }

    imageRatio = bounds.width / bounds.height;
    drawRatio = this.width / Math.max(1, skyHeight);

    if (imageRatio <= drawRatio) {
      return 0;
    }

    return Math.floor(camera.x * zoom * 0.05);
  };

  Renderer.prototype.drawStaticBackgroundToCache = function (world, camera, zoom, surface, skyHeight) {
    var previousCtx = this.ctx;

    this.ctx = this.backgroundCacheCtx;
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (skyHeight > 0) {
      this.drawSkybox(camera, zoom, skyHeight);
      this.drawSkyTint(world, skyHeight);
    }

    this.ctx.fillStyle = CONFIG.colors.tunnel;
    this.ctx.fillRect(0, Math.max(0, surface), this.width, this.height);
    this.drawUndergroundBackgroundTexture(camera, zoom, surface);
    this.ctx = previousCtx;
  };

  Renderer.prototype.drawUndergroundBackgroundTexture = function (camera, zoom, surface) {
    var ctx = this.ctx;
    var startY = Math.max(0, surface);
    var count = Math.ceil(this.width * Math.max(0, this.height - startY) / 1800);
    var i;
    var seed;
    var x;
    var y;
    var radius;
    var shade;
    var alpha;
    var speckX;
    var speckY;

    if (startY >= this.height) {
      return;
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, startY, this.width, this.height - startY);
    ctx.clip();

    ctx.fillStyle = "rgba(255,255,255,0.025)";
    for (i = 0; i < count * 4; i += 1) {
      seed = Random.value2D(i + Math.floor(camera.x * 0.07), Math.floor(camera.y * 0.07), CONFIG.seed + 3021);
      speckX = Math.floor((seed * 997 + i * 47 - camera.x * zoom * 0.06) % (this.width + 40)) - 20;
      speckY = Math.floor(startY + ((seed * 1579 + i * 83 - camera.y * zoom * 0.04) % Math.max(1, this.height - startY + 40))) - 20;
      ctx.globalAlpha = 0.16 + seed * 0.12;
      ctx.fillRect(speckX, speckY, seed > 0.7 ? 2 : 1, 1);
    }

    for (i = 0; i < count; i += 1) {
      seed = Random.value2D(i, Math.floor(camera.y * 0.08), CONFIG.seed + 3049);
      x = Math.floor((seed * 1319 + i * 109 - camera.x * zoom * 0.035) % (this.width + 120)) - 60;
      y = Math.floor(startY + ((seed * 1931 + i * 71 - camera.y * zoom * 0.03) % Math.max(1, this.height - startY + 100))) - 50;
      radius = 18 + seed * 58;
      alpha = 0.045 + seed * 0.035;
      shade = seed > 0.46 ? "255,255,255" : "0,0,0";

      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(" + shade + "," + alpha + ")";
      ctx.beginPath();
      ctx.ellipse(x, y, radius * (1.35 + seed * 0.8), radius * 0.38, seed * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = CONFIG.colors.tunnelDark || "#0e1316";
    ctx.lineWidth = 1;
    for (i = 0; i < Math.max(6, count / 2); i += 1) {
      seed = Random.value2D(i, Math.floor(camera.x * 0.05), CONFIG.seed + 3067);
      x = Math.floor((seed * 1667 + i * 151 - camera.x * zoom * 0.025) % (this.width + 160)) - 80;
      y = Math.floor(startY + ((seed * 1231 + i * 97 - camera.y * zoom * 0.02) % Math.max(1, this.height - startY + 90))) - 45;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 42 + seed * 34, y - 12 + seed * 28, x + 110 + seed * 42, y + 10 - seed * 18);
      ctx.stroke();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  };

  Renderer.prototype.drawSkyTint = function (world, skyHeight) {
    if (!world || !world.skyTint || skyHeight <= 0) {
      return;
    }

    this.ctx.save();
    this.ctx.fillStyle = world.skyTint;
    this.ctx.fillRect(0, 0, this.width, skyHeight);
    this.ctx.restore();
  };

  Renderer.prototype.drawSkybox = function (camera, zoom, skyHeight) {
    var ctx = this.ctx;
    var image = this.skyboxSprite;
    var bounds = this.skyboxSpriteBounds;
    var imageRatio;
    var drawRatio;
    var sourceWidth;
    var sourceHeight;
    var sourceX;
    var sourceY;
    var panRange;

    if (!image || !bounds) {
      ctx.fillStyle = CONFIG.skyUnderlay;
      ctx.fillRect(0, 0, this.width, skyHeight);
      return;
    }

    ctx.fillStyle = CONFIG.skyUnderlay;
    ctx.fillRect(0, 0, this.width, skyHeight);

    imageRatio = bounds.width / bounds.height;
    drawRatio = this.width / Math.max(1, skyHeight);
    sourceWidth = bounds.width;
    sourceHeight = bounds.height;
    sourceX = 0;
    sourceY = 0;

    if (imageRatio > drawRatio) {
      sourceWidth = Math.max(1, Math.floor(bounds.height * drawRatio));
      panRange = bounds.width - sourceWidth;
      sourceX = Math.floor((camera.x * zoom * 0.05) % Math.max(1, panRange));
    } else {
      sourceHeight = Math.max(1, Math.floor(bounds.width / drawRatio));
      sourceY = Math.max(0, bounds.height - sourceHeight);
    }

    ctx.save();
    ctx.globalAlpha = CONFIG.skyboxOpacity;
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      this.width,
      skyHeight
    );
    ctx.restore();
  };

  Renderer.prototype.drawWindStreaks = function (camera, skyHeight, time) {
    var ctx = this.ctx;
    var count = CONFIG.windStreakCount || 6;
    var period = CONFIG.windStreakPeriodSeconds || 7.5;
    var maxAlpha = CONFIG.windStreakMaxAlpha || 0.16;
    var i;
    var seed;
    var progress;
    var activeProgress;
    var alpha;
    var length;
    var x;
    var y;
    var drift;

    if (skyHeight <= 24) {
      return;
    }

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineWidth = CONFIG.windStreakLineWidth || 1;

    for (i = 0; i < count; i += 1) {
      seed = Random.value2D(i, 19, CONFIG.seed + 811);
      progress = ((time + seed * period + i * 1.37) % period) / period;

      if (progress < 0.08 || progress > 0.58) {
        continue;
      }

      activeProgress = (progress - 0.08) / 0.5;
      alpha = Math.sin(activeProgress * Math.PI) * maxAlpha;
      length = 48 + seed * 78;
      drift = (camera.x * 0.04 + time * 52) % (this.width + length * 2);
      x = this.width + length - drift - activeProgress * this.width * 0.35;
      y = 18 + Random.value2D(i, 23, CONFIG.seed + 812) * Math.max(12, skyHeight * 0.56);

      if (y > skyHeight - 6) {
        y = skyHeight - 6;
      }

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "#e9fbff";
      ctx.beginPath();
      ctx.moveTo(Math.round(x), Math.round(y));
      ctx.lineTo(Math.round(x - length), Math.round(y + 3));
      ctx.stroke();
    }

    ctx.restore();
  };

  Renderer.prototype.drawClouds = function (world, camera, zoom, skyHeight) {
    var ctx = this.ctx;
    var sprites = this.cloudSprites;
    var i;
    var cloud;
    var bounds;
    var drawHeight;
    var drawWidth;
    var spacingWidth;
    var offset;
    var startX;
    var panelIndex;
    var x;
    var y;

    if (!sprites.length || skyHeight <= 0) {
      return;
    }

    drawHeight = Math.min(this.height * 0.82, 380);
    bounds = this.cloudSpriteBounds[0];

    if (!bounds) {
      return;
    }

    drawWidth = drawHeight * (bounds.width / bounds.height);
    spacingWidth = drawWidth;
    offset = (camera.x * zoom * 0.06) % spacingWidth;
    startX = -offset - spacingWidth;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, this.width, skyHeight);
    ctx.clip();

    ctx.globalAlpha = 0.96;

    for (i = 0; startX + i * spacingWidth < this.width + spacingWidth; i += 1) {
      panelIndex = i % sprites.length;
      cloud = sprites[panelIndex];
      bounds = this.cloudSpriteBounds[panelIndex];

      if (!cloud || !bounds) {
        continue;
      }

      x = Math.floor(startX + i * spacingWidth);
      y = (CONFIG.cloudSpriteYOffset && CONFIG.cloudSpriteYOffset[panelIndex]) || 0;
      drawWidth = drawHeight * (bounds.width / bounds.height);

      ctx.drawImage(
        cloud,
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
        x,
        Math.round(y),
        Math.ceil(drawWidth) + 1,
        Math.ceil(drawHeight)
      );
    }

    ctx.restore();
  };
})();
