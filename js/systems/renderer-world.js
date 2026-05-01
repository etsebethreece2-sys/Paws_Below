(function () {
  "use strict";

  window.PawsBelow = window.PawsBelow || {};

  var Renderer = window.PawsBelow.Renderer;
  var CONFIG = window.PawsBelow.CONFIG;
  var Random = window.PawsBelow.Random;

  if (!Renderer) {
    return;
  }

  Renderer.prototype.drawTiles = function (world, camera) {
    var tile = CONFIG.tileSize;
    var chunkSize = world.chunkSize || CONFIG.tileChunkSize || 8;
    var startX = Math.floor(camera.x / tile) - 1;
    var endX = Math.ceil((camera.x + this.viewWidth) / tile) + 1;
    var startY = Math.floor(camera.y / tile) - 1;
    var endY = Math.ceil((camera.y + this.viewHeight) / tile) + 1;
    var startChunkX = Math.floor(startX / chunkSize);
    var endChunkX = Math.floor(endX / chunkSize);
    var startChunkY = Math.floor(startY / chunkSize);
    var endChunkY = Math.floor(endY / chunkSize);
    var chunkX;
    var chunkY;

    for (chunkY = startChunkY; chunkY <= endChunkY; chunkY += 1) {
      for (chunkX = startChunkX; chunkX <= endChunkX; chunkX += 1) {
        this.drawStaticTerrainChunk(world, chunkX, chunkY);
      }
    }
  };

  Renderer.prototype.drawStaticTerrainChunk = function (world, chunkX, chunkY) {
    var tile = CONFIG.tileSize;
    var chunkSize = world.chunkSize || CONFIG.tileChunkSize || 8;
    var canvas = this.getStaticTerrainChunkCanvas(world, chunkX, chunkY);

    if (!canvas) {
      return;
    }

    this.ctx.drawImage(canvas, chunkX * chunkSize * tile, chunkY * chunkSize * tile);
  };

  Renderer.prototype.getStaticTerrainChunkCanvas = function (world, chunkX, chunkY) {
    var chunk = world.getChunk ? world.getChunk(chunkX, chunkY) : null;
    var key;
    var cached;

    if (!chunk) {
      return null;
    }

    key = (world.cacheKey || world.seed) + ":static:" + CONFIG.tileSize + ":" + chunkX + ":" + chunkY;
    cached = this.staticTerrainChunkCache[key];

    if (cached && cached.version === chunk.version && cached.chunkSize === (world.chunkSize || CONFIG.tileChunkSize || 8)) {
      return cached.canvas;
    }

    if (!cached) {
      cached = {
        canvas: document.createElement("canvas"),
        version: -1,
        chunkSize: world.chunkSize || CONFIG.tileChunkSize || 8
      };
      this.staticTerrainChunkCache[key] = cached;
      this.staticTerrainChunkCacheKeys.push(key);
    }

    this.renderStaticTerrainChunkCanvas(cached.canvas, world, chunk);
    cached.version = chunk.version;
    cached.chunkSize = world.chunkSize || CONFIG.tileChunkSize || 8;

    while (this.staticTerrainChunkCacheKeys.length > this.staticTerrainChunkCacheLimit) {
      delete this.staticTerrainChunkCache[this.staticTerrainChunkCacheKeys.shift()];
    }

    return cached.canvas;
  };

  Renderer.prototype.renderStaticTerrainChunkCanvas = function (canvas, world, chunk) {
    var tile = CONFIG.tileSize;
    var chunkSize = world.chunkSize || CONFIG.tileChunkSize || 8;
    var pixelSize = tile * chunkSize;
    var previousCtx = this.ctx;
    var ctx;
    var localX;
    var localY;
    var worldX;
    var worldY;
    var tileData;
    var px;
    var py;

    if (canvas.width !== pixelSize || canvas.height !== pixelSize) {
      canvas.width = pixelSize;
      canvas.height = pixelSize;
    }

    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, pixelSize, pixelSize);
    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;

    for (localY = 0; localY < chunkSize; localY += 1) {
      for (localX = 0; localX < chunkSize; localX += 1) {
        worldX = chunk.x * chunkSize + localX;
        worldY = chunk.y * chunkSize + localY;
        tileData = chunk.tiles[localY * chunkSize + localX];
        px = localX * tile;
        py = localY * tile;
        this.drawStaticTileBase(tileData, world, worldX, worldY, px, py);
      }
    }

    this.ctx = previousCtx;
  };

  Renderer.prototype.drawStaticTileBase = function (tileData, world, x, y, px, py) {
    var size = CONFIG.tileSize;

    if (!tileData || tileData.type === "air") {
      if (y >= world.surfaceY && x >= 0 && x < world.width) {
        this.drawTunnel(px, py, size, x, y);
      }

      return;
    }

    if (tileData.type === "pebblite") {
      this.drawPebbliteTexture(px, py, size, x, y, 0, false);
    } else if (tileData.type === "coalclump") {
      this.drawCoalclumpTexture(px, py, size, x, y, 0, false);
    } else if (tileData.type === "copperpaw") {
      this.drawCopperpawTexture(px, py, size, x, y, 0, false);
    } else {
      this.drawDirtTexture(px, py, size, x, y, 0, false);
    }
  };

  Renderer.prototype.drawActiveCracks = function (world, camera) {
    var cracks = world.getActiveCracks ? world.getActiveCracks() : [];
    var tile = CONFIG.tileSize;
    var minX = camera.x - tile;
    var minY = camera.y - tile;
    var maxX = camera.x + this.viewWidth + tile;
    var maxY = camera.y + this.viewHeight + tile;
    var now = typeof performance !== "undefined" ? performance.now() : Date.now();
    var i;
    var crack;
    var px;
    var py;
    var shake;

    if (!cracks.length) {
      return;
    }

    if (world.pruneActiveCracks) {
      world.pruneActiveCracks(now, 2200);
      cracks = world.getActiveCracks ? world.getActiveCracks() : cracks;
    }

    for (i = 0; i < cracks.length; i += 1) {
      crack = cracks[i];
      px = crack.x * tile;
      py = crack.y * tile;

      if (px + tile < minX || px > maxX || py + tile < minY || py > maxY) {
        continue;
      }

      shake = this.getTileShake(crack, crack.x, crack.y);
      this.ctx.save();
      this.ctx.translate(shake.x, shake.y);
      this.drawCracks(crack, px, py, tile, crack.x, crack.y);
      this.ctx.restore();
    }
  };

  Renderer.prototype.drawUndergroundBugs = function (state, camera) {
    var sprites = this.bugSprites || [];
    var boundsList = this.bugSpriteBounds || [];
    var world = state.world;
    var tile = CONFIG.tileSize;
    var count = CONFIG.undergroundBugCount || 0;
    var minDepth = CONFIG.undergroundBugMinDepth || 3;
    var spanX = Math.max(1, world.width - 2);
    var i;
    var spriteIndex;
    var sprite;
    var bounds;
    var seed;
    var baseX;
    var baseY;
    var crawlRange;
    var speed;
    var phase;
    var phaseY;
    var velocityX;
    var velocityY;
    var angle;
    var x;
    var y;
    var height;
    var width;

    if (!sprites.length || count <= 0) {
      return;
    }

    for (i = 0; i < count; i += 1) {
      spriteIndex = i % sprites.length;
      sprite = sprites[spriteIndex];
      bounds = boundsList[spriteIndex];

      if (!sprite || !bounds) {
        continue;
      }

      seed = CONFIG.seed + 8800 + i * 79;
      baseX = tile * (1 + Random.value2D(i, 17, seed) * spanX);
      baseY = tile * (world.surfaceY + minDepth + 1 + i * 4 + Random.value2D(i, 19, seed) * 3);
      crawlRange = tile * (0.42 + Random.value2D(i, 23, seed) * 0.72);
      speed = 0.35 + Random.value2D(i, 29, seed) * 0.42;
      phase = state.time * speed + Random.value2D(i, 31, seed) * Math.PI * 2;
      phaseY = state.time * (speed * 0.73 + 0.18) + Random.value2D(i, 37, seed) * Math.PI * 2;
      velocityX = Math.cos(phase) * crawlRange * speed + Math.cos(phase * 0.43 + i) * tile * 0.08;
      velocityY = Math.cos(phaseY) * tile * 0.26 * (speed * 0.73 + 0.18) + Math.cos(state.time * 2.1 + i) * 1.68;
      angle = Math.atan2(velocityY, velocityX || 0.001) + Math.PI / 2;
      height = CONFIG.undergroundBugHeight || 10;
      width = height * (bounds.width / bounds.height);
      x = baseX + Math.sin(phase) * crawlRange + Math.sin(phase * 0.47 + i) * tile * 0.18 - width / 2;
      y = baseY + Math.sin(phaseY) * tile * 0.26 + Math.sin(state.time * 2.1 + i) * 0.8;

      if (!this.isWorldRectVisible(x, y, width, height, camera.x - tile, camera.y - tile, camera.x + this.viewWidth + tile, camera.y + this.viewHeight + tile)) {
        continue;
      }

      this.ctx.save();
      this.ctx.translate(x + width / 2, y + height / 2);
      this.ctx.rotate(angle);
      this.drawCroppedSprite(sprite, bounds, -width / 2, -height / 2, width, height);
      this.ctx.restore();
    }
  };

  Renderer.prototype.drawBreakAnimations = function (world, effects) {
    var blocks = effects && effects.brokenBlocks;
    var ctx = this.ctx;
    var size = CONFIG.tileSize;
    var i;
    var block;
    var progress;
    var scale;
    var alpha;
    var frame;
    var jitterAmount;
    var jitterX;
    var jitterY;

    if (!blocks || blocks.length === 0) {
      return;
    }

    for (i = 0; i < blocks.length; i += 1) {
      block = blocks[i];
      progress = Math.max(0, Math.min(1, block.age / block.life));
      scale = Math.pow(1 - progress, 2.1);
      alpha = 1 - progress * 0.72;
      frame = Math.floor(block.age * 90);
      jitterAmount = Math.max(0, 1 - progress * 3);
      jitterX = (Random.hashInt(block.x + frame, block.y, CONFIG.seed + 971) % 5 - 2) * jitterAmount;
      jitterY = (Random.hashInt(block.x, block.y + frame, CONFIG.seed + 972) % 5 - 2) * jitterAmount;

      if (scale <= 0.01) {
        continue;
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(
        block.x * size + size / 2 + jitterX,
        block.y * size + size / 2 + jitterY
      );
      ctx.scale(scale, scale);
      if (block.type === "pebblite") {
        this.drawPebbliteTexture(-size / 2, -size / 2, size, block.x, block.y, 0, false);
      } else if (block.type === "coalclump") {
        this.drawCoalclumpTexture(-size / 2, -size / 2, size, block.x, block.y, 0, false);
      } else if (block.type === "copperpaw") {
        this.drawCopperpawTexture(-size / 2, -size / 2, size, block.x, block.y, 0, false);
      } else {
        this.drawDirtTexture(-size / 2, -size / 2, size, block.x, block.y, 0, false);
      }

      ctx.restore();
    }
  };

  Renderer.prototype.drawMiningStrokePreview = function (state) {
    var preview = state && state.getMiningStrokePreview ? state.getMiningStrokePreview() : null;
    var ctx = this.ctx;
    var lineWidth = Math.max(0.45, 1 / (CONFIG.cameraZoom || 1));
    var flash;

    if (!preview) {
      return;
    }

    flash = Math.min(1, (preview.flash || 0) / 0.16);

    ctx.save();
    ctx.globalAlpha = 0.18 + flash * 0.16;
    ctx.fillStyle = "#f4ca61";
    ctx.beginPath();
    ctx.moveTo(preview.originX, preview.originY);
    ctx.arc(
      preview.originX,
      preview.originY,
      preview.radius,
      preview.angle - preview.coneHalf,
      preview.angle + preview.coneHalf
    );
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 0.42 + flash * 0.22;
    ctx.strokeStyle = "#fff1a8";
    ctx.lineWidth = lineWidth * 1.6;
    ctx.beginPath();
    ctx.moveTo(preview.originX, preview.originY);
    ctx.arc(
      preview.originX,
      preview.originY,
      preview.radius,
      preview.angle - preview.coneHalf,
      preview.angle + preview.coneHalf
    );
    ctx.closePath();
    ctx.stroke();

    ctx.globalAlpha = 0.36 + flash * 0.14;
    ctx.strokeStyle = "#4b2f18";
    ctx.lineWidth = lineWidth;
    ctx.setLineDash([2.5, 2.5]);
    ctx.beginPath();
    ctx.arc(preview.originX, preview.originY, preview.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  Renderer.prototype.getTileShake = function (hitState, x, y) {
    var duration = CONFIG.tileHitShakeMs;
    var now;
    var elapsed;
    var amount;
    var frame;

    if (!hitState.hitAt || duration <= 0) {
      return {
        x: 0,
        y: 0
      };
    }

    now = typeof performance !== "undefined" ? performance.now() : Date.now();
    elapsed = now - hitState.hitAt;

    if (elapsed >= duration) {
      return {
        x: 0,
        y: 0
      };
    }

    amount = 1 - elapsed / duration;
    frame = Math.floor(elapsed / 18);

    return {
      x: (Random.hashInt(x + frame, y, CONFIG.seed + 941) % 5 - 2) * amount,
      y: (Random.hashInt(x, y + frame, CONFIG.seed + 942) % 5 - 2) * amount
    };
  };

  Renderer.prototype.drawTunnel = function (px, py, size, x, y) {
    var i;
    var sx;
    var sy;
    var speckWidth = Math.max(1, Math.round(size * 0.125));
    var speckHeight = Math.max(1, Math.round(size * 0.0625));
    var speckRange = Math.max(1, Math.floor(size * 0.66));

    this.drawDirtTexture(px, py, size, x, y, 0.62, true);
    this.ctx.fillStyle = "rgba(173, 118, 74, 0.16)";

    for (i = 0; i < 3; i += 1) {
      sx = px + Math.round(size * 0.13) + (Random.hashInt(x + i, y, CONFIG.seed + 61) % speckRange);
      sy = py + Math.round(size * 0.16) + (Random.hashInt(x, y + i, CONFIG.seed + 62) % speckRange);
      this.ctx.fillRect(sx, sy, speckWidth, speckHeight);
    }
  };

  Renderer.prototype.drawDirtTexture = function (px, py, size, x, y, darkness, exactSize) {
    var ctx = this.ctx;
    var roll = Random.hashInt(x, y, CONFIG.seed + 177);
    var imageSize = Math.min(this.dirtSprite.naturalWidth || this.dirtSprite.width, this.dirtSprite.naturalHeight || this.dirtSprite.height);
    var sourceSize = Math.floor(imageSize * 0.34);
    var maxSource = imageSize - sourceSize;
    var sourceX = roll % maxSource;
    var sourceY = (roll >>> 9) % maxSource;
    var rotation = roll % 4;
    var half = size / 2;
    var drawSize = exactSize ? size : size + 1;
    var tone = Random.value2D(x, y, CONFIG.seed + 411) - 0.5;
    var shade = Math.abs(tone) * (exactSize ? 0.1 : 0.14);

    ctx.fillStyle = CONFIG.colors.dirt;
    ctx.fillRect(px, py, size, size);

    ctx.save();
    if (exactSize) {
      ctx.beginPath();
      ctx.rect(px, py, size, size);
      ctx.clip();
    }

    ctx.translate(px + half, py + half);
    ctx.rotate(rotation * Math.PI / 2);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      this.dirtSprite,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      -drawSize / 2,
      -drawSize / 2,
      drawSize,
      drawSize
    );
    ctx.restore();

    if (tone > 0) {
      ctx.fillStyle = "rgba(255,221,166," + shade + ")";
      ctx.fillRect(px, py, size, size);
    } else {
      ctx.fillStyle = "rgba(42,24,13," + shade + ")";
      ctx.fillRect(px, py, size, size);
    }

    if (darkness > 0) {
      ctx.fillStyle = "rgba(0,0,0," + darkness + ")";
      ctx.fillRect(px, py, size, size);
    }
  };

  Renderer.prototype.drawPebbliteTexture = function (px, py, size, x, y, darkness, exactSize) {
    this.drawOreTexture(this.pebbliteSprite, "#6f7781", px, py, size, x, y, darkness, exactSize, CONFIG.seed + 2117);
  };

  Renderer.prototype.drawCoalclumpTexture = function (px, py, size, x, y, darkness, exactSize) {
    this.drawOreTexture(this.coalclumpSprite, "#25272a", px, py, size, x, y, darkness, exactSize, CONFIG.seed + 2411);
  };

  Renderer.prototype.drawCopperpawTexture = function (px, py, size, x, y, darkness, exactSize) {
    this.drawOreTexture(this.copperpawSprite, "#7b472d", px, py, size, x, y, darkness, exactSize, CONFIG.seed + 2633);
  };

  Renderer.prototype.drawOreTexture = function (image, baseColor, px, py, size, x, y, darkness, exactSize, seed) {
    var ctx = this.ctx;
    var roll = Random.hashInt(x, y, seed);
    var imageSize = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height);
    var sourceSize = Math.max(1, Math.floor(imageSize * 0.8));
    var maxSource = Math.max(1, imageSize - sourceSize);
    var sourceX = roll % maxSource;
    var sourceY = (roll >>> 9) % maxSource;
    var rotation = roll % 4;
    var half = size / 2;
    var drawSize = exactSize ? size : size + 1;

    ctx.fillStyle = baseColor;
    ctx.fillRect(px, py, size, size);

    ctx.save();
    if (exactSize) {
      ctx.beginPath();
      ctx.rect(px, py, size, size);
      ctx.clip();
    }

    ctx.translate(px + half, py + half);
    ctx.rotate(rotation * Math.PI / 2);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      -drawSize / 2,
      -drawSize / 2,
      drawSize,
      drawSize
    );
    ctx.restore();

    if (darkness > 0) {
      ctx.fillStyle = "rgba(0,0,0," + darkness + ")";
      ctx.fillRect(px, py, size, size);
    }
  };

  Renderer.prototype.drawGrassForeground = function (world, camera) {
    var sprite = this.grassForegroundSprite;
    var tile = CONFIG.tileSize;
    var drawHeight = CONFIG.grassForegroundHeight;
    var drawY = world.surfaceY * tile - drawHeight + CONFIG.grassForegroundSink;
    var startX = Math.floor(camera.x / tile) - 1;
    var endX = Math.ceil((camera.x + this.viewWidth) / tile) + 1;
    var sourceHeight;
    var sourceWidth;
    var sliceWidth;
    var maxSourceX;
    var sourceX;
    var x;
    var surfaceTile;

    if (drawY > camera.y + this.viewHeight || drawY + drawHeight < camera.y) {
      return;
    }

    this.ctx.save();
    this.ctx.globalAlpha = CONFIG.grassForegroundOpacity;

    for (x = startX; x <= endX; x += 1) {
      surfaceTile = world.getTile(x, world.surfaceY);

      if (surfaceTile.type === "air") {
        continue;
      }

      if (!sprite) {
        this.drawGrassTop(x * tile, world.surfaceY * tile, tile, x, world.surfaceY);
        continue;
      }

      sourceHeight = sprite.height;
      sourceWidth = sprite.width;
      sliceWidth = Math.max(1, Math.floor(tile * sourceHeight / drawHeight));
      maxSourceX = Math.max(1, sourceWidth - sliceWidth);
      sourceX = Math.floor(Math.abs(x * 97) % maxSourceX);

      this.ctx.drawImage(
        sprite,
        sourceX,
        0,
        sliceWidth,
        sourceHeight,
        x * tile,
        drawY,
        tile + 1,
        drawHeight
      );
    }

    this.ctx.restore();
  };

  Renderer.prototype.drawGrassTop = function (px, py, size, x, y) {
    var ctx = this.ctx;
    var i;
    var bladeHeight;
    var roll;
    var capHeight = Math.max(4, Math.round(size * 0.28));
    var bladeCount = Math.max(4, Math.round(size / 4));
    var bladeStep = size / bladeCount;
    var bladeWidth = Math.max(1, Math.round(bladeStep * 0.72));
    var bladeX;

    ctx.fillStyle = "#2f6f3c";
    ctx.fillRect(px, py, size, capHeight);
    ctx.fillStyle = "#1f5030";
    ctx.fillRect(px, py + Math.max(1, capHeight - 2), size, Math.max(1, Math.round(size * 0.09)));

    for (i = 0; i < bladeCount; i += 1) {
      roll = Random.hashInt(x + i, y, CONFIG.seed + 12);
      bladeHeight = Math.max(2, Math.round(size * 0.13)) + (roll % Math.max(2, Math.round(size * 0.17)));
      bladeX = px + Math.round(i * bladeStep);
      ctx.fillStyle = i % 2 === 0 ? CONFIG.colors.grassLight : "#5ead51";
      ctx.fillRect(bladeX, py, bladeWidth, bladeHeight);
      ctx.fillStyle = "#245b34";
      ctx.fillRect(bladeX + Math.max(1, bladeWidth - 1), py + Math.max(1, bladeHeight - 3), 1, Math.max(2, Math.round(size * 0.16)));
    }

    ctx.fillStyle = "#94df67";
    ctx.fillRect(px + Math.round(size * 0.06), py + 1, Math.max(2, Math.round(size * 0.13)), 1);
    ctx.fillRect(px + Math.round(size * 0.56), py + 2, Math.max(2, Math.round(size * 0.16)), 1);
  };

  Renderer.prototype.drawCracks = function (crack, px, py, size, x, y) {
    var ctx = this.ctx;
    var damage = 1 - crack.hp / Math.max(1, crack.maxHp);
    var now = typeof performance !== "undefined" ? performance.now() : Date.now();
    var elapsed = now - (crack.hitAt || 0);
    var pulse = Math.max(0, 1 - elapsed / 180);
    var grow = Math.min(1, elapsed / Math.max(1, CONFIG.crackGrowMs || 130));
    var easedGrow = 1 - Math.pow(1 - grow, 3);
    var jitterScale = Math.max(0.35, size / 32);
    var jitterX = (Random.hashInt(x, y, CONFIG.seed + 901) % 3 - 1) * jitterScale;
    var jitterY = (Random.hashInt(y, x, CONFIG.seed + 902) % 3 - 1) * jitterScale;
    var segments = this.getCrackSegments(px, py, size, jitterX, jitterY);
    var visibleStep = Math.max(0.8, segments.length / Math.max(1, crack.maxHp));
    var currentVisible = Math.max(0.65, damage * segments.length);
    var previousVisible = Math.max(0, currentVisible - visibleStep);
    var visibleCount = previousVisible + (currentVisible - previousVisible) * easedGrow;
    var highlight = crack.type === "pebblite" ? "#bdd8e3" : "#9a714c";

    if (crack.type === "coalclump") {
      highlight = "#d8d8cf";
    }

    if (crack.type === "copperpaw") {
      highlight = "#ffd2a6";
    }

    ctx.save();
    ctx.lineCap = "square";
    ctx.lineJoin = "miter";
    ctx.globalAlpha = 0.74 + damage * 0.2 + pulse * 0.08;
    ctx.strokeStyle = "#060403";
    ctx.lineWidth = Math.max(1, size * 0.078);
    this.strokeCrackSegments(segments, visibleCount);
    ctx.globalAlpha = 0.1 + pulse * 0.06;
    ctx.strokeStyle = highlight;
    ctx.lineWidth = Math.max(0.55, size * 0.031);
    this.strokeCrackSegments(segments, visibleCount);
    ctx.restore();
  };

  Renderer.prototype.getCrackSegments = function (px, py, size, jitterX, jitterY) {
    var s = size / 32;
    var a = { x: px + 16 * s + jitterX, y: py + 7 * s };
    var b = { x: px + 14 * s + jitterX, y: py + 14 * s + jitterY };
    var c = { x: px + 20 * s + jitterX, y: py + 20 * s + jitterY };
    var d = { x: px + 7 * s, y: py + 18 * s + jitterY };
    var e = { x: px + 26 * s, y: py + 17 * s };

    return [
      [a.x, a.y, b.x, b.y],
      [b.x, b.y, c.x, c.y],
      [b.x, b.y, d.x, d.y],
      [c.x, c.y, e.x, e.y],
      [a.x, a.y, px + 9 * s, py + 6 * s],
      [c.x, c.y, px + 17 * s, py + 29 * s],
      [d.x, d.y, px + 5 * s, py + 27 * s],
      [e.x, e.y, px + 29 * s, py + 26 * s],
      [px + 11 * s, py + 23 * s, px + 25 * s, py + 8 * s]
    ];
  };

  Renderer.prototype.strokeCrackSegments = function (segments, visibleCount) {
    var ctx = this.ctx;
    var i;
    var amount;
    var segment;
    var endX;
    var endY;

    ctx.beginPath();

    for (i = 0; i < segments.length; i += 1) {
      amount = Math.max(0, Math.min(1, visibleCount - i));

      if (amount <= 0) {
        continue;
      }

      segment = segments[i];
      endX = segment[0] + (segment[2] - segment[0]) * amount;
      endY = segment[1] + (segment[3] - segment[1]) * amount;
      ctx.moveTo(segment[0], segment[1]);
      ctx.lineTo(endX, endY);
    }

    ctx.stroke();
  };
})();
