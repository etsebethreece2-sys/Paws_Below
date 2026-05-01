(function () {
  "use strict";

  window.PawsBelow = window.PawsBelow || {};

  var CONFIG = window.PawsBelow.CONFIG;
  var MathUtil = window.PawsBelow.MathUtil;
  var Tiles = window.PawsBelow.Tiles;

  function Cat(world) {
    this.reset(world);
  }

  Cat.prototype.reset = function (world) {
    this.x = world.startX;
    this.y = world.surfaceY - 1;
    this.facing = 1;
    this.energy = CONFIG.maxEnergy;
    this.maxEnergy = CONFIG.maxEnergy;
    this.deepest = 0;
    this.steps = 0;
    this.bump = 0;
    this.visualX = this.x;
    this.visualY = this.y;
    this.visualFromX = this.x;
    this.visualFromY = this.y;
    this.visualToX = this.x;
    this.visualToY = this.y;
    this.visualElapsed = 0;
    this.visualDuration = CONFIG.moveAnimationMs / 1000;
    this.currentVisualDuration = this.visualDuration;
    this.walkAnimationTimer = 0;
    this.lastAction = "idle";
    this.digPower = CONFIG.pawBasePower || 1;
    this.pickPower = 0;
  };

  Cat.prototype.isOnSurface = function (world) {
    return this.y === world.surfaceY - 1;
  };

  Cat.prototype.walkSurface = function (axis, dt, world) {
    var previousX = this.x;
    var nextX;

    if (!axis || !this.isOnSurface(world)) {
      return false;
    }

    this.facing = MathUtil.sign(axis);
    nextX = previousX + axis * CONFIG.surfaceWalkTilesPerSecond * dt;
    this.x = MathUtil.clamp(nextX, 0, world.width - 1);
    this.visualX = this.x;
    this.visualY = this.y;
    this.visualFromX = this.x;
    this.visualFromY = this.y;
    this.visualToX = this.x;
    this.visualToY = this.y;
    this.currentVisualDuration = this.visualDuration;
    this.visualElapsed = this.visualDuration;
    this.walkAnimationTimer = this.x !== previousX ? 0.12 : 0;
    this.lastAction = "surface-walk";

    if (this.x !== previousX) {
      this.bump = Math.max(this.bump, 0.65);
    }

    return this.x !== previousX;
  };

  Cat.prototype.walkUndergroundHorizontal = function (axis, dt, world) {
    var previousX = this.x;
    var direction;
    var nextX;
    var targetTileX;
    var targetTile;
    var targetDef;
    var edgeX;
    var moved;

    if (!axis || this.isOnSurface(world)) {
      return false;
    }

    direction = MathUtil.sign(axis);
    nextX = MathUtil.clamp(previousX + direction * CONFIG.surfaceWalkTilesPerSecond * dt, 0, world.width - 1);
    targetTileX = Math.round(nextX);

    if (!this.canTarget(targetTileX, this.y, world)) {
      return false;
    }

    targetTile = world.getTile(targetTileX, this.y);
    targetDef = Tiles.getTileDef(targetTile.type);

    if (targetDef.solid) {
      edgeX = targetTileX - direction * 0.51;
      this.x = MathUtil.clamp(nextX, Math.min(previousX, edgeX), Math.max(previousX, edgeX));
      moved = this.x !== previousX;

      if (moved) {
        this.visualX = this.x;
        this.visualY = this.y;
        this.visualFromX = this.x;
        this.visualFromY = this.y;
        this.visualToX = this.x;
        this.visualToY = this.y;
        this.currentVisualDuration = this.visualDuration;
        this.visualElapsed = this.visualDuration;
        this.walkAnimationTimer = 0.12;
        this.bump = Math.max(this.bump, 0.35);
      }

      return false;
    }

    this.facing = direction;
    this.x = nextX;
    this.visualX = this.x;
    this.visualY = this.y;
    this.visualFromX = this.x;
    this.visualFromY = this.y;
    this.visualToX = this.x;
    this.visualToY = this.y;
    this.currentVisualDuration = this.visualDuration;
    this.visualElapsed = this.visualDuration;
    this.walkAnimationTimer = this.x !== previousX ? 0.12 : 0;
    this.lastAction = "tunnel-walk";

    if (this.x !== previousX) {
      this.bump = Math.max(this.bump, 0.65);
    }

    return this.x !== previousX;
  };

  Cat.prototype.tryMove = function (dx, dy, world, effects, audio) {
    var originX = Math.round(this.x);
    var targetX = originX + dx;
    var targetY = this.y + dy;
    var tile;
    var def;
    var result;
    var damage;
    var pickDamage;
    var dirtDamage;
    var quickMine;
    var digMoveSeconds;

    if (dx !== 0) {
      this.facing = MathUtil.sign(dx);
    }

    if (dy !== 0) {
      this.walkAnimationTimer = 0;
    }

    if (this.isOnSurface(world) && dx !== 0 && dy === 0) {
      return false;
    }

    if (!this.canTarget(targetX, targetY, world)) {
      this.bump = 1;
      this.lastAction = "bump";
      audio.play("bump");
      return false;
    }

    tile = world.getTile(targetX, targetY);
    def = Tiles.getTileDef(tile.type);

    if (!def.solid) {
      if (this.isOnSurface(world)) {
        targetX = MathUtil.clamp(Math.round(targetX), 0, world.width - 1);
      }

      this.moveTo(targetX, targetY, world);
      this.spendEnergy(CONFIG.moveEnergyCost);
      this.lastAction = "step";
      audio.play("step");
      return true;
    }

    if (!def.diggable) {
      this.bump = 1;
      this.lastAction = "bump";
      audio.play("bump");
      return false;
    }

    if (typeof world.canDigTile === "function" && !world.canDigTile(targetX, targetY)) {
      this.bump = 1;
      this.lastAction = "bump";
      audio.play("bump");
      return false;
    }

    this.spendEnergy(def.cost);
    pickDamage = this.pickPower > 0 ? this.pickPower * (CONFIG.pickaxeOreDamageScale || 1) : 1;
    dirtDamage = Math.max(this.digPower || 1, pickDamage);
    damage = tile.type === "dirt" ? dirtDamage : pickDamage;
    quickMine = Math.ceil(def.hp / Math.max(0.1, damage)) <= 2;
    result = world.hitTile(targetX, targetY, damage);

    if (effects && typeof effects.addDigBurst === "function") {
      effects.addDigBurst(targetX, targetY, def.color, dx, dy, {
        skipDust: quickMine
      });
    }

    if (result.broke) {
      if (effects && typeof effects.addBlockBreak === "function") {
        effects.addBlockBreak(targetX, targetY, def.color, dx, dy, tile.type, {
          skipDust: quickMine
        });
      }

      if (targetY === world.surfaceY && effects && typeof effects.addGrassBreak === "function") {
        effects.addGrassBreak(targetX, targetY);
      }

      digMoveSeconds = (dy > 0 ? (CONFIG.digDownMoveAnimationMs || CONFIG.digMoveAnimationMs || CONFIG.moveAnimationMs) :
        (CONFIG.digMoveAnimationMs || CONFIG.moveAnimationMs)) / 1000;
      this.moveTo(targetX, targetY, world, {
        duration: digMoveSeconds,
        bump: 0.42
      });
      this.lastAction = "break";
      audio.play(tile.type === "dirt" ? "dig" : "orebreak");
    } else {
      this.lastAction = "chip";
      audio.play("chip");
    }

    return {
      acted: true,
      broke: !!result.broke,
      tileType: tile.type,
      targetX: targetX,
      targetY: targetY
    };
  };

  Cat.prototype.canTarget = function (targetX, targetY, world) {
    targetX = Math.round(targetX);

    if (targetX < 0 || targetX >= world.width) {
      return false;
    }

    if (this.y >= world.surfaceY && targetY < this.y) {
      return false;
    }

    if (targetY < world.surfaceY - 1) {
      return false;
    }

    if (this.y === world.surfaceY - 1 && targetY < world.surfaceY - 1) {
      return false;
    }

    return true;
  };

  Cat.prototype.moveTo = function (x, y, world, options) {
    var startX = this.getVisualX();
    var startY = this.getVisualY();
    var oldX = this.x;
    var oldY = this.y;
    var horizontalMove = y === oldY && Math.round(x) !== Math.round(oldX);
    var duration;
    var bump;

    options = options || {};
    duration = typeof options.duration === "number" ? options.duration : this.visualDuration;
    bump = typeof options.bump === "number" ? options.bump : 1;

    this.x = MathUtil.clamp(x, 0, world.width - 1);
    this.y = y;
    this.visualFromX = startX;
    this.visualFromY = startY;
    this.visualToX = this.x;
    this.visualToY = this.y;
    this.visualElapsed = 0;
    this.currentVisualDuration = Math.max(0.001, duration);
    this.walkAnimationTimer = horizontalMove ? this.currentVisualDuration : 0;
    this.steps += 1;
    this.bump = bump;
    this.deepest = Math.max(this.deepest, this.depth(world));

    if (this.y < world.surfaceY) {
      this.energy = this.maxEnergy || CONFIG.maxEnergy;
    }
  };

  Cat.prototype.spendEnergy = function (amount) {
    this.energy = Math.max(0, this.energy - amount);
  };

  Cat.prototype.depth = function (world) {
    return Math.max(0, this.y - world.surfaceY + 1);
  };

  Cat.prototype.update = function (dt) {
    var t;
    var eased;

    this.walkAnimationTimer = Math.max(0, this.walkAnimationTimer - dt);

    if (this.visualElapsed < this.currentVisualDuration) {
      this.visualElapsed = Math.min(this.currentVisualDuration, this.visualElapsed + dt);
      t = this.visualElapsed / this.currentVisualDuration;
      eased = t * t * (3 - 2 * t);
      this.visualX = MathUtil.lerp(this.visualFromX, this.visualToX, eased);
      this.visualY = MathUtil.lerp(this.visualFromY, this.visualToY, eased);
    } else {
      this.visualX = this.x;
      this.visualY = this.y;
    }

    this.bump = Math.max(0, this.bump - dt * 8);
  };

  Cat.prototype.isWalking = function () {
    return this.walkAnimationTimer > 0;
  };

  Cat.prototype.getVisualX = function () {
    return this.visualX;
  };

  Cat.prototype.getVisualY = function () {
    return this.visualY;
  };

  window.PawsBelow.Cat = Cat;
})();
