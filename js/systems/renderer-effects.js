(function () {
  "use strict";

  window.PawsBelow = window.PawsBelow || {};

  var Renderer = window.PawsBelow.Renderer;
  var CONFIG = window.PawsBelow.CONFIG;
  var Random = window.PawsBelow.Random;

  if (!Renderer) {
    return;
  }

  Renderer.prototype.drawParticles = function (effects, layer) {
    var ctx = this.ctx;
    var i;
    var p;
    var progress;
    var alpha;
    var size;

    for (i = 0; i < effects.particles.length; i += 1) {
      p = effects.particles[i];

      if (layer === "leaves" && p.type !== "leaf") {
        continue;
      }

      if (layer !== "leaves" && p.type === "leaf") {
        continue;
      }

      if (layer === "surface" && p.type !== "run-dust") {
        continue;
      }

      if (layer !== "surface" && p.type === "run-dust") {
        continue;
      }

      progress = Math.max(0, Math.min(1, p.age / p.life));
      alpha = (1 - progress) * (p.alpha || 1);
      size = p.size + ((p.endSize || p.size) - p.size) * progress;

      if (p.type === "dust" || p.type === "run-dust" || p.type === "smoke") {
        alpha *= 1 - progress;
      }

      if (p.type === "smoke") {
        this.drawSmokeParticle(p, progress, alpha, size);
        continue;
      }

      if (p.type === "leaf") {
        this.drawLeafParticle(p, progress, alpha, size);
        continue;
      }

      if (p.type === "pebblite-spark" || p.type === "ore-spark") {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(Math.round(p.x), Math.round(p.y));
        ctx.rotate(progress * Math.PI * 1.5);
        ctx.fillRect(Math.round(-size / 2), Math.round(-size / 2), Math.ceil(size), Math.ceil(size));
        ctx.restore();
        continue;
      }

      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(
        Math.round(p.x - size / 2),
        Math.round(p.y - size / 2),
        Math.ceil(size),
        Math.ceil(size)
      );
    }

    ctx.globalAlpha = 1;
  };

  Renderer.prototype.drawLeafParticle = function (particle, progress, alpha, size) {
    var ctx = this.ctx;
    var wobble = Math.sin(particle.age * 5.2 + (particle.seed || 0)) * (particle.wobble || 1) * 4;
    var x = particle.x + wobble;
    var y = particle.y;

    ctx.save();
    ctx.globalAlpha = alpha * (1 - Math.max(0, progress - 0.72) / 0.28);
    ctx.translate(x, y);
    ctx.rotate(Math.sin(particle.age * 4.4 + (particle.seed || 0)) * 0.85);
    ctx.fillStyle = particle.color || "#d8a74a";
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.62, size * 0.28, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(91, 63, 29, 0.45)";
    ctx.fillRect(Math.round(-size * 0.08), Math.round(-size * 0.12), Math.max(1, Math.round(size * 0.16)), Math.max(1, Math.round(size * 0.45)));
    ctx.restore();
  };

  Renderer.prototype.drawSmokeParticle = function (particle, progress, alpha, size) {
    var ctx = this.ctx;
    var wobble = Math.sin((particle.age * 4.2) + (particle.seed || 0)) * (particle.wobble || 0) * 4;
    var x = particle.x + wobble;
    var y = particle.y;
    var radius = Math.max(1, size / 2);
    var innerRadius = Math.max(0.5, radius * 0.16);
    var gradient = ctx.createRadialGradient(x, y, innerRadius, x, y, radius);

    gradient.addColorStop(0, "rgba(170,166,156," + Math.min(0.58, alpha * 1.5) + ")");
    gradient.addColorStop(0.58, "rgba(94,91,86," + alpha + ")");
    gradient.addColorStop(1, "rgba(94,91,86,0)");

    ctx.globalAlpha = 1;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    if (progress < 0.45) {
      ctx.globalAlpha = (0.45 - progress) * 0.42;
      ctx.fillStyle = "#fff3cf";
      ctx.fillRect(Math.round(x - 1), Math.round(y - 1), 2, 2);
      ctx.globalAlpha = 1;
    }
  };

  Renderer.prototype.drawRain = function (state, camera) {
    var ctx = this.ctx;
    var world = state.world;
    var zoom = CONFIG.cameraZoom;
    var tile = CONFIG.tileSize;
    var groundY;
    var rainBottom;
    var count;
    var speed;
    var slant;
    var spanWidth;
    var spanHeight;
    var i;
    var rollX;
    var rollY;
    var rollLength;
    var x;
    var y;
    var length;
    var phase;
    var parallaxX;
    var stormOverlay;

    if (!state.isRainyDay || !state.isRainyDay() || !world) {
      return;
    }

    groundY = (world.surfaceY * tile - camera.y) * zoom;

    if (groundY <= 0) {
      return;
    }

    rainBottom = Math.min(this.height, Math.max(0, groundY));
    count = CONFIG.rainStreakCount || 80;
    speed = CONFIG.rainSpeed || 420;
    slant = CONFIG.rainSlant || -42;
    parallaxX = typeof CONFIG.rainParallaxX === "number" ? CONFIG.rainParallaxX : 0.28;
    spanWidth = this.width + Math.abs(slant) + 24;
    spanHeight = this.height + 80;
    phase = (state.time * speed) % spanHeight;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, this.width, rainBottom);
    ctx.clip();
    ctx.lineCap = "square";
    ctx.lineWidth = 1;

    stormOverlay = ctx.createLinearGradient(0, 0, 0, rainBottom);
    stormOverlay.addColorStop(0, "rgba(12,18,27,0.48)");
    stormOverlay.addColorStop(0.5, "rgba(17,25,34,0.42)");
    stormOverlay.addColorStop(1, "rgba(8,12,18,0.34)");
    ctx.fillStyle = stormOverlay;
    ctx.fillRect(0, 0, this.width, rainBottom);

    for (i = 0; i < count; i += 1) {
      rollX = Random.value2D(i * 29, state.weekIndex || 0, CONFIG.seed + 1301);
      rollY = Random.value2D(i * 31, state.dayIndex || 0, CONFIG.seed + 1302);
      rollLength = Random.value2D(i * 37, state.weekIndex || 0, CONFIG.seed + 1303);
      x = (rollX * spanWidth - 20 + camera.x * zoom * parallaxX) % spanWidth;
      y = (rollY * spanHeight + phase) % spanHeight;
      length = 14 + rollLength * 16;

      if (x < -Math.abs(slant)) {
        x += spanWidth;
      }

      if (y < 0) {
        y += spanHeight;
      }

      y -= 60;

      ctx.globalAlpha = 0.42 + rollLength * 0.26;
      ctx.strokeStyle = rollLength > 0.6 ? "#d9f2ff" : "#a8d8ec";
      ctx.beginPath();
      ctx.moveTo(Math.round(x), Math.round(y));
      ctx.lineTo(Math.round(x + slant * rollLength), Math.round(y + length));
      ctx.stroke();
    }

    ctx.globalAlpha = 0.14;
    ctx.fillStyle = "#060a10";
    ctx.fillRect(0, 0, this.width, rainBottom);
    ctx.restore();
    ctx.globalAlpha = 1;
  };

})();
