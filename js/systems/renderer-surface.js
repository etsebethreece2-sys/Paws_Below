(function () {
  "use strict";

  window.PawsBelow = window.PawsBelow || {};

  var Renderer = window.PawsBelow.Renderer;
  var CONFIG = window.PawsBelow.CONFIG;
  var Random = window.PawsBelow.Random;

  if (!Renderer) {
    return;
  }

  Renderer.prototype.drawInventoryFullWarning = function (state) {
    var ctx = this.ctx;
    var timer = state.inventoryFullWarningTimer || 0;
    var duration = CONFIG.inventoryFullWarningSeconds || 0.95;
    var progress;
    var alpha;
    var cat = state.cat;
    var tile = CONFIG.tileSize;
    var text = "Inventory full";
    var x;
    var y;
    var width;
    var height = 15;

    if (timer <= 0 || !cat) {
      return;
    }

    progress = 1 - Math.min(1, timer / duration);
    alpha = Math.min(1, timer * 5) * (1 - Math.max(0, progress - 0.58) / 0.42);
    x = Math.round(cat.getVisualX() * tile + tile / 2);
    y = Math.round(cat.getVisualY() * tile - 18 - progress * 7);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "bold 7px 'Lucida Console', 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    width = Math.ceil(ctx.measureText(text).width) + 12;
    ctx.fillStyle = "rgba(70, 37, 19, 0.86)";
    ctx.fillRect(Math.round(x - width / 2), y - 8, width, height);
    ctx.strokeStyle = "#ffcf6c";
    ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(x - width / 2) + 0.5, y - 7.5, width - 1, height - 1);
    ctx.fillStyle = "#fff0ba";
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  Renderer.prototype.drawSurfaceProps = function (state, camera) {
    var world = state.world;
    var tile = CONFIG.tileSize;
    var visualTile = this.getSurfaceVisualTileSize();
    var groundY = this.getSurfacePropGroundY(world);
    var cabinBounds = this.cabinSpriteBounds;
    var scratchingPostBounds = this.scratchingPostSpriteBounds;
    var blacksmithBounds = this.blacksmithSpriteBounds;
    var cabinHeight = visualTile * 4.35;
    var cabinWidth;
    var cabinX = visualTile * 0.15;
    var cabinY;
    var postPlacement;
    var blacksmithPlacement;
    var viewLeft = camera.x - tile;
    var viewTop = camera.y - tile;
    var viewRight = viewLeft + this.viewWidth + tile * 2;
    var viewBottom = viewTop + this.viewHeight + tile * 2;

    if ((state.shouldDrawSurfaceProps && !state.shouldDrawSurfaceProps()) || !this.assetsReady) {
      return;
    }

    if ((!state.shouldDrawCabin || state.shouldDrawCabin()) && cabinBounds) {
      cabinWidth = cabinHeight * (cabinBounds.width / cabinBounds.height);
      cabinY = groundY - cabinHeight + CONFIG.cabinGroundSink;

      if (this.isWorldRectVisible(cabinX, cabinY, cabinWidth, cabinHeight, viewLeft, viewTop, viewRight, viewBottom)) {
        this.drawCroppedSprite(this.cabinSprite, cabinBounds, cabinX, cabinY, cabinWidth, cabinHeight);
        this.drawCabinRainWindowGlow(state, cabinX, cabinY, cabinWidth, cabinHeight);
      }

      if ((!state.shouldDrawScratchingPost || state.shouldDrawScratchingPost()) && scratchingPostBounds) {
        postPlacement = this.getScratchingPostPlacement(cabinX, cabinWidth, world);

        if (this.isWorldRectVisible(postPlacement.x, postPlacement.y, postPlacement.width, postPlacement.height, viewLeft, viewTop, viewRight, viewBottom)) {
          this.drawCroppedSprite(
            this.scratchingPostSprite,
            scratchingPostBounds,
            postPlacement.x,
            postPlacement.y,
            postPlacement.width,
            postPlacement.height
          );
        }
      }
    }

    if (state.shouldDrawTownBlacksmith && state.shouldDrawTownBlacksmith() && blacksmithBounds) {
      blacksmithPlacement = this.getTownBlacksmithPlacement(world);

      if (this.isWorldRectVisible(
        blacksmithPlacement.x,
        blacksmithPlacement.y,
        blacksmithPlacement.width,
        blacksmithPlacement.height,
        viewLeft,
        viewTop,
        viewRight,
        viewBottom
      )) {
        this.drawCroppedSprite(
          this.blacksmithSprite,
          blacksmithBounds,
          blacksmithPlacement.x,
          blacksmithPlacement.y,
          blacksmithPlacement.width,
          blacksmithPlacement.height
        );
      }
    }
  };

  Renderer.prototype.drawTownBackBuildings = function (state, camera) {
    var world = state.world;
    var tile = CONFIG.tileSize;
    var blacksmithBounds = this.blacksmithSpriteBounds;
    var museumBounds = this.museumSpriteBounds;
    var orphanageBounds = this.orphanageSpriteBounds;
    var outhouseBounds = this.outhouseSpriteBounds;
    var blacksmithPlacement;
    var buildings;
    var viewLeft = camera.x - tile;
    var viewTop = camera.y - tile;
    var viewRight = viewLeft + this.viewWidth + tile * 2;
    var viewBottom = viewTop + this.viewHeight + tile * 2;
    var i;
    var building;

    if (!state.shouldDrawTownBlacksmith || !state.shouldDrawTownBlacksmith() || !this.assetsReady || !blacksmithBounds) {
      return;
    }

    blacksmithPlacement = this.getTownBlacksmithPlacement(world);
    buildings = [
      {
        sprite: this.museumSprite,
        bounds: museumBounds,
        placement: museumBounds ? this.getTownMuseumPlacement(world, blacksmithPlacement) : null
      },
      {
        sprite: this.orphanageSprite,
        bounds: orphanageBounds,
        placement: orphanageBounds ? this.getTownOrphanagePlacement(world, blacksmithPlacement) : null
      },
      {
        sprite: this.outhouseSprite,
        bounds: outhouseBounds,
        placement: outhouseBounds ? this.getTownOuthousePlacement(world) : null
      }
    ];

    for (i = 0; i < buildings.length; i += 1) {
      building = buildings[i];

      if (!building.bounds || !building.placement || !this.isWorldRectVisible(
        building.placement.x,
        building.placement.y,
        building.placement.width,
        building.placement.height,
        viewLeft,
        viewTop,
        viewRight,
        viewBottom
      )) {
        continue;
      }

      this.drawCroppedSprite(
        building.sprite,
        building.bounds,
        building.placement.x,
        building.placement.y,
        building.placement.width,
        building.placement.height
      );
    }
  };

  Renderer.prototype.getScratchingPostPlacement = function (cabinX, cabinWidth, world) {
    var tile = this.getSurfaceVisualTileSize();
    var bounds = this.scratchingPostSpriteBounds;
    var height = tile * (CONFIG.scratchingPostHeightTiles || 1.95);
    var width = bounds ? height * (bounds.width / bounds.height) : tile;

    return {
      x: cabinX + cabinWidth + tile * (CONFIG.scratchingPostOffsetXTiles || 0.36),
      y: this.getSurfacePropGroundY(world) - height + (CONFIG.scratchingPostGroundSink || 0),
      width: width,
      height: height
    };
  };

  Renderer.prototype.getTownBlacksmithPlacement = function (world) {
    var tile = CONFIG.tileSize;
    var visualTile = this.getSurfaceVisualTileSize();
    var bounds = this.blacksmithSpriteBounds;
    var height = visualTile * (CONFIG.blacksmithHeightTiles || 4.785);
    var width = bounds ? height * (bounds.width / bounds.height) : height;
    var centerX = world.width * tile / 2;

    return {
      x: centerX - width / 2,
      y: this.getSurfacePropGroundY(world) - height + (CONFIG.blacksmithGroundSink || 12),
      width: width,
      height: height
    };
  };

  Renderer.prototype.getTownMuseumPlacement = function (world, blacksmithPlacement) {
    var tile = this.getSurfaceVisualTileSize();
    var bounds = this.museumSpriteBounds;
    var height = tile * (CONFIG.museumHeightTiles || CONFIG.blacksmithHeightTiles || 4.785);
    var width = bounds ? height * (bounds.width / bounds.height) : height;
    var gap = tile * (CONFIG.townBuildingGapTiles || 0.35);

    return {
      x: blacksmithPlacement.x - gap - width,
      y: this.getSurfacePropGroundY(world) - height + (CONFIG.museumGroundSink || CONFIG.blacksmithGroundSink || 12),
      width: width,
      height: height
    };
  };

  Renderer.prototype.getTownOrphanagePlacement = function (world, blacksmithPlacement) {
    var tile = this.getSurfaceVisualTileSize();
    var bounds = this.orphanageSpriteBounds;
    var height = tile * (CONFIG.orphanageHeightTiles || CONFIG.blacksmithHeightTiles || 4.785);
    var width = bounds ? height * (bounds.width / bounds.height) : height;
    var gap = tile * (CONFIG.townBuildingGapTiles || 0.35);

    return {
      x: blacksmithPlacement.x + blacksmithPlacement.width + gap,
      y: this.getSurfacePropGroundY(world) - height + (CONFIG.orphanageGroundSink || CONFIG.blacksmithGroundSink || 12),
      width: width,
      height: height
    };
  };

  Renderer.prototype.getTownOuthousePlacement = function (world) {
    var tile = CONFIG.tileSize;
    var visualTile = this.getSurfaceVisualTileSize();
    var bounds = this.outhouseSpriteBounds;
    var height = visualTile * (CONFIG.outhouseHeightTiles || 2.9);
    var width = bounds ? height * (bounds.width / bounds.height) : height;

    return {
      x: world.width * tile - width - visualTile * (CONFIG.outhouseOffsetFromRightTiles || 0.85),
      y: this.getSurfacePropGroundY(world) - height + (CONFIG.outhouseGroundSink || 8),
      width: width,
      height: height
    };
  };

  Renderer.prototype.drawCabinRainWindowGlow = function (state, cabinX, cabinY, cabinWidth, cabinHeight) {
    var ctx = this.ctx;
    var alpha = CONFIG.cabinRainWindowGlowAlpha || 0.78;
    var pulse = 0.92 + Math.sin(state.time * 2.1) * 0.08;
    var windows = [
      { x: 0.238, y: 0.555, w: 0.129, h: 0.161 },
      { x: 0.675, y: 0.555, w: 0.129, h: 0.161 }
    ];
    var i;
    var win;
    var x;
    var y;
    var width;
    var height;
    var glow;

    if (!state.isRainyDay || !state.isRainyDay()) {
      return;
    }

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (i = 0; i < windows.length; i += 1) {
      win = windows[i];
      x = cabinX + cabinWidth * win.x;
      y = cabinY + cabinHeight * win.y;
      width = cabinWidth * win.w;
      height = cabinHeight * win.h;

      glow = ctx.createRadialGradient(
        x + width * 0.5,
        y + height * 0.5,
        width * 0.18,
        x + width * 0.5,
        y + height * 0.5,
        width * 1.45
      );
      glow.addColorStop(0, "rgba(255, 222, 126, " + (0.46 * alpha * pulse) + ")");
      glow.addColorStop(0.5, "rgba(255, 178, 65, " + (0.22 * alpha * pulse) + ")");
      glow.addColorStop(1, "rgba(255, 159, 58, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(x - width * 1.05, y - height * 1.05, width * 3.1, height * 3.1);

      ctx.globalAlpha = alpha * pulse;
      ctx.fillStyle = "rgba(255, 207, 99, 0.68)";
      ctx.fillRect(x + width * 0.17, y + height * 0.16, width * 0.26, height * 0.27);
      ctx.fillRect(x + width * 0.57, y + height * 0.16, width * 0.26, height * 0.27);
      ctx.fillRect(x + width * 0.17, y + height * 0.57, width * 0.26, height * 0.27);
      ctx.fillRect(x + width * 0.57, y + height * 0.57, width * 0.26, height * 0.27);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  };

  Renderer.prototype.drawSurfaceBackProps = function (state, camera) {
    var world = state.world;
    var tile = CONFIG.tileSize;
    var tabbyBounds = this.tabbySpriteBounds;
    var treeBounds = this.treeSpriteBounds;
    var signBounds = this.signSpriteBounds;
    var tabbyPlacement;
    var treePlacement;
    var signPlacement;
    var viewLeft = camera.x - tile;
    var viewTop = camera.y - tile;
    var viewRight = viewLeft + this.viewWidth + tile * 2;
    var viewBottom = viewTop + this.viewHeight + tile * 2;
    var tabbyBob = this.getTabbySpeakingBob(state);

    if ((state.shouldDrawSurfaceProps && !state.shouldDrawSurfaceProps()) || !this.assetsReady || !treeBounds) {
      return;
    }

    tabbyPlacement = tabbyBounds && (!state.shouldDrawTabby || state.shouldDrawTabby()) ? this.getTabbyPlacement(world) : null;
    treePlacement = treeBounds ? this.getTreePlacement(world) : null;
    signPlacement = treePlacement && signBounds && (!state.shouldDrawMewberrySign || state.shouldDrawMewberrySign()) &&
      (!state.shouldDrawForegroundSurfaceTree || state.shouldDrawForegroundSurfaceTree()) ?
      this.getTreeSignPlacement(world) :
      null;

    if (treeBounds) {
      this.drawBackgroundTrees(state, camera, treeBounds, viewLeft, viewTop, viewRight, viewBottom);
    }

    if (tabbyPlacement) {
      tabbyPlacement.y += tabbyBob;
    }

    if ((!state.shouldDrawForegroundSurfaceTree || state.shouldDrawForegroundSurfaceTree()) &&
      treePlacement && this.isWorldRectVisible(
      treePlacement.x,
      treePlacement.y,
      treePlacement.width,
      treePlacement.height,
      viewLeft,
      viewTop,
      viewRight,
      viewBottom
    )) {
      this.drawCroppedSprite(
        this.treeSprite,
        treeBounds,
        treePlacement.x,
        treePlacement.y,
        treePlacement.width,
        treePlacement.height
      );
    }

    if (signPlacement && this.isWorldRectVisible(
      signPlacement.x,
      signPlacement.y,
      signPlacement.width,
      signPlacement.height,
      viewLeft,
      viewTop,
      viewRight,
      viewBottom
    )) {
      this.drawCroppedSprite(
        this.signSprite,
        signBounds,
        signPlacement.x,
        signPlacement.y,
        signPlacement.width,
        signPlacement.height
      );
    }

    if (tabbyPlacement && this.isWorldRectVisible(
      tabbyPlacement.x,
      tabbyPlacement.y,
      tabbyPlacement.width,
      tabbyPlacement.height,
      viewLeft,
      viewTop,
      viewRight,
      viewBottom
    )) {
      this.drawCroppedSpriteFlippedX(
        this.tabbySprite,
        tabbyBounds,
        tabbyPlacement.x,
        tabbyPlacement.y,
        tabbyPlacement.width,
        tabbyPlacement.height,
        false
      );
    }
  };

  Renderer.prototype.drawBackgroundTrees = function (state, camera, treeBounds, viewLeft, viewTop, viewRight, viewBottom) {
    var ctx = this.ctx;
    var world = state.world;
    var tile = CONFIG.tileSize;
    var visualTile = this.getSurfaceVisualTileSize();
    var count = CONFIG.backgroundTreeCount || 0;
    var groundY = this.getSurfacePropGroundY(world);
    var worldWidth = world.width * tile;
    var parallax = 0.52;
    var i;
    var seed;
    var height;
    var width;
    var baseX;
    var x;
    var y;
    var sink;

    if (!count || !treeBounds) {
      return;
    }

    ctx.save();
    ctx.globalAlpha = CONFIG.backgroundTreeAlpha || 0.24;

    for (i = 0; i < count; i += 1) {
      seed = CONFIG.seed + 4200 + i * 31;
      height = visualTile * (3.4 + Random.value2D(i, 3, seed) * 1.9);
      width = height * (treeBounds.width / treeBounds.height);
      baseX = (i + 0.18 + Random.value2D(i, 7, seed) * 0.64) * worldWidth / Math.max(1, count);
      x = baseX + camera.x * (1 - parallax) - width / 2;
      sink = visualTile * (0.08 + Random.value2D(i, 11, seed) * 0.28);
      y = groundY - height + sink;

      if (!this.isWorldRectVisible(x, y, width, height, viewLeft, viewTop, viewRight, viewBottom)) {
        continue;
      }

      this.drawCroppedSpriteSmooth(this.treeSprite, treeBounds, x, y, width, height);
    }

    ctx.restore();
  };

  Renderer.prototype.drawSurfaceButterflies = function (state) {
    var ctx = this.ctx;
    var world = state.world;
    var tile = CONFIG.tileSize;
    var groundY = world.surfaceY * tile - 8;
    var worldWidth = world.width * tile;
    var count = CONFIG.butterflyCount || 0;
    var maxAlpha = typeof CONFIG.butterflyOpacity === "number" ? CONFIG.butterflyOpacity : 0.6;
    var targetAlpha = state.isRainyDay && state.isRainyDay() ? 0 : maxAlpha;
    var fadeFollow = Math.min(1, state.dt * (CONFIG.butterflyFadeSpeed || 3.2));
    var flyHeight = CONFIG.butterflySurfaceHeight || 64;
    var speed = CONFIG.butterflySpeed || 8;
    var scale = typeof CONFIG.butterflyScale === "number" ? CONFIG.butterflyScale : 1;
    var colors = [
      "#ffd45f",
      "#ff8fb3",
      "#8ee9ff",
      "#cfa5ff"
    ];
    var i;
    var baseX;
    var seed;
    var x;
    var y;
    var size;
    var flap;
    var drift;
    var color;

    if ((state.shouldDrawSurfaceButterflies && !state.shouldDrawSurfaceButterflies()) || count <= 0) {
      this.butterflyAlpha = 0;
      return;
    }

    this.butterflyAlpha += (targetAlpha - this.butterflyAlpha) * fadeFollow;

    if (this.butterflyAlpha <= 0.01) {
      return;
    }

    ctx.save();
    ctx.globalAlpha = this.butterflyAlpha;
    ctx.lineWidth = 0.75;

    for (i = 0; i < count; i += 1) {
      seed = CONFIG.seed + i * 97;
      baseX = Random.value2D(i, 11, seed) * worldWidth;
      drift = Math.sin(state.time * (0.7 + Random.value2D(i, 13, seed) * 0.9) + i) * 18;
      x = (baseX + state.time * speed * (0.55 + Random.value2D(i, 17, seed)) + drift) % worldWidth;
      y = groundY - 18 - Random.value2D(i, 19, seed) * flyHeight +
        Math.sin(state.time * (1.5 + Random.value2D(i, 23, seed) * 1.8) + i * 2.4) * 9;
      size = (2.4 + Random.value2D(i, 29, seed) * 2.2) * scale;
      flap = 0.58 + Math.abs(Math.sin(state.time * (8.5 + Random.value2D(i, 31, seed) * 4) + i)) * 0.78;
      color = colors[i % colors.length];

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(state.time * 1.2 + i) * 0.25);
      ctx.fillStyle = color;
      ctx.strokeStyle = "rgba(64, 38, 28, 0.55)";
      ctx.beginPath();
      ctx.ellipse(-size * 0.62, -size * 0.12, size * 0.85, size * flap, -0.55, 0, Math.PI * 2);
      ctx.ellipse(size * 0.62, -size * 0.12, size * 0.85, size * flap, 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#3b251b";
      ctx.fillRect(-0.45, -size * 0.9, 0.9, size * 1.55);
      ctx.restore();
    }

    ctx.restore();
  };

  Renderer.prototype.drawSurfaceFireflies = function (state) {
    var ctx = this.ctx;
    var world = state.world;
    var tile = CONFIG.tileSize;
    var groundY = world.surfaceY * tile - 10;
    var worldWidth = world.width * tile;
    var count = CONFIG.fireflyCount || 0;
    var maxAlpha = typeof CONFIG.fireflyOpacity === "number" ? CONFIG.fireflyOpacity : 0.8;
    var flyHeight = CONFIG.fireflySurfaceHeight || 74;
    var speed = CONFIG.fireflySpeed || 7;
    var i;
    var seed;
    var baseX;
    var x;
    var y;
    var pulse;
    var size;
    var glowSize;
    var alpha;
    var gradient;

    if ((state.shouldDrawSurfaceFireflies && !state.shouldDrawSurfaceFireflies()) || count <= 0) {
      return;
    }

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (i = 0; i < count; i += 1) {
      seed = CONFIG.seed + 5800 + i * 113;
      baseX = Random.value2D(i, 41, seed) * worldWidth;
      x = (baseX + Math.sin(state.time * (0.28 + Random.value2D(i, 43, seed) * 0.36) + i) * 18 +
        state.time * speed * (0.25 + Random.value2D(i, 47, seed) * 0.5)) % worldWidth;
      y = groundY - 16 - Random.value2D(i, 53, seed) * flyHeight +
        Math.sin(state.time * (1.2 + Random.value2D(i, 59, seed) * 1.9) + i * 1.7) * 11;
      pulse = 0.36 + Math.pow(Math.max(0, Math.sin(state.time * (2.4 + Random.value2D(i, 61, seed) * 2.5) + i)), 2) * 0.64;
      size = 0.6 + Random.value2D(i, 67, seed) * 0.6;
      glowSize = 2.5 + pulse * 4;
      alpha = maxAlpha * pulse;

      gradient = ctx.createRadialGradient(x, y, 0.5, x, y, glowSize);
      gradient.addColorStop(0, "rgba(230,255,128," + alpha + ")");
      gradient.addColorStop(0.42, "rgba(134,255,105," + (alpha * 0.38) + ")");
      gradient.addColorStop(1, "rgba(87,190,91,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, glowSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = Math.min(1, alpha + 0.12);
      ctx.fillStyle = "#f2ff9e";
      ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), Math.ceil(size), Math.ceil(size));
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  };

  Renderer.prototype.drawShrine = function (state, camera) {
    var world = state.world;
    var bounds = this.shrineSpriteBounds;
    var placement;
    var tile = CONFIG.tileSize;
    var viewLeft = camera.x - tile;
    var viewTop = camera.y - tile;
    var viewRight = viewLeft + this.viewWidth + tile * 2;
    var viewBottom = viewTop + this.viewHeight + tile * 2;

    if ((state.shouldDrawShrine && !state.shouldDrawShrine()) || !this.assetsReady || !bounds) {
      return;
    }

    placement = this.getShrinePlacement(world);

    if (!this.isWorldRectVisible(
      placement.x,
      placement.y,
      placement.width,
      placement.height,
      viewLeft,
      viewTop,
      viewRight,
      viewBottom
    )) {
      return;
    }

    this.drawCroppedSprite(this.shrineSprite, bounds, placement.x, placement.y, placement.width, placement.height);
  };

  Renderer.prototype.drawLuckFlowers = function (state, camera) {
    var sprites = this.luckFlowerSprites || [];
    var boundsList = this.luckFlowerSpriteBounds || [];
    var world = state.world;
    var tile = CONFIG.tileSize;
    var visualTile = this.getSurfaceVisualTileSize();
    var count = CONFIG.luckFlowerCount || 0;
    var groundY = this.getSurfacePropGroundY(world);
    var viewLeft = camera.x - tile;
    var viewTop = camera.y - tile;
    var viewRight = viewLeft + this.viewWidth + tile * 2;
    var viewBottom = viewTop + this.viewHeight + tile * 2;
    var i;
    var spriteIndex;
    var sprite;
    var bounds;
    var roll;
    var height;
    var width;
    var x;
    var y;
    var spacing;
    var jitter;
    var opacity = typeof CONFIG.luckFlowerOpacity === "number" ? CONFIG.luckFlowerOpacity : 0.8;
    var bob;
    var sway;

    if ((state.shouldDrawShrine && !state.shouldDrawShrine()) || !sprites.length || count <= 0) {
      return;
    }

    spacing = world.width / Math.max(1, count);
    this.ctx.save();
    this.ctx.globalAlpha = opacity;

    for (i = 0; i < count; i += 1) {
      spriteIndex = i % sprites.length;
      sprite = sprites[spriteIndex];
      bounds = boundsList[spriteIndex];

      if (!sprite || !bounds) {
        continue;
      }

      roll = Random.value2D(i, 137, CONFIG.seed + 7021);
      jitter = (roll - 0.5) * spacing * 0.32;
      height = visualTile * (CONFIG.luckFlowerHeightTiles || 0.68) * (0.82 + Random.value2D(i, 139, CONFIG.seed + 7027) * 0.36);
      width = height * (bounds.width / bounds.height);
      x = tile * Math.min(world.width - 0.55, Math.max(0.55, (i + 0.5) * spacing + jitter)) - width / 2;
      bob = Math.sin(state.time * (1.5 + Random.value2D(i, 149, CONFIG.seed + 7039) * 0.8) + i * 0.9) * 1.6;
      sway = Math.sin(state.time * (1.1 + Random.value2D(i, 151, CONFIG.seed + 7043) * 0.65) + i * 1.4) * 0.09;
      y = groundY - height - visualTile * 0.08 + bob;

      if (!this.isWorldRectVisible(x, y, width, height, viewLeft, viewTop, viewRight, viewBottom)) {
        continue;
      }

      this.ctx.save();
      this.ctx.translate(x + width / 2, y + height);
      this.ctx.rotate(sway);
      this.drawCroppedSprite(this.luckFlowerSprites[spriteIndex], bounds, -width / 2, -height, width, height);
      this.ctx.restore();
    }

    this.ctx.restore();
  };

  Renderer.prototype.getTabbySpeakingBob = function (state) {
    var text = state.getTabbyDialogText ? state.getTabbyDialogText() : (CONFIG.tabbyDialogText || "");
    var charCount;

    if (!state.tabbyDialogOpen || state.tabbyDialogProgress <= 0) {
      return 0;
    }

    charCount = Math.floor(state.tabbyDialogTextTimer * CONFIG.tabbyDialogCharsPerSecond);

    if (charCount >= text.length) {
      return 0;
    }

    return Math.round(Math.sin(state.time * 10) * 1.6);
  };

  Renderer.prototype.isWorldRectVisible = function (x, y, width, height, viewLeft, viewTop, viewRight, viewBottom) {
    return x + width >= viewLeft &&
      x <= viewRight &&
      y + height >= viewTop &&
      y <= viewBottom;
  };

  Renderer.prototype.getSurfaceVisualTileSize = function () {
    return CONFIG.surfaceVisualTileSize || CONFIG.tileSize;
  };

  Renderer.prototype.getSurfacePropGroundY = function (world) {
    return world.surfaceY * CONFIG.tileSize + CONFIG.surfacePropGroundOffset;
  };

  Renderer.prototype.getTabbyPlacement = function (world) {
    var tile = CONFIG.tileSize;
    var visualTile = this.getSurfaceVisualTileSize();
    var bounds = this.tabbySpriteBounds;
    var height = visualTile * 1.55;
    var width = bounds ? height * (bounds.width / bounds.height) : visualTile;
    var tileX = world.width - 1;
    var centerX = tileX * tile + tile / 2;

    return {
      x: centerX - width / 2,
      y: this.getSurfacePropGroundY(world) - height,
      width: width,
      height: height
    };
  };

  Renderer.prototype.getTreePlacement = function (world) {
    var tile = this.getSurfaceVisualTileSize();
    var bounds = this.treeSpriteBounds;
    var tabbyPlacement = this.getTabbyPlacement(world);
    var height = tile * (CONFIG.treeHeightTiles || 4.7);
    var width = bounds ? height * (bounds.width / bounds.height) : height;

    return {
      x: tabbyPlacement.x + tile * (CONFIG.treeOffsetXTiles || 0),
      y: this.getSurfacePropGroundY(world) - height + (CONFIG.treeGroundSink || 0),
      width: width,
      height: height
    };
  };

  Renderer.prototype.getTreeSignPlacement = function (world) {
    var tile = this.getSurfaceVisualTileSize();
    var bounds = this.signSpriteBounds;
    var treePlacement = this.getTreePlacement(world);
    var height = tile * (CONFIG.treeSignHeightTiles || 1.48);
    var width = bounds ? height * (bounds.width / bounds.height) : tile;

    return {
      x: treePlacement.x + tile * (CONFIG.treeSignOffsetXTiles || -1),
      y: this.getSurfacePropGroundY(world) - height,
      width: width,
      height: height
    };
  };

  Renderer.prototype.getShrinePlacement = function (world) {
    var visualTile = this.getSurfaceVisualTileSize();
    var bounds = this.shrineSpriteBounds;
    var height = visualTile * (CONFIG.shrineHeightTiles || 2.35);
    var width = bounds ? height * (bounds.width / bounds.height) : height;
    var centerX = (CONFIG.shrineOffsetXTiles || 1.35) * visualTile;

    return {
      x: centerX - width / 2,
      y: this.getSurfacePropGroundY(world) - height + (CONFIG.shrineGroundSink || 0),
      width: width,
      height: height
    };
  };

  Renderer.prototype.drawInteractPrompt = function (text, x, y, pulse) {
    var ctx = this.ctx;
    var width;
    var progress = pulse || 0;
    var pop = progress > 0 ? Math.sin((1 - progress) * Math.PI) : 0;
    var scale = 1 + pop * 0.18;
    var lift = pop * 4;

    ctx.save();
    ctx.translate(x, y - lift);
    ctx.scale(scale, scale);
    ctx.font = "bold 8px 'Lucida Console', 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    width = Math.ceil(ctx.measureText(text).width) + 12;
    ctx.fillStyle = progress > 0 ? "rgba(38, 24, 10, 0.92)" : "rgba(19, 13, 8, 0.82)";
    ctx.fillRect(Math.round(-width / 2), -8, width, 15);
    ctx.strokeStyle = progress > 0 ? "#fff1a8" : "#ffd35d";
    ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(-width / 2) + 0.5, -7.5, width - 1, 14);
    ctx.fillStyle = "#fff1a8";
    ctx.fillText(text, 0, 1);
    ctx.restore();
  };

  Renderer.prototype.drawShrinePrompt = function (state) {
    var placement;
    var text = "Press E";
    var x;
    var y;
    var pulse = state.getInteractPromptPulse ? state.getInteractPromptPulse("shrine") : 0;

    if ((!state.canInteractWithShrine || !state.canInteractWithShrine()) && !pulse) {
      return;
    }

    if (!pulse && (state.isLuckUIActive() || state.isUpgradeUIActive() || state.isTabbyDialogActive())) {
      return;
    }

    placement = this.getShrinePlacement(state.world);
    x = Math.round(placement.x + placement.width / 2);
    y = Math.round(placement.y - 10);
    this.drawInteractPrompt(text, x, y, pulse);
  };

  Renderer.prototype.drawTabbyPrompt = function (state) {
    var placement;
    var text = "Tap E";
    var x;
    var y;
    var pulse = state.getInteractPromptPulse ? state.getInteractPromptPulse("tabby") : 0;

    if ((!state.canInteractWithTabby || !state.canInteractWithTabby()) && !pulse) {
      return;
    }

    if (!pulse && state.isTabbyDialogActive()) {
      return;
    }

    placement = this.getTabbyPlacement(state.world);
    x = Math.round(placement.x + placement.width / 2);
    y = Math.round(placement.y - 10);
    this.drawInteractPrompt(text, x, y, pulse);
  };

  Renderer.prototype.drawTownMuseumPrompt = function (state) {
    var cat = state.cat;
    var tile = CONFIG.tileSize;
    var text = "Press E";
    var x;
    var y;
    var pulse = state.getInteractPromptPulse ? state.getInteractPromptPulse("museum") : 0;

    if ((!state.canInteractWithTownMuseum || !state.canInteractWithTownMuseum()) && !pulse) {
      return;
    }

    if (!pulse && (state.isCompendiumUIActive() || state.isUpgradeUIActive() || state.isLuckUIActive() || state.isTabbyDialogActive())) {
      return;
    }

    x = Math.round(cat.getVisualX() * tile + tile / 2);
    y = Math.round(cat.getVisualY() * tile - 20);
    this.drawInteractPrompt(text, x, y, pulse);
  };

  Renderer.prototype.drawTownOuthousePrompt = function (state) {
    var placement;
    var text = "Press E";
    var x;
    var y;
    var pulse = state.getInteractPromptPulse ? state.getInteractPromptPulse("outhouse") : 0;

    if ((!state.canInteractWithTownOuthouse || !state.canInteractWithTownOuthouse()) && !pulse) {
      return;
    }

    if (!pulse && (state.isCompendiumUIActive() || state.isUpgradeUIActive() || state.isLuckUIActive() || state.isTabbyDialogActive())) {
      return;
    }

    placement = this.getTownOuthousePlacement(state.world);
    x = Math.round(placement.x + placement.width / 2);
    y = Math.round(placement.y - 10);
    this.drawInteractPrompt(text, x, y, pulse);
  };

  Renderer.prototype.drawTownBlacksmithPrompt = function (state) {
    var cat = state.cat;
    var tile = CONFIG.tileSize;
    var text = "Press E";
    var x;
    var y;
    var pulse = state.getInteractPromptPulse ? state.getInteractPromptPulse("blacksmith") : 0;

    if ((!state.canInteractWithTownBlacksmith || !state.canInteractWithTownBlacksmith()) && !pulse) {
      return;
    }

    if (!pulse && (state.isBlacksmithUIActive() || state.isCompendiumUIActive() || state.isUpgradeUIActive() ||
      state.isLuckUIActive() || state.isTabbyDialogActive())) {
      return;
    }

    x = Math.round(cat.getVisualX() * tile + tile / 2);
    y = Math.round(cat.getVisualY() * tile - 20);
    this.drawInteractPrompt(text, x, y, pulse);
  };

  Renderer.prototype.drawCabinPrompt = function (state) {
    var cat = state.cat;
    var tile = CONFIG.tileSize;
    var text = "Press E";
    var x;
    var y;
    var pulse = state.getInteractPromptPulse ? state.getInteractPromptPulse("cabin") : 0;

    if ((!state.isNearCabin || !state.isNearCabin()) && !pulse) {
      return;
    }

    if (!pulse && (state.isUpgradeUIActive() || state.isTabbyDialogActive())) {
      return;
    }

    x = Math.round(cat.getVisualX() * tile + tile / 2);
    y = Math.round(cat.getVisualY() * tile - 20);

    this.drawInteractPrompt(text, x, y, pulse);
  };

  Renderer.prototype.drawOuthouseOccupiedBubble = function (state) {
    var ctx = this.ctx;
    var timer = state.outhouseBubbleTimer || 0;
    var duration = CONFIG.outhouseOccupiedBubbleSeconds || 1.4;
    var placement;
    var text = "OCCUPIED";
    var progress;
    var alpha;
    var x;
    var y;
    var width;
    var height = 20;

    if (timer <= 0 || !state.isInTownArea || !state.isInTownArea()) {
      return;
    }

    placement = this.getTownOuthousePlacement(state.world);
    progress = 1 - Math.min(1, timer / duration);
    alpha = Math.min(1, timer * 5) * (1 - Math.max(0, progress - 0.72) / 0.28);
    x = Math.round(placement.x + placement.width / 2);
    y = Math.round(placement.y + placement.height + 18 - Math.sin(progress * Math.PI) * 4);
    width = 72;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "bold 10px 'Lucida Console', 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 245, 213, 0.94)";
    ctx.fillRect(Math.round(x - width / 2), y - height / 2, width, height);
    ctx.strokeStyle = "#5b3520";
    ctx.lineWidth = 2;
    ctx.strokeRect(Math.round(x - width / 2) + 0.5, y - height / 2 + 0.5, width - 1, height - 1);
    ctx.fillStyle = "#4a2416";
    ctx.fillText(text, x, y + 1);
    ctx.beginPath();
    ctx.moveTo(x - 6, y + height / 2 - 1);
    ctx.lineTo(x + 3, y + height / 2 + 8);
    ctx.lineTo(x + 7, y + height / 2 - 1);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 245, 213, 0.94)";
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };
})();
