(function () {
  "use strict";

  window.PawsBelow = window.PawsBelow || {};

  var CONFIG = window.PawsBelow.CONFIG;
  var colors = CONFIG.colors;

  var TILE_DEFS = {
    air: {
      solid: false,
      diggable: false,
      hp: 0,
      cost: 0,
      color: "transparent"
    },
    dirt: {
      solid: true,
      diggable: true,
      hp: CONFIG.dirtHealth,
      cost: 1,
      color: colors.dirt
    },
    pebblite: {
      solid: true,
      diggable: true,
      hp: CONFIG.pebbliteHealth,
      cost: 2,
      color: "#8f97a2"
    },
    coalclump: {
      solid: true,
      diggable: true,
      hp: CONFIG.coalclumpHealth,
      cost: 2,
      color: "#4b4e54"
    },
    copperpaw: {
      solid: true,
      diggable: true,
      hp: CONFIG.copperpawHealth,
      cost: 2,
      color: "#b8794e"
    }
  };

  function createTile(type, variant) {
    var def = TILE_DEFS[type] || TILE_DEFS.air;

    return {
      type: type,
      hp: def.hp,
      variant: variant || 0
    };
  }

  function getTileDef(type) {
    return TILE_DEFS[type] || TILE_DEFS.air;
  }

  window.PawsBelow.Tiles = {
    defs: TILE_DEFS,
    createTile: createTile,
    getTileDef: getTileDef
  };
})();
