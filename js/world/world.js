(function () {
  "use strict";

  window.PawsBelow = window.PawsBelow || {};

  var CONFIG = window.PawsBelow.CONFIG;
  var Random = window.PawsBelow.Random;
  var Tiles = window.PawsBelow.Tiles;

  function World(seed, options) {
    options = options || {};
    this.seed = seed || CONFIG.seed;
    this.width = options.width || CONFIG.worldWidth;
    this.surfaceY = CONFIG.surfaceY;
    this.chunkSize = CONFIG.tileChunkSize || 8;
    this.cacheKey = [
      this.seed,
      this.width,
      this.surfaceY,
      this.chunkSize,
      options.dirtOnly ? "dirt" : "mixed",
      options.noOres ? "noores" : "ores",
      options.oreChanceMultiplier || 1
    ].join(":");
    this.chunks = {};
    this.startX = Math.max(0, Math.min(this.width - 1, CONFIG.playerStartX || Math.floor(this.width / 2)));
    this.surfaceHoleX = null;
    this.noDig = !!options.noDig;
    this.dirtOnly = !!options.dirtOnly;
    this.noOres = !!options.noOres;
    this.oreChanceMultiplier = options.oreChanceMultiplier || 1;
    this.skyTint = options.skyTint || "";
    this.worldTint = options.worldTint || "";
    this.tileEvents = [];
    this.activeCracks = [];
    this.activeCrackMap = {};
  }

  World.prototype.getTile = function (x, y) {
    var chunk;
    var local;

    if (x < 0 || x >= this.width || y > 999) {
      return Tiles.createTile("air");
    }

    chunk = this.getChunkForTile(x, y);
    local = this.getChunkLocalIndex(x, y, chunk);

    return chunk.tiles[local];
  };

  World.prototype.setTile = function (x, y, tile) {
    var chunk;
    var local;

    if (x < 0 || x >= this.width) {
      return;
    }

    chunk = this.getChunkForTile(x, y);
    local = this.getChunkLocalIndex(x, y, chunk);
    chunk.tiles[local] = tile;
    chunk.version += 1;
  };

  World.prototype.getChunkKey = function (chunkX, chunkY) {
    return chunkX + ":" + chunkY;
  };

  World.prototype.getChunkForTile = function (x, y) {
    var size = this.chunkSize;
    var chunkX = Math.floor(x / size);
    var chunkY = Math.floor(y / size);

    return this.getChunk(chunkX, chunkY);
  };

  World.prototype.getChunk = function (chunkX, chunkY) {
    var key = this.getChunkKey(chunkX, chunkY);

    if (!this.chunks[key]) {
      this.chunks[key] = this.generateChunk(chunkX, chunkY);
    }

    return this.chunks[key];
  };

  World.prototype.getChunkLocalIndex = function (x, y, chunk) {
    var size = this.chunkSize;
    var localX = x - chunk.x * size;
    var localY = y - chunk.y * size;

    return localY * size + localX;
  };

  World.prototype.generateChunk = function (chunkX, chunkY) {
    var size = this.chunkSize;
    var tiles = [];
    var localX;
    var localY;
    var worldX;
    var worldY;

    for (localY = 0; localY < size; localY += 1) {
      for (localX = 0; localX < size; localX += 1) {
        worldX = chunkX * size + localX;
        worldY = chunkY * size + localY;
        tiles.push(this.generateTile(worldX, worldY));
      }
    }

    return {
      x: chunkX,
      y: chunkY,
      version: 0,
      tiles: tiles
    };
  };

  World.prototype.hitTile = function (x, y, damage) {
    var tile = this.getTile(x, y);
    var def = Tiles.getTileDef(tile.type);
    var hitDamage = Math.max(0.1, damage || 1);

    if (!def.diggable) {
      return {
        broke: false,
        tile: tile,
        def: def
      };
    }

    if (!this.canDigTile(x, y)) {
      return {
        blocked: true,
        broke: false,
        tile: tile,
        def: def
      };
    }

    tile.hp -= hitDamage;

    if (tile.hp <= 0) {
      if (y === this.surfaceY && this.surfaceHoleX === null) {
        this.surfaceHoleX = x;
      }

      this.clearActiveCrack(x, y);
      this.emitTileEvent("tile-break", x, y, tile, def);
      this.setTile(x, y, Tiles.createTile("air"));

      return {
        broke: true,
        tile: tile,
        def: def,
        eventType: "tile-break"
      };
    }

    this.markActiveCrack(x, y, tile, def);
    this.emitTileEvent("tile-hit", x, y, tile, def);

    return {
      broke: false,
      tile: tile,
      def: def,
      eventType: "tile-hit"
    };
  };

  World.prototype.emitTileEvent = function (eventType, x, y, tile, def) {
    this.tileEvents.push({
      eventType: eventType,
      x: x,
      y: y,
      tileType: tile.type,
      hp: tile.hp,
      maxHp: def.hp,
      at: typeof performance !== "undefined" ? performance.now() : Date.now()
    });

    if (this.tileEvents.length > 64) {
      this.tileEvents.shift();
    }
  };

  World.prototype.consumeTileEvents = function () {
    var events = this.tileEvents;

    this.tileEvents = [];
    return events;
  };

  World.prototype.getActiveCracks = function () {
    return this.activeCracks;
  };

  World.prototype.markActiveCrack = function (x, y, tile, def) {
    var now = typeof performance !== "undefined" ? performance.now() : Date.now();
    var key = x + ":" + y;
    var entry = this.activeCrackMap[key];

    if (!entry) {
      entry = {
        key: key,
        x: x,
        y: y
      };
      this.activeCrackMap[key] = entry;
      this.activeCracks.push(entry);
    }

    entry.type = tile.type;
    entry.hp = tile.hp;
    entry.maxHp = def.hp;
    entry.hitAt = now;
    entry.updatedAt = now;
  };

  World.prototype.clearActiveCrack = function (x, y) {
    var key = x + ":" + y;
    var entry = this.activeCrackMap[key];
    var index;

    if (!entry) {
      return;
    }

    delete this.activeCrackMap[key];
    index = this.activeCracks.indexOf(entry);

    if (index >= 0) {
      this.activeCracks.splice(index, 1);
    }
  };

  World.prototype.pruneActiveCracks = function (now, maxAgeMs) {
    var next = [];
    var i;
    var entry;

    now = now || (typeof performance !== "undefined" ? performance.now() : Date.now());
    maxAgeMs = maxAgeMs || 2200;

    for (i = 0; i < this.activeCracks.length; i += 1) {
      entry = this.activeCracks[i];

      if (now - entry.updatedAt <= maxAgeMs) {
        next.push(entry);
      } else {
        delete this.activeCrackMap[entry.key];
      }
    }

    this.activeCracks = next;
  };

  World.prototype.canDigTile = function (x, y) {
    if (this.noDig) {
      return false;
    }

    if (y !== this.surfaceY) {
      return true;
    }

    return this.surfaceHoleX === null || this.surfaceHoleX === x;
  };

  World.prototype.generateTile = function (x, y) {
    var variant = Random.hashInt(x, y, this.seed) % 6;
    var oreRoll = Random.value2D(x, y, this.seed + 1447);
    var oreChanceMultiplier = this.oreChanceMultiplier || 1;
    var copperpawChance = (CONFIG.copperpawSpawnChance || 0.01) * oreChanceMultiplier;
    var coalclumpChance = (CONFIG.coalclumpSpawnChance || 0.03) * oreChanceMultiplier;
    var pebbliteChance = (CONFIG.pebbliteSpawnChance || 0.05) * oreChanceMultiplier;
    var depth = Math.max(0, y - this.surfaceY);

    if (x < 0 || x >= this.width || y > 999) {
      return Tiles.createTile("air", variant);
    }

    if (y < this.surfaceY) {
      return Tiles.createTile("air", variant);
    }

    if (this.dirtOnly) {
      return Tiles.createTile("dirt", variant);
    }

    if (this.noOres) {
      return Tiles.createTile("dirt", variant);
    }

    if (oreRoll < copperpawChance) {
      return Tiles.createTile("copperpaw", variant);
    }

    if (oreRoll < copperpawChance + coalclumpChance) {
      return Tiles.createTile("coalclump", variant);
    }

    if (oreRoll < copperpawChance + coalclumpChance + pebbliteChance) {
      return Tiles.createTile("pebblite", variant);
    }

    return Tiles.createTile("dirt", variant);
  };

  window.PawsBelow.World = World;
})();
