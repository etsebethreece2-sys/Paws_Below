(function () {
  "use strict";

  window.PawsBelow = window.PawsBelow || {};

  var Renderer = window.PawsBelow.Renderer;
  var CONFIG = window.PawsBelow.CONFIG;

  if (!Renderer) {
    return;
  }

  Renderer.prototype.drawUpgradeUI = function (state) {
    var ctx = this.ctx;
    var pawImage = this.getUpgradeUIImage(state.pawLevel);
    var pawBounds = this.getUpgradeUIBounds(state.pawLevel);
    var storageImage = this.getStorageUpgradeUIImage(state.storageLevel);
    var storageBounds = this.getStorageUpgradeUIBounds(state.storageLevel);
    var staminaImage = this.getStaminaUpgradeUIImage(state.staminaLevel);
    var staminaBounds = this.getStaminaUpgradeUIBounds(state.staminaLevel);
    var maxWidth;
    var maxHeight;
    var gap;
    var cardWidth;
    var pawHeight;
    var storageHeight;
    var staminaHeight;
    var totalWidth;
    var tallestHeight;
    var topY;
    var x;
    var storageX;
    var staminaX;
    var progress = state.upgradeUIProgress || 0;
    var eased;
    var scaleX;
    var scaleY;
    var pivotX;
    var pivotY;
    var fade;

    if (progress <= 0 || !pawBounds || !storageBounds || !staminaBounds) {
      return;
    }

    maxWidth = this.width - 32;
    maxHeight = this.height - 32;
    gap = Math.max(12, Math.min(34, this.width * 0.04));
    cardWidth = Math.min((maxWidth - gap * 2) / 3, pawBounds.width, storageBounds.width, staminaBounds.width);
    pawHeight = cardWidth * (pawBounds.height / pawBounds.width);
    storageHeight = cardWidth * (storageBounds.height / storageBounds.width);
    staminaHeight = cardWidth * (staminaBounds.height / staminaBounds.width);
    tallestHeight = Math.max(pawHeight, storageHeight, staminaHeight);

    if (tallestHeight > maxHeight) {
      cardWidth *= maxHeight / tallestHeight;
      pawHeight = cardWidth * (pawBounds.height / pawBounds.width);
      storageHeight = cardWidth * (storageBounds.height / storageBounds.width);
      staminaHeight = cardWidth * (staminaBounds.height / staminaBounds.width);
      tallestHeight = Math.max(pawHeight, storageHeight, staminaHeight);
    }

    totalWidth = cardWidth * 3 + gap * 2;
    x = Math.round((this.width - totalWidth) / 2);
    storageX = Math.round(x + cardWidth + gap);
    staminaX = Math.round(storageX + cardWidth + gap);
    topY = Math.round((this.height - tallestHeight) / 2);
    eased = 1 - Math.pow(1 - progress, 3);
    fade = progress * progress * (3 - 2 * progress);
    scaleX = 0.76 + eased * 0.24;
    scaleY = 0.18 + eased * 0.82;
    pivotX = x + totalWidth / 2;
    pivotY = topY + tallestHeight * 0.84;
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, " + (0.34 * fade) + ")";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalAlpha = fade;
    ctx.imageSmoothingEnabled = false;
    this.drawUpgradeMenuBackground(0, 0, this.width, this.height);
    ctx.translate(pivotX, pivotY);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-pivotX, -pivotY);
    this.drawUpgradeCard(pawImage, pawBounds, x, topY, cardWidth, pawHeight, state, "paw");
    this.drawUpgradeCard(storageImage, storageBounds, storageX, topY, cardWidth, storageHeight, state, "storage");
    this.drawUpgradeCard(staminaImage, staminaBounds, staminaX, topY, cardWidth, staminaHeight, state, "stamina");
    ctx.restore();
  };

  Renderer.prototype.drawLuckUI = function (state) {
    var ctx = this.ctx;
    var image = this.luckUISprite;
    var bounds = this.luckUISpriteBounds;
    var progress = state.luckUIProgress || 0;
    var maxWidth;
    var maxHeight;
    var width;
    var height;
    var x;
    var y;
    var eased;
    var fade;
    var scaleX;
    var scaleY;
    var pivotX;
    var pivotY;
    var totalLuck;
    var messageProgress;
    var messageScale;
    var messageY;
    var messageAlpha;

    if (progress <= 0 || !image || !bounds) {
      return;
    }

    maxWidth = this.width - 36;
    maxHeight = this.height - 36;
    width = Math.min(bounds.width, maxWidth);
    height = width * (bounds.height / bounds.width);

    if (height > maxHeight) {
      height = maxHeight;
      width = height * (bounds.width / bounds.height);
    }

    x = Math.round((this.width - width) / 2);
    y = Math.round((this.height - height) / 2);
    eased = 1 - Math.pow(1 - progress, 3);
    fade = progress * progress * (3 - 2 * progress);
    scaleX = 0.8 + eased * 0.2;
    scaleY = 0.2 + eased * 0.8;
    pivotX = x + width / 2;
    pivotY = y + height * 0.86;

    ctx.save();
    this.drawLuckBackground(fade);
    ctx.fillStyle = "rgba(0, 0, 0, " + (0.18 * fade) + ")";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalAlpha = fade;
    ctx.imageSmoothingEnabled = false;
    ctx.translate(pivotX, pivotY);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-pivotX, -pivotY);
    ctx.drawImage(
      image,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      x,
      y,
      Math.round(width),
      Math.round(height)
    );

    totalLuck = state.getTotalLuckPercent ? state.getTotalLuckPercent() : 0;
    ctx.globalAlpha = fade;
    ctx.font = "bold " + Math.max(12, Math.round(height * 0.033)) + "px 'Lucida Console', 'Courier New', monospace";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff1a8";
    ctx.strokeStyle = "rgba(9, 10, 8, 0.82)";
    ctx.lineWidth = Math.max(2, Math.round(height * 0.004));
    ctx.textAlign = "left";
    ctx.strokeText("Total:", x + width * 0.33, y + height * 0.705);
    ctx.fillText("Total:", x + width * 0.33, y + height * 0.705);
    ctx.strokeText("+" + totalLuck + "%", x + width * 0.49, y + height * 0.705);
    ctx.fillText("+" + totalLuck + "%", x + width * 0.49, y + height * 0.705);

    if (state.luckMessageTimer > 0) {
      messageProgress = 1 - Math.max(0, Math.min(1, state.luckMessageTimer / 1.35));
      messageScale = 1.18 - messageProgress * 0.18 + Math.sin(messageProgress * Math.PI) * 0.08;
      messageY = y + height * 0.745 - Math.sin(messageProgress * Math.PI) * height * 0.035;
      messageAlpha = fade * Math.min(1, state.luckMessageTimer * 4) * (1 - Math.max(0, messageProgress - 0.72) / 0.28);
      ctx.globalAlpha = messageAlpha;
      ctx.font = "bold " + Math.max(14, Math.round(height * 0.045 * messageScale)) + "px 'Lucida Console', 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#9aff62";
      ctx.strokeStyle = "rgba(9, 31, 13, 0.82)";
      ctx.lineWidth = Math.max(2, Math.round(height * 0.006));
      ctx.strokeText("+10% Luck", x + width * 0.5, messageY);
      ctx.fillText("+10% Luck", x + width * 0.5, messageY);
      ctx.globalAlpha = fade;
    }

    ctx.restore();
  };

  Renderer.prototype.drawCompendiumUI = function (state) {
    var ctx = this.ctx;
    var image = this.compendiumSprite;
    var bounds = this.compendiumSpriteBounds;
    var progress = state.compendiumUIProgress || 0;
    var maxWidth;
    var maxHeight;
    var width;
    var height;
    var x;
    var y;
    var eased;
    var fade;
    var scale;

    if (progress <= 0 || !image || !bounds) {
      return;
    }

    maxWidth = this.width - 36;
    maxHeight = this.height - 36;
    width = Math.min(bounds.width, maxWidth);
    height = width * (bounds.height / bounds.width);

    if (height > maxHeight) {
      height = maxHeight;
      width = height * (bounds.width / bounds.height);
    }

    x = Math.round((this.width - width) / 2);
    y = Math.round((this.height - height) / 2);
    eased = 1 - Math.pow(1 - progress, 3);
    fade = progress * progress * (3 - 2 * progress);
    scale = 0.84 + eased * 0.16;

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, " + (0.42 * fade) + ")";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalAlpha = fade;
    ctx.imageSmoothingEnabled = false;
    ctx.translate(x + width / 2, y + height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-x - width / 2, -y - height / 2);
    ctx.drawImage(
      image,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      x,
      y,
      Math.round(width),
      Math.round(height)
    );
    ctx.restore();
  };

  Renderer.prototype.drawBlacksmithUI = function (state) {
    var ctx = this.ctx;
    var progress = state.blacksmithUIProgress || 0;
    var upgrades = CONFIG.pickaxeUpgrades || [];
    var costs = CONFIG.pickaxeUpgradeCosts || [];
    var maxWidth;
    var width;
    var height;
    var x;
    var y;
    var eased;
    var fade;
    var scaleY;
    var menuScale = CONFIG.blacksmithMenuScale || 1;
    var headerHeight = Math.round(48 * menuScale);
    var rowHeight;
    var gap = Math.round(8 * menuScale);
    var columnGap = Math.round(10 * menuScale);
    var columns;
    var rows;
    var column;
    var row;
    var i;
    var rowX;
    var rowY;
    var rowWidth;
    var owned;
    var next;
    var revealed;
    var color;
    var name;
    var strength;
    var cost;
    var label;
    var labelWidth;
    var nameWidth;
    var strengthWidth;
    var iconSize;
    var textX;
    var auntRect;
    var auntReserve;
    var unlockTarget;
    var effectiveStrength;
    var strengthLabel;
    var pickColors = [
      "#6f7d86",
      "#b87333",
      "#8b8f94",
      "#d7f0ff",
      "#d89f35",
      "#6dd6ff",
      "#e1a7ff",
      "#b52c36",
      "#83eee8"
    ];

    this.blacksmithUpgradeHitRects = [];

    if (progress <= 0) {
      return;
    }

    columns = upgrades.length > 5 ? 2 : 1;
    rows = Math.ceil(upgrades.length / columns);
    auntReserve = this.auntSandersSpriteBounds && this.width > 560 ? Math.min(413, this.width * 0.521) + 28 : 0;
    maxWidth = Math.max(300, Math.min(this.width - 28 - auntReserve, (columns > 1 ? 700 : 620) * menuScale));
    width = maxWidth;
    rowWidth = (width - 32 * menuScale - columnGap * (columns - 1)) / columns;
    rowHeight = Math.max(34 * menuScale, Math.min(58 * menuScale, (this.height - 64 - headerHeight - gap * Math.max(0, rows - 1)) / Math.max(1, rows)));
    height = headerHeight + rowHeight * rows + gap * Math.max(0, rows - 1) + 28 * menuScale;

    if (height > this.height - 28) {
      height = this.height - 28;
      rowHeight = (height - headerHeight - 28 * menuScale - gap * Math.max(0, rows - 1)) / Math.max(1, rows);
    }

    y = Math.round((this.height - height) / 2);
    x = Math.round((this.width - width) / 2);
    auntRect = this.getAuntSandersMenuRect(y, height);

    if (auntRect && this.width > 560) {
      x = Math.round((this.width - (auntRect.width + 24 + width)) / 2 + auntRect.width + 24);
      auntRect.x = Math.round(Math.max(4, x - auntRect.width - 28));
    } else if (auntRect) {
      auntRect.x = Math.round(Math.max(8, x - auntRect.width * 0.58));
    }

    eased = 1 - Math.pow(1 - progress, 3);
    fade = progress * progress * (3 - 2 * progress);
    scaleY = 0.22 + eased * 0.78;

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, " + (0.38 * fade) + ")";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalAlpha = fade;
    ctx.translate(x + width / 2, y + height * 0.86);
    ctx.scale(1, scaleY);
    ctx.translate(-x - width / 2, -y - height * 0.86);

    if (auntRect) {
      this.drawAuntSandersSprite(auntRect.x, auntRect.y, auntRect.width, auntRect.height);
    }

    this.drawBlacksmithMenuBackground(x, y, width, height);
    ctx.strokeStyle = "#f2c16a";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);

    ctx.font = "900 " + Math.round(20 * menuScale) + "px 'Lucida Console', 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffe29a";
    ctx.fillText("Blacksmith", x + 22 * menuScale, y + headerHeight / 2);

    rowX = x + 16 * menuScale;
    rowWidth = (width - 32 * menuScale - columnGap * (columns - 1)) / columns;

    for (i = 0; i < upgrades.length; i += 1) {
      column = i % columns;
      row = Math.floor(i / columns);
      rowX = x + 16 * menuScale + column * (rowWidth + columnGap);
      rowY = y + headerHeight + row * (rowHeight + gap);
      owned = i < (state.pickaxeLevel || 0);
      next = i === (state.pickaxeLevel || 0);
      revealed = i <= (state.pickaxeLevel || 0);
      color = pickColors[i % pickColors.length];
      name = revealed ? (upgrades[i].name || ("Pickaxe " + (i + 1))) : "????";
      strength = upgrades[i].strength || 0;
      effectiveStrength = strength * (CONFIG.pickaxeOreDamageScale || 1);
      strengthLabel = revealed ? ("Str " + strength + (effectiveStrength > (state.pawPower || 1) ? " +dirt" : " ore")) : "???";
      cost = costs[i] || 0;
      label = owned ? "OWNED" : (next ? cost + " coins" : "LOCKED");

      this.blacksmithUpgradeHitRects.push({
        x: rowX,
        y: rowY,
        width: rowWidth,
        height: rowHeight
      });

      ctx.fillStyle = owned ? "rgba(72, 64, 48, 0.92)" : (next ? "rgba(76, 47, 32, 0.96)" : "rgba(30, 26, 24, 0.88)");
      ctx.fillRect(rowX, rowY, rowWidth, rowHeight);
      ctx.strokeStyle = next ? "#ffd56d" : (owned ? "#9bd27d" : "#6f6257");
      ctx.lineWidth = next ? 2 : 1;
      ctx.strokeRect(rowX + 0.5, rowY + 0.5, rowWidth - 1, rowHeight - 1);

      iconSize = Math.min(36 * menuScale, rowHeight * 0.78, rowWidth * 0.18);
      if (revealed) {
        this.drawPickaxeUpgradeIcon(i, rowX + Math.min(25 * menuScale, rowWidth * 0.14), rowY + rowHeight / 2, iconSize, color);
      } else {
        this.drawPickaxeQuestionMark(rowX + Math.min(25 * menuScale, rowWidth * 0.14), rowY + rowHeight / 2, iconSize);
      }
      labelWidth = Math.min(84 * menuScale, rowWidth * 0.42);
      textX = rowX + Math.max(44 * menuScale, Math.min(56 * menuScale, rowWidth * 0.18));
      nameWidth = rowWidth - (textX - rowX) - 10 * menuScale;
      strengthWidth = rowWidth - (textX - rowX) - labelWidth - 10 * menuScale;

      ctx.font = "900 " + Math.max(12, Math.round(rowHeight * 0.26)) + "px 'Lucida Console', 'Courier New', monospace";
      ctx.textAlign = "left";
      ctx.fillStyle = owned ? "#dff5c8" : "#fff0ba";
      this.drawFittedText(name, textX, rowY + rowHeight * 0.34, nameWidth, ctx.font, "left");
      ctx.font = "bold " + Math.max(10, Math.round(rowHeight * 0.19)) + "px 'Lucida Console', 'Courier New', monospace";
      ctx.fillStyle = "#c9b59a";
      this.drawFittedText(strengthLabel, textX, rowY + rowHeight * 0.68, strengthWidth, ctx.font, "left");

      ctx.font = "900 " + Math.max(11, Math.round(rowHeight * 0.22)) + "px 'Lucida Console', 'Courier New', monospace";
      ctx.textAlign = "right";
      ctx.fillStyle = owned ? "#9bd27d" : (next ? "#ffd56d" : "#8e837a");
      this.drawFittedText(label, rowX + rowWidth - 18 * menuScale, rowY + rowHeight / 2, labelWidth, ctx.font, "right");

      unlockTarget = (state.pickaxeUnlockEffectLevel || 0) - 1;

      if (i === unlockTarget && state.pickaxeUnlockEffectTimer > 0) {
        this.drawBlacksmithUnlockParticles(rowX + rowWidth / 2, rowY + rowHeight / 2, rowWidth, rowHeight, state, fade);
      }
    }

    if (state.blacksmithMessageTimer > 0 && state.blacksmithMessageText) {
      ctx.font = "900 13px 'Lucida Console', 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff0ba";
      ctx.fillText(state.blacksmithMessageText, x + width / 2, y + height - 13);
    }

    ctx.restore();
  };

  Renderer.prototype.drawFittedText = function (text, x, y, maxWidth, font, align) {
    var ctx = this.ctx;
    var sizeMatch;
    var size;
    var nextFont;
    var fitted = text;

    ctx.font = font;
    ctx.textAlign = align || "left";

    if (ctx.measureText(text).width <= maxWidth) {
      ctx.fillText(text, x, y);
      return;
    }

    sizeMatch = /(\d+)px/.exec(font);
    size = sizeMatch ? Number(sizeMatch[1]) : 12;

    while (size > 8 && ctx.measureText(text).width > maxWidth) {
      size -= 1;
      nextFont = font.replace(/\d+px/, size + "px");
      ctx.font = nextFont;
    }

    while (fitted.length > 1 && ctx.measureText(fitted).width > maxWidth) {
      fitted = fitted.slice(0, -2) + ".";
    }

    ctx.fillText(fitted, x, y);
  };

  Renderer.prototype.drawPickaxeIcon = function (x, y, size, color) {
    var ctx = this.ctx;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.72);
    ctx.fillStyle = "#5a3828";
    ctx.fillRect(-size * 0.08, -size * 0.04, size * 0.16, size * 0.9);
    ctx.fillStyle = color;
    ctx.fillRect(-size * 0.62, -size * 0.42, size * 1.24, size * 0.18);
    ctx.fillRect(-size * 0.62, -size * 0.42, size * 0.2, size * 0.42);
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(-size * 0.52, -size * 0.39, size * 0.88, size * 0.04);
    ctx.restore();
  };

  Renderer.prototype.drawBlacksmithMenuBackground = function (x, y, width, height) {
    var ctx = this.ctx;
    var image = this.blacksmithMenuBackgroundSprite;
    var bounds = this.blacksmithMenuBackgroundSpriteBounds;
    var scale;
    var sourceWidth;
    var sourceHeight;
    var sourceX;
    var sourceY;

    if (!image || !bounds || !bounds.width || !bounds.height) {
      ctx.fillStyle = "rgba(45, 30, 22, 0.96)";
      ctx.fillRect(x, y, width, height);
      return;
    }

    scale = Math.max(width / bounds.width, height / bounds.height);
    sourceWidth = width / scale;
    sourceHeight = height / scale;
    sourceX = bounds.x + (bounds.width - sourceWidth) / 2;
    sourceY = bounds.y + (bounds.height - sourceHeight) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      x,
      y,
      width,
      height
    );
    ctx.fillStyle = "rgba(33, 22, 17, 0.34)";
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  };

  Renderer.prototype.drawPickaxeQuestionMark = function (x, y, size) {
    var ctx = this.ctx;
    var radius = Math.max(12, size * 0.52);

    ctx.save();
    ctx.fillStyle = "rgba(14, 12, 11, 0.74)";
    ctx.fillRect(Math.round(x - radius), Math.round(y - radius), Math.round(radius * 2), Math.round(radius * 2));
    ctx.strokeStyle = "rgba(255, 213, 109, 0.72)";
    ctx.lineWidth = Math.max(1, Math.round(size * 0.06));
    ctx.strokeRect(Math.round(x - radius) + 0.5, Math.round(y - radius) + 0.5, Math.round(radius * 2) - 1, Math.round(radius * 2) - 1);
    ctx.font = "900 " + Math.max(18, Math.round(size * 0.8)) + "px 'Lucida Console', 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffd56d";
    ctx.fillText("?", x, y + size * 0.02);
    ctx.restore();
  };

  Renderer.prototype.drawPickaxeUpgradeIcon = function (index, x, y, size, color) {
    var ctx = this.ctx;
    var image = this.pickaxeUpgradeSprites && this.pickaxeUpgradeSprites[index];
    var bounds = this.pickaxeUpgradeSpriteBounds && this.pickaxeUpgradeSpriteBounds[index];
    var drawWidth;
    var drawHeight;
    var scale;

    if (!image || !bounds || !bounds.width || !bounds.height) {
      this.drawPickaxeIcon(x, y, size, color);
      return;
    }

    scale = Math.min(size / bounds.width, size / bounds.height);
    drawWidth = bounds.width * scale;
    drawHeight = bounds.height * scale;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      image,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      Math.round(x - drawWidth / 2),
      Math.round(y - drawHeight / 2),
      Math.round(drawWidth),
      Math.round(drawHeight)
    );
    ctx.restore();
  };

  Renderer.prototype.drawBlacksmithUnlockParticles = function (x, y, width, height, state, fade) {
    var ctx = this.ctx;
    var duration = CONFIG.blacksmithUnlockEffectSeconds || 0.9;
    var timer = Math.max(0, state.pickaxeUnlockEffectTimer || 0);
    var progress = Math.max(0, Math.min(1, 1 - timer / duration));
    var seed = state.pickaxeUnlockEffectSeed || 1;
    var alpha = fade * Math.sin(progress * Math.PI);
    var ring = 0.55 + progress * 0.62;
    var i;
    var count = 24;
    var angle;
    var jitter;
    var radiusX;
    var radiusY;
    var px;
    var py;
    var size;
    var colors = ["#fff1a8", "#ffd56d", "#ffffff", "#ff9f54"];

    ctx.save();
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.strokeStyle = "rgba(255, 213, 109, 0.86)";
    ctx.lineWidth = Math.max(2, Math.round(height * 0.04));
    ctx.strokeRect(
      Math.round(x - width * 0.5 + 3),
      Math.round(y - height * 0.5 + 3),
      Math.round(width - 6),
      Math.round(height - 6)
    );

    radiusX = width * 0.42 * ring;
    radiusY = height * 0.46 * ring;

    for (i = 0; i < count; i += 1) {
      jitter = Math.sin(seed * 0.37 + i * 12.989) * 0.5 + 0.5;
      angle = i / count * Math.PI * 2 + progress * (1.4 + jitter);
      px = x + Math.cos(angle) * radiusX * (0.76 + jitter * 0.34);
      py = y + Math.sin(angle) * radiusY * (0.78 + (1 - jitter) * 0.3);
      size = Math.max(2, height * (0.045 + jitter * 0.035)) * (1 - progress * 0.28);

      ctx.globalAlpha = Math.min(1, alpha * (0.62 + jitter * 0.38));
      ctx.fillStyle = colors[i % colors.length];
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle + progress * Math.PI);
      ctx.fillRect(Math.round(-size / 2), Math.round(-size / 2), Math.ceil(size), Math.ceil(size));
      ctx.restore();
    }

    ctx.restore();
  };

  Renderer.prototype.getAuntSandersMenuRect = function (menuY, menuHeight) {
    var bounds = this.auntSandersSpriteBounds;
    var width;
    var height;

    if (!bounds || !bounds.width || !bounds.height) {
      return null;
    }

    width = Math.max(168, Math.min(413, this.width * 0.521));
    height = width * (bounds.height / bounds.width);

    if (height > this.height - 24) {
      height = this.height - 24;
      width = height * (bounds.width / bounds.height);
    }

    return {
      x: 0,
      y: Math.round(Math.min(this.height - height - 8, menuY + menuHeight - height + 8)),
      width: width,
      height: height
    };
  };

  Renderer.prototype.drawAuntSandersSprite = function (x, y, width, height) {
    var ctx = this.ctx;
    var image = this.auntSandersSprite;
    var bounds = this.auntSandersSpriteBounds;

    if (!image || !bounds || !bounds.width || !bounds.height) {
      return;
    }

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
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
    ctx.restore();
  };

  Renderer.prototype.drawBlacksmithIntro = function (state) {
    var ctx = this.ctx;
    var progress = state.blacksmithIntroProgress || 0;
    var bounds = this.auntSandersSpriteBounds;
    var boardBounds = this.textboardSpriteBounds;
    var eased;
    var fade;
    var portraitWidth;
    var portraitHeight;
    var portraitX;
    var portraitY;
    var boxWidth;
    var boxHeight;
    var boxX;
    var boxY;
    var text;
    var charCount;
    var typedText;
    var fontSize;
    var nameFontSize;
    var lines;
    var lineHeight;
    var lineY;
    var i;

    if (progress <= 0) {
      return;
    }

    eased = 1 - Math.pow(1 - progress, 3);
    fade = progress * progress * (3 - 2 * progress);

    ctx.save();
    ctx.globalAlpha = fade;
    ctx.fillStyle = "rgba(0, 0, 0, " + (0.28 * fade) + ")";
    ctx.fillRect(0, 0, this.width, this.height);

    portraitWidth = Math.min(527, Math.max(228, this.width * 0.487));
    portraitHeight = bounds ? portraitWidth * (bounds.height / bounds.width) : 0;

    if (portraitHeight > this.height * 0.76 && bounds) {
      portraitHeight = this.height * 0.76;
      portraitWidth = portraitHeight * (bounds.width / bounds.height);
    }

    portraitX = Math.round(20 - (1 - eased) * (portraitWidth + 40));
    portraitY = Math.round(this.height - portraitHeight - 36 + Math.sin(eased * Math.PI) * -8);

    if (bounds) {
      ctx.translate(portraitX + portraitWidth / 2, portraitY + portraitHeight);
      ctx.scale(0.86 + eased * 0.14, 0.86 + eased * 0.14);
      ctx.translate(-portraitX - portraitWidth / 2, -portraitY - portraitHeight);
      this.drawAuntSandersSprite(portraitX, portraitY, portraitWidth, portraitHeight);
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.globalAlpha = fade;
    }

    boxWidth = Math.min(680, this.width - 36);
    boxHeight = boardBounds ? boxWidth * (boardBounds.height / boardBounds.width) : 150;

    if (boxHeight > this.height * 0.42) {
      boxHeight = this.height * 0.42;
      boxWidth = boardBounds ? boxHeight * (boardBounds.width / boardBounds.height) : boxWidth;
    }

    boxX = Math.round((this.width - boxWidth) / 2);
    boxY = Math.round((this.height - boxHeight) / 2);

    if (boardBounds && this.textboardSprite) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        this.textboardSprite,
        boardBounds.x,
        boardBounds.y,
        boardBounds.width,
        boardBounds.height,
        boxX,
        boxY,
        Math.round(boxWidth),
        Math.round(boxHeight)
      );
    } else {
      ctx.fillStyle = "#ead1a3";
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      ctx.strokeStyle = "#7a3f1e";
      ctx.lineWidth = 3;
      ctx.strokeRect(boxX + 1.5, boxY + 1.5, boxWidth - 3, boxHeight - 3);
    }

    text = state.getBlacksmithIntroText ? state.getBlacksmithIntroText() : "";
    charCount = Math.min(text.length, Math.floor(state.blacksmithIntroTextTimer * CONFIG.tabbyDialogCharsPerSecond));
    typedText = text.slice(0, charCount);

    if (state.blacksmithIntroOpen && charCount < text.length && Math.floor(state.time * 8) % 2 === 0) {
      typedText += "_";
    }

    nameFontSize = Math.max(12, Math.round(boxWidth / 42));
    ctx.font = "bold " + nameFontSize + "px Georgia, 'Times New Roman', serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#7a3f1e";
    ctx.fillText("Aunt Sanders", boxX + boxWidth * 0.16, boxY + boxHeight * 0.28);

    fontSize = Math.max(15, Math.round(boxWidth / 35));
    ctx.font = "bold " + fontSize + "px 'Lucida Console', 'Courier New', monospace";
    ctx.fillStyle = "#3c2413";
    lines = this.wrapDialogText(ctx, typedText, boxWidth * 0.68);
    lineHeight = fontSize * 1.28;
    lineY = boxY + boxHeight * 0.56 - ((lines.length - 1) * lineHeight) / 2;

    for (i = 0; i < lines.length; i += 1) {
      ctx.fillText(lines[i], boxX + boxWidth * 0.16, lineY + i * lineHeight);
    }

    ctx.restore();
  };

  Renderer.prototype.isBlacksmithUpgradeHit = function (x, y) {
    var rects = this.blacksmithUpgradeHitRects || [];
    var i;
    var rect;

    for (i = 0; i < rects.length; i += 1) {
      rect = rects[i];

      if (x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height) {
        return i;
      }
    }

    return null;
  };

  Renderer.prototype.drawLuckBackground = function (alpha) {
    var ctx = this.ctx;
    var image = this.luckBackgroundSprite;
    var bounds = this.luckBackgroundSpriteBounds;
    var scale;
    var width;
    var height;
    var x;
    var y;

    if (!image || !bounds || !bounds.width || !bounds.height) {
      return;
    }

    scale = Math.max(this.width / bounds.width, this.height / bounds.height);
    width = bounds.width * scale;
    height = bounds.height * scale;
    x = (this.width - width) / 2;
    y = (this.height - height) / 2;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(
      image,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      Math.round(x),
      Math.round(y),
      Math.ceil(width),
      Math.ceil(height)
    );
    ctx.restore();
  };

  Renderer.prototype.getLuckUIDrawRect = function () {
    var bounds = this.luckUISpriteBounds;
    var maxWidth;
    var maxHeight;
    var width;
    var height;

    if (!bounds) {
      return null;
    }

    maxWidth = this.width - 36;
    maxHeight = this.height - 36;
    width = Math.min(bounds.width, maxWidth);
    height = width * (bounds.height / bounds.width);

    if (height > maxHeight) {
      height = maxHeight;
      width = height * (bounds.width / bounds.height);
    }

    return {
      x: Math.round((this.width - width) / 2),
      y: Math.round((this.height - height) / 2),
      width: width,
      height: height
    };
  };

  Renderer.prototype.isLuckUpgradeButtonHit = function (x, y) {
    var rect = this.getLuckUIDrawRect();
    var button;

    if (!rect) {
      return false;
    }

    button = {
      x: rect.x + rect.width * 0.281,
      y: rect.y + rect.height * 0.758,
      width: rect.width * 0.493,
      height: rect.height * 0.095
    };

    return x >= button.x &&
      x <= button.x + button.width &&
      y >= button.y &&
      y <= button.y + button.height;
  };

  Renderer.prototype.drawUpgradeMenuBackground = function (x, y, width, height) {
    var ctx = this.ctx;
    var image = this.upgradeMenuBackgroundSprite;
    var bounds = this.upgradeMenuBackgroundSpriteBounds;

    if (!image || !bounds || !bounds.width || !bounds.height) {
      return;
    }

    ctx.drawImage(
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
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(x, y, width, height);
  };

  Renderer.prototype.drawUpgradeCard = function (image, bounds, x, y, width, height, state, type) {
    var ctx = this.ctx;
    var scale = type === "paw" ? this.getPawUpgradeCardScale(state.pawLevel) : 1;
    var drawWidth = width * scale;
    var drawHeight = height * scale;
    var drawX = x + (width - drawWidth) / 2;
    var drawY = y + (height - drawHeight) / 2;

    if (type === "paw" && state.pawLevel === 3) {
      drawY -= height * 0.035;
    }

    if (type === "stamina") {
      drawY += height * 0.03;
    }

    ctx.drawImage(
      image,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      Math.round(drawX),
      Math.round(drawY),
      Math.round(drawWidth),
      Math.round(drawHeight)
    );
  };

  Renderer.prototype.getPawUpgradeCardScale = function (pawLevel) {
    if (pawLevel >= 5) {
      return CONFIG.diggaUpgradeUISpriteScale || CONFIG.maxUpgradeUISpriteScale || 0.8;
    }

    if (pawLevel >= 4) {
      return CONFIG.maxUpgradeUISpriteScale || 0.8;
    }

    if (pawLevel >= 3) {
      return CONFIG.toughUpgradeUISpriteScale || 0.8;
    }

    return 1;
  };

  Renderer.prototype.getUpgradeUIImage = function (pawLevel) {
    if (pawLevel >= 5) {
      return this.diggaUpgradeUISprite;
    }

    if (pawLevel >= 4) {
      return this.maxUpgradeUISprite;
    }

    if (pawLevel >= 3) {
      return this.toughUpgradeUISprite;
    }

    if (pawLevel >= 2) {
      return this.upgradedUpgradeUISprite;
    }

    return this.upgradeUISprite;
  };

  Renderer.prototype.getUpgradeUIBounds = function (pawLevel) {
    if (pawLevel >= 5) {
      return this.diggaUpgradeUISpriteBounds;
    }

    if (pawLevel >= 4) {
      return this.maxUpgradeUISpriteBounds;
    }

    if (pawLevel >= 3) {
      return this.toughUpgradeUISpriteBounds;
    }

    if (pawLevel >= 2) {
      return this.upgradedUpgradeUISpriteBounds;
    }

    return this.upgradeUISpriteBounds;
  };

  Renderer.prototype.getStorageUpgradeUIImage = function (storageLevel) {
    if (storageLevel >= 6) {
      return this.treasureChestUpgradeUISprite;
    }

    if (storageLevel >= 5) {
      return this.duffelUpgradeUISprite;
    }

    if (storageLevel >= 4) {
      return this.crateUpgradeUISprite;
    }

    if (storageLevel >= 3) {
      return this.backpackUpgradeUISprite;
    }

    if (storageLevel >= 2) {
      return this.bucketUpgradeUISprite;
    }

    return this.fannyUpgradeUISprite;
  };

  Renderer.prototype.getStorageUpgradeUIBounds = function (storageLevel) {
    if (storageLevel >= 6) {
      return this.treasureChestUpgradeUISpriteBounds;
    }

    if (storageLevel >= 5) {
      return this.duffelUpgradeUISpriteBounds;
    }

    if (storageLevel >= 4) {
      return this.crateUpgradeUISpriteBounds;
    }

    if (storageLevel >= 3) {
      return this.backpackUpgradeUISpriteBounds;
    }

    if (storageLevel >= 2) {
      return this.bucketUpgradeUISpriteBounds;
    }

    return this.fannyUpgradeUISpriteBounds;
  };

  Renderer.prototype.getStaminaUpgradeUIImage = function (staminaLevel) {
    var sprites = this.staminaUpgradeUISprites || [];
    var bounds = this.staminaUpgradeUISpriteBounds || [];
    var index = Math.max(0, Math.min(sprites.length - 1, (staminaLevel || 1) - 1));

    while (index >= 0) {
      if (sprites[index] && bounds[index]) {
        return sprites[index];
      }

      index -= 1;
    }

    return sprites[0];
  };

  Renderer.prototype.getStaminaUpgradeUIBounds = function (staminaLevel) {
    var bounds = this.staminaUpgradeUISpriteBounds || [];
    var index = Math.max(0, Math.min(bounds.length - 1, (staminaLevel || 1) - 1));

    while (index >= 0) {
      if (bounds[index]) {
        return bounds[index];
      }

      index -= 1;
    }

    return null;
  };

  Renderer.prototype.drawCurrencyUI = function (state) {
    var ctx = this.ctx;
    var image = this.currencyUISprite;
    var bounds = this.currencyUISpriteBounds;
    var depth = state.cat.depth(state.world);
    var targetAlpha = depth >= 2 ? 0 : 1;
    var follow = Math.min(1, state.dt * 8);
    var depthSlotSize;
    var width;
    var height;
    var x;
    var y;

    if (!bounds) {
      return;
    }

    this.currencyUIAlpha += (targetAlpha - this.currencyUIAlpha) * follow;

    if (this.currencyUIAlpha <= 0.01) {
      return;
    }

    depthSlotSize = Math.max(92, Math.min(138, this.width * 0.11));
    width = depthSlotSize * 1.32;
    height = width * (bounds.height / bounds.width);
    x = Math.round(this.width - 14 - width);
    y = 10;

    ctx.save();
    ctx.globalAlpha = this.currencyUIAlpha;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      image,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      x,
      y,
      Math.round(width),
      Math.round(height)
    );
    this.drawCurrencyText(state, x, y, width, height);
    ctx.restore();
  };

  Renderer.prototype.drawCurrencyText = function (state, x, y, width, height) {
    var ctx = this.ctx;
    var fontSize = Math.max(12, Math.round(height * 0.217));
    var textX = x + width * 0.39;
    var textY = y + height * 0.61;
    var clipX = x + width * 0.35;
    var clipY = y + height * 0.36;
    var clipWidth = width * 0.5;
    var clipHeight = height * 0.44;

    this.updateCurrencyRoll(state.coins || 0, state.dt || 0);
    ctx.font = "900 " + fontSize + "px 'Lucida Console', 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#9a9a9a";
    ctx.save();
    ctx.beginPath();
    ctx.rect(clipX, clipY, clipWidth, clipHeight);
    ctx.clip();
    this.drawRollingCurrencyNumber(textX, textY, fontSize);
    ctx.restore();
  };

  Renderer.prototype.updateCurrencyRoll = function (targetCoins, dt) {
    var current;
    var distance;

    targetCoins = Math.max(0, Math.floor(targetCoins || 0));

    if (targetCoins < this.currencyRollTo) {
      this.currencyShownCoins = targetCoins;
      this.currencyRollFrom = targetCoins;
      this.currencyRollTo = targetCoins;
      this.currencyRollElapsed = 0;
      this.currencyRollDuration = 0;
      return;
    }

    if (targetCoins > this.currencyRollTo) {
      current = this.getCurrencyAnimatedValue();
      distance = targetCoins - current;
      this.currencyRollFrom = current;
      this.currencyRollTo = targetCoins;
      this.currencyRollElapsed = 0;
      this.currencyRollDuration = Math.min(1.1, Math.max(0.34, 0.28 + distance * 0.045));
    }

    if (this.currencyRollTo > this.currencyRollFrom) {
      this.currencyRollElapsed = Math.min(
        this.currencyRollDuration,
        this.currencyRollElapsed + dt
      );
      this.currencyShownCoins = this.getCurrencyAnimatedValue();
    } else {
      this.currencyShownCoins = this.currencyRollTo;
    }
  };

  Renderer.prototype.getCurrencyAnimatedValue = function () {
    var progress;
    var eased;

    if (this.currencyRollDuration <= 0 || this.currencyRollTo <= this.currencyRollFrom) {
      return this.currencyRollTo;
    }

    progress = Math.max(0, Math.min(1, this.currencyRollElapsed / this.currencyRollDuration));
    eased = 1 - Math.pow(1 - progress, 3);
    return this.currencyRollFrom + (this.currencyRollTo - this.currencyRollFrom) * eased;
  };

  Renderer.prototype.drawRollingCurrencyNumber = function (x, y, fontSize) {
    var ctx = this.ctx;
    var rolling = this.currencyRollTo > this.currencyRollFrom &&
      this.currencyRollElapsed < this.currencyRollDuration;
    var current = Math.floor(this.currencyShownCoins);
    var next = Math.min(this.currencyRollTo, current + 1);
    var fraction = rolling ? this.currencyShownCoins - current : 0;
    var lift = Math.round(fraction * fontSize * 1.08);

    ctx.fillText(String(current), x, y - lift);

    if (rolling && next !== current) {
      ctx.fillText(String(next), x, y + Math.round(fontSize * 1.08) - lift);
    }
  };

  Renderer.prototype.drawDialogBoard = function (state) {
    var ctx = this.ctx;
    var bounds = this.textboardSpriteBounds;
    var maxWidth = Math.min(this.width - 36, 780);
    var width;
    var height;
    var x;
    var y;
    var progress = state.tabbyDialogProgress || 0;
    var eased;
    var scaleX;
    var scaleY;
    var pivotX;
    var pivotY;
    var text;
    var charCount;
    var typedText;
    var fontSize;
    var nameFontSize;
    var lines;
    var lineHeight;
    var lineY;
    var i;

    if (progress <= 0 || !bounds) {
      return;
    }

    width = maxWidth;
    height = width * (bounds.height / bounds.width);

    if (height > this.height * 0.46) {
      height = this.height * 0.46;
      width = height * (bounds.width / bounds.height);
    }

    x = Math.round((this.width - width) / 2);
    y = Math.round(this.height - height - 22);
    eased = 1 - Math.pow(1 - progress, 3);
    scaleX = 0.76 + eased * 0.24;
    scaleY = 0.18 + eased * 0.82;
    pivotX = x + width / 2;
    pivotY = y + height * 0.84;
    text = state.getTabbyDialogText ? state.getTabbyDialogText() : (CONFIG.tabbyDialogText || "");
    charCount = Math.min(text.length, Math.floor(state.tabbyDialogTextTimer * CONFIG.tabbyDialogCharsPerSecond));
    typedText = text.slice(0, charCount);

    if (state.tabbyDialogOpen && charCount < text.length && Math.floor(state.time * 8) % 2 === 0) {
      typedText += "_";
    }

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = Math.min(1, progress * 1.35);
    ctx.translate(pivotX, pivotY);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-pivotX, -pivotY);
    ctx.drawImage(
      this.textboardSprite,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      x,
      y,
      Math.round(width),
      Math.round(height)
    );

    nameFontSize = Math.max(12, Math.round(width / 42));
    ctx.font = "bold " + nameFontSize + "px Georgia, 'Times New Roman', serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#7a3f1e";
    ctx.shadowColor = "rgba(255, 239, 198, 0.7)";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText("Tabby", x + width * 0.16, y + height * 0.28);

    if (charCount > 0 || typedText.length > 0) {
      fontSize = Math.max(16, Math.round(width / 34));
      ctx.font = "bold " + fontSize + "px 'Lucida Console', 'Courier New', monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#3c2413";
      ctx.shadowColor = "rgba(255, 239, 198, 0.65)";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      lines = this.wrapDialogText(ctx, typedText, width * 0.68);
      lineHeight = fontSize * 1.32;
      lineY = y + height * 0.54 - ((lines.length - 1) * lineHeight) / 2;

      for (i = 0; i < lines.length; i += 1) {
        ctx.fillText(lines[i], x + width * 0.16, lineY + i * lineHeight);
      }
    }

    ctx.restore();
  };

  Renderer.prototype.wrapDialogText = function (ctx, text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var line = "";
    var i;
    var testLine;

    for (i = 0; i < words.length; i += 1) {
      testLine = line ? line + " " + words[i] : words[i];

      if (!line || ctx.measureText(testLine).width <= maxWidth) {
        line = testLine;
      } else {
        lines.push(line);
        line = words[i];
      }
    }

    if (line || !lines.length) {
      lines.push(line);
    }

    return lines;
  };

  Renderer.prototype.drawDiscoveryPopup = function (state) {
    var timer = state.discoveryPopupTimer || 0;
    var duration = CONFIG.oreDiscoveryPopupSeconds || 4.4;
    var ctx = this.ctx;
    var progress;
    var elapsed;
    var alpha;
    var enter;
    var width;
    var height;
    var x;
    var y;
    var iconSize;
    var title;
    var subtitle;
    var type;
    var sprite;
    var sparkle;
    var i;

    if (timer <= 0) {
      return;
    }

    type = state.discoveryPopupType;
    sprite = this.pebbliteSprite;

    if (type === "coalclump") {
      sprite = this.coalclumpSprite;
    } else if (type === "copperpaw") {
      sprite = this.copperpawSprite;
    }
    elapsed = duration - timer;
    progress = 1 - timer / duration;
    alpha = Math.min(1, timer / 0.35, elapsed / 0.18);
    enter = 1 - Math.pow(1 - Math.min(1, elapsed / 0.22), 3);
    width = Math.min(360, this.width - 28);
    height = 74;
    x = Math.round((this.width - width) / 2);
    y = Math.round(28 - (1 - enter) * 18);
    iconSize = 42;
    title = "PEBBLITE DISCOVERED";
    subtitle = "+3 coins each";

    if (type === "coalclump") {
      title = "COALCLUMP DISCOVERED";
      subtitle = "+5 coins each";
    } else if (type === "copperpaw") {
      title = "COPPERPAW DISCOVERED";
      subtitle = "+10 coins each";
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(18, 20, 24, 0.9)";
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "#d7f1ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprite, x + 18, y + 16, iconSize, iconSize);

    for (i = 0; i < 7; i += 1) {
      sparkle = (state.time * 2.8 + i * 0.19) % 1;
      ctx.globalAlpha = alpha * (1 - sparkle);
      ctx.fillStyle = i % 2 ? "#ffffff" : "#a9e6ff";
      ctx.fillRect(
        Math.round(x + 14 + i * 47 + Math.sin(state.time * 5 + i) * 7),
        Math.round(y + 8 + sparkle * 52),
        3,
        3
      );
    }

    ctx.globalAlpha = alpha;
    ctx.font = "900 16px 'Lucida Console', 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#f4f1e8";
    ctx.fillText(title, x + 74, y + 17);
    ctx.font = "900 11px 'Lucida Console', 'Courier New', monospace";
    ctx.fillStyle = "#b9d5e4";
    ctx.fillText(subtitle, x + 74, y + 43);
    ctx.restore();
  };

  Renderer.prototype.drawMainMenu = function (state) {
    var ctx = this.ctx;
    var image = this.mainMenuSprite;
    var bounds = this.mainMenuSpriteBounds;
    var progress;
    var holdWidth;
    var holdHeight;
    var holdX;
    var holdY;
    var imageRatio;
    var canvasRatio;
    var sourceWidth;
    var sourceHeight;
    var sourceX;
    var sourceY;
    var drawWidth;
    var drawHeight;
    var drawX;
    var drawY;

    if (!state || state.menuState === "done" || state.menuState === "fadein") {
      return;
    }

    ctx.save();
    ctx.fillStyle = "#050708";
    ctx.fillRect(0, 0, this.width, this.height);

    if (image && bounds) {
      imageRatio = bounds.width / bounds.height;
      canvasRatio = this.width / Math.max(1, this.height);
      sourceWidth = bounds.width;
      sourceHeight = bounds.height;
      sourceX = 0;
      sourceY = 0;
      drawWidth = this.width * (CONFIG.mainMenuImageScale || 0.88);
      drawHeight = drawWidth / imageRatio;

      if (drawHeight > this.height * (CONFIG.mainMenuImageScale || 0.88)) {
        drawHeight = this.height * (CONFIG.mainMenuImageScale || 0.88);
        drawWidth = drawHeight * imageRatio;
      }

      drawX = Math.round((this.width - drawWidth) / 2);
      drawY = Math.round((this.height - drawHeight) / 2);
      ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, drawX, drawY, drawWidth, drawHeight);
    }

    progress = state.getMainMenuHoldProgress ? state.getMainMenuHoldProgress() : 0;
    holdWidth = Math.min(280, this.width * 0.48);
    holdHeight = 10;
    holdX = Math.round((this.width - holdWidth) / 2);
    holdY = Math.round(this.height * 0.82);

    ctx.fillStyle = "rgba(5, 7, 8, 0.74)";
    ctx.fillRect(holdX, holdY, holdWidth, holdHeight);
    ctx.strokeStyle = "rgba(255, 232, 169, 0.85)";
    ctx.lineWidth = 2;
    ctx.strokeRect(holdX + 0.5, holdY + 0.5, holdWidth - 1, holdHeight - 1);
    ctx.fillStyle = "#ffe28d";
    ctx.fillRect(holdX + 3, holdY + 3, Math.max(0, holdWidth - 6) * progress, holdHeight - 6);
    ctx.restore();
  };
})();
