(function () {
  "use strict";

  window.PawsBelow = window.PawsBelow || {};

  var CONFIG = window.PawsBelow.CONFIG;
  var Random = window.PawsBelow.Random;

  function Effects() {
    this.particles = [];
    this.particlePool = [];
    this.brokenBlocks = [];
    this.shake = 0;
  }

  Effects.prototype.acquireParticle = function () {
    return this.particlePool.pop() || {};
  };

  Effects.prototype.releaseParticle = function (particle) {
    if (this.particlePool.length < 160) {
      this.particlePool.push(particle);
    }
  };

  Effects.prototype.addParticle = function (settings) {
    var particle = this.acquireParticle();
    var key;

    for (key in settings) {
      if (Object.prototype.hasOwnProperty.call(settings, key)) {
        particle[key] = settings[key];
      }
    }

    this.particles.push(particle);
  };

  Effects.prototype.addDigBurst = function (tileX, tileY, color, dx, dy, amountScale) {
    var options = typeof amountScale === "object" && amountScale ? amountScale : {};
    var scale = typeof amountScale === "number" ? amountScale : (typeof options.scale === "number" ? options.scale : 1);
    var chunkCount = Math.max(1, Math.round(6 * scale));
    var dustCount = options.skipDust ? 0 : Math.max(1, Math.round(8 * scale));
    var i;
    var angle;
    var speed;
    var roll;
    var tile = CONFIG.tileSize;
    var sprayX = dx || 0;
    var sprayY = dy || 0;
    var length = Math.sqrt(sprayX * sprayX + sprayY * sprayY) || 1;
    var tangentX;
    var tangentY;
    var spread;
    var originX;
    var originY;

    sprayX = -sprayX / length;
    sprayY = -sprayY / length;
    tangentX = -sprayY;
    tangentY = sprayX;
    originX = tileX * tile + tile / 2 + sprayX * tile * 0.32;
    originY = tileY * tile + tile / 2 + sprayY * tile * 0.32;

    for (i = 0; i < chunkCount; i += 1) {
      roll = Random.value2D(tileX * 19 + i, tileY * 23 - i, CONFIG.seed + 303);
      spread = (roll - 0.5) * 1.15;
      angle = Math.atan2(sprayY + tangentY * spread, sprayX + tangentX * spread);
      speed = 38 + roll * 58;

      this.addParticle({
        type: "chunk",
        x: originX + tangentX * (roll - 0.5) * tile * 0.52,
        y: originY + tangentY * (roll - 0.5) * tile * 0.52,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 8,
        gravity: 190,
        drag: 0.35,
        life: 0.24 + roll * 0.16,
        age: 0,
        size: 1.8 + roll * 2.4,
        endSize: 1,
        alpha: 1,
        color: color
      });
    }

    for (i = 0; i < dustCount; i += 1) {
      roll = Random.value2D(tileX * 31 - i, tileY * 17 + i, CONFIG.seed + 337);
      spread = (roll - 0.5) * 1.9;
      angle = Math.atan2(sprayY + tangentY * spread, sprayX + tangentX * spread);
      speed = 12 + roll * 36;

      this.addParticle({
        type: "dust",
        x: originX + tangentX * (roll - 0.5) * tile * 0.72,
        y: originY + tangentY * (roll - 0.5) * tile * 0.72,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        gravity: 24,
        drag: 4.2,
        life: 0.28 + roll * 0.26,
        age: 0,
        size: 2.4 + roll * 2.2,
        endSize: 6.5 + roll * 4.5,
        alpha: 0.391,
        color: CONFIG.colors.dirtLight
      });
    }

    this.shake = Math.min(1, this.shake + 0.06);
  };

  Effects.prototype.addBlockBreak = function (tileX, tileY, color, dx, dy, type, options) {
    var scaleMultiplier = options && typeof options.scaleMultiplier === "number" ? options.scaleMultiplier : 1;
    var scale = (type === "dirt" ? 0.5 : 1) * 0.8 * scaleMultiplier;
    var burstOptions = {
      scale: scale,
      skipDust: !!(options && options.skipDust)
    };

    this.brokenBlocks.push({
      x: tileX,
      y: tileY,
      type: type || "dirt",
      age: 0,
      life: CONFIG.blockBreakShrinkMs / 1000
    });

    this.addDigBurst(tileX, tileY, color || CONFIG.colors.dirt, dx, dy, burstOptions);
    this.addOreBreakBurst(tileX, tileY, type, scale);

    this.shake = Math.min(1, this.shake + 0.1);
  };

  Effects.prototype.addOreBreakBurst = function (tileX, tileY, type, amountScale) {
    var colorsByType = {
      coalclump: ["#050505", "#171717", "#2a2a2a"],
      copperpaw: ["#b87333", "#cd7f32", "#8c5227"],
      dirt: [CONFIG.colors.dirt, CONFIG.colors.dirtLight, "#8a5a34"],
      pebblite: ["#8e9298", "#6f747c", "#b5bac0"]
    };
    var colors = colorsByType[type];
    var tile;
    var originX;
    var originY;
    var i;
    var count = Math.max(1, Math.round(18 * (typeof amountScale === "number" ? amountScale : 1)));
    var roll;
    var angle;
    var speed;

    if (!colors) {
      return;
    }

    tile = CONFIG.tileSize;
    originX = tileX * tile + tile / 2;
    originY = tileY * tile + tile / 2;

    for (i = 0; i < count; i += 1) {
      roll = Random.value2D(tileX * 67 + i, tileY * 71 - i, CONFIG.seed + 2141);
      angle = roll * Math.PI * 2;
      speed = 34 + Random.value2D(tileX * 73 - i, tileY * 79 + i, CONFIG.seed + 2147) * 86;

      this.addParticle({
        type: "ore-spark",
        x: originX + (Random.value2D(tileX * 83 + i, tileY * 89 - i, CONFIG.seed + 2153) - 0.5) * tile * 0.34,
        y: originY + (Random.value2D(tileX * 97 - i, tileY * 101 + i, CONFIG.seed + 2159) - 0.5) * tile * 0.34,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 12,
        gravity: 96,
        drag: 1.4,
        life: 0.42 + roll * 0.24,
        age: 0,
        size: 2 + roll * 2.6,
        endSize: 0.7,
        alpha: 1,
        color: colors[i % colors.length]
      });
    }
  };

  Effects.prototype.addGrassBreak = function (tileX, tileY) {
    var tile = CONFIG.tileSize;
    var originX = tileX * tile + tile / 2;
    var originY = tileY * tile + 4;
    var colors = ["#8ed061", "#4c934f", "#2f6f3c", "#b4e86f"];
    var i;
    var roll;
    var angle;
    var speed;

    for (i = 0; i < 18; i += 1) {
      roll = Random.value2D(tileX * 37 + i, tileY * 41 - i, CONFIG.seed + 641);
      angle = -Math.PI * (0.15 + roll * 0.7);
      speed = 28 + roll * 76;

      this.addParticle({
        type: "chunk",
        x: originX + (roll - 0.5) * tile * 0.86,
        y: originY + Random.value2D(tileX * 43 - i, tileY * 47 + i, CONFIG.seed + 647) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 16,
        gravity: 150,
        drag: 1.1,
        life: 0.34 + roll * 0.2,
        age: 0,
        size: 1.6 + roll * 2.6,
        endSize: 0.8,
        alpha: 1,
        color: colors[i % colors.length]
      });
    }

    for (i = 0; i < 8; i += 1) {
      roll = Random.value2D(tileX * 53 + i, tileY * 59 - i, CONFIG.seed + 653);

      this.addParticle({
        type: "dust",
        x: originX + (roll - 0.5) * tile,
        y: originY + 2,
        vx: (roll - 0.5) * 34,
        vy: -18 - roll * 18,
        gravity: 26,
        drag: 4.8,
        life: 0.28 + roll * 0.22,
        age: 0,
        size: 2 + roll * 2,
        endSize: 7 + roll * 4,
        alpha: 0.42,
        color: "#8ed061"
      });
    }
  };

  Effects.prototype.addRunDust = function (cat, color) {
    var tile = CONFIG.tileSize;
    var facing = cat.facing || 1;
    var baseX = cat.getVisualX() * tile + tile / 2 - facing * tile * 0.28;
    var baseY = (cat.getVisualY() + 1) * tile - 3;
    var i;
    var roll;

    for (i = 0; i < 4; i += 1) {
      roll = Random.value2D(cat.x * 41 + i, cat.steps * 17 + i, CONFIG.seed + 519);

      this.addParticle({
        type: "run-dust",
        x: baseX + (roll - 0.5) * tile * 0.44,
        y: baseY + (roll - 0.5) * 4,
        vx: -facing * (18 + roll * 28),
        vy: -12 - roll * 14,
        gravity: 28,
        drag: 4.8,
        life: 0.26 + roll * 0.18,
        age: 0,
        size: 2.2 + roll * 1.6,
        endSize: 7.5 + roll * 3.2,
        alpha: 0.529,
        color: color || "#d8bd91"
      });
    }
  };

  Effects.prototype.addChimneySmoke = function (x, y, seed) {
    var roll = Random.value2D(seed * 13, seed * 7, CONFIG.seed + 911);
    var drift = Random.value2D(seed * 17, seed * 11, CONFIG.seed + 947) - 0.5;
    var wobble = Random.value2D(seed * 23, seed * 29, CONFIG.seed + 983) - 0.5;

    this.addParticle({
      type: "smoke",
      x: x + drift * 4,
      y: y + (roll - 0.5) * 1.5,
      vx: drift * 9 + 3,
      vy: -5 - roll * 7,
      gravity: -1.2,
      drag: 0.18,
      life: 1.55 + roll * 0.82,
      age: 0,
      size: 5 + roll * 2.6,
      endSize: 16 + roll * 9,
      alpha: 0.34,
      color: "#8c8982",
      wobble: wobble,
      seed: seed
    });
  };

  Effects.prototype.addFallingLeaf = function (x, y, seed) {
    var roll = Random.value2D(seed * 17, seed * 23, CONFIG.seed + 1321);
    var side = Random.value2D(seed * 29, seed * 31, CONFIG.seed + 1327) < 0.5 ? -1 : 1;

    this.addParticle({
      type: "leaf",
      x: x + (roll - 0.5) * CONFIG.tileSize * 2.6,
      y: y + Random.value2D(seed * 37, seed * 41, CONFIG.seed + 1331) * CONFIG.tileSize * 0.7,
      vx: side * (5 + roll * 16),
      vy: 8 + roll * 7,
      gravity: 10,
      drag: 0.28,
      life: 5.3 + roll * 1.8,
      age: 0,
      size: 3.2 + roll * 2.2,
      endSize: 2.2,
      alpha: 0.76,
      color: roll < 0.33 ? "#d8a74a" : (roll < 0.66 ? "#b96d38" : "#e0c05a"),
      wobble: 0.7 + roll * 1.3,
      seed: seed
    });
  };

  Effects.prototype.addPebbliteDiscovery = function (tileX, tileY) {
    this.addOreDiscovery(tileX, tileY, "pebblite");
  };

  Effects.prototype.addOreDiscovery = function (tileX, tileY, type) {
    var tile = CONFIG.tileSize;
    var originX = tileX * tile + tile / 2;
    var originY = tileY * tile + tile / 2;
    var i;
    var roll;
    var angle;
    var speed;
    var colors = ["#d7f1ff", "#9fb7c8", "#eefaff"];

    if (type === "coalclump") {
      colors = ["#f2f2e8", "#70747a", "#2d3034"];
    } else if (type === "copperpaw") {
      colors = ["#ffd2a6", "#c77b43", "#fff0d4"];
    }

    for (i = 0; i < 24; i += 1) {
      roll = Random.value2D(tileX * 43 + i, tileY * 47 - i, CONFIG.seed + 1889);
      angle = roll * Math.PI * 2;
      speed = 42 + Random.value2D(tileX * 53 - i, tileY * 59 + i, CONFIG.seed + 1897) * 84;

      this.addParticle({
        type: "ore-spark",
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 18,
        gravity: 72,
        drag: 1.8,
        life: 0.65 + roll * 0.28,
        age: 0,
        size: 2.2 + roll * 2.8,
        endSize: 0.8,
        alpha: 1,
        color: colors[i % colors.length]
      });
    }

    this.shake = Math.min(1, this.shake + 0.16);
  };

  Effects.prototype.update = function (dt) {
    var nextBlocks = [];
    var i;
    var p;
    var block;

    for (i = this.particles.length - 1; i >= 0; i -= 1) {
      p = this.particles[i];
      p.age += dt;
      p.vy += (p.gravity || 150) * dt;
      p.vx *= Math.max(0, 1 - (p.drag || 0) * dt);
      p.vy *= Math.max(0, 1 - (p.drag || 0) * dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.age >= p.life) {
        this.particles.splice(i, 1);
        this.releaseParticle(p);
      }
    }

    for (i = 0; i < this.brokenBlocks.length; i += 1) {
      block = this.brokenBlocks[i];
      block.age += dt;

      if (block.age < block.life) {
        nextBlocks.push(block);
      }
    }

    this.brokenBlocks = nextBlocks;
    this.shake = Math.max(0, this.shake - dt * 3.5);
  };

  window.PawsBelow.Effects = Effects;
})();
