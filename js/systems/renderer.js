(function () {
  "use strict";

  window.PawsBelow = window.PawsBelow || {};

  var CONFIG = window.PawsBelow.CONFIG;
  var Random = window.PawsBelow.Random;

  function Renderer(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.catSprite = new Image();
    this.catIdleSprite = new Image();
    this.catRunSprite = new Image();
    this.dirtSprite = new Image();
    this.pebbliteSprite = new Image();
    this.coalclumpSprite = new Image();
    this.copperpawSprite = new Image();
    this.grassSprite = new Image();
    this.currencyUISprite = new Image();
    this.cabinSprite = new Image();
    this.scratchingPostSprite = new Image();
    this.blacksmithSprite = new Image();
    this.auntSandersSprite = new Image();
    this.blacksmithMenuBackgroundSprite = new Image();
    this.museumSprite = new Image();
    this.orphanageSprite = new Image();
    this.outhouseSprite = new Image();
    this.compendiumSprite = new Image();
    this.upgradeUISprite = new Image();
    this.upgradedUpgradeUISprite = new Image();
    this.toughUpgradeUISprite = new Image();
    this.maxUpgradeUISprite = new Image();
    this.diggaUpgradeUISprite = new Image();
    this.fannyUpgradeUISprite = new Image();
    this.bucketUpgradeUISprite = new Image();
    this.backpackUpgradeUISprite = new Image();
    this.crateUpgradeUISprite = new Image();
    this.duffelUpgradeUISprite = new Image();
    this.treasureChestUpgradeUISprite = new Image();
    this.pickaxeUpgradeSprites = [];
    this.staminaUpgradeUISprites = [];
    this.signSprite = new Image();
    this.tabbySprite = new Image();
    this.treeSprite = new Image();
    this.textboardSprite = new Image();
    this.skyboxSprite = new Image();
    this.mainMenuSprite = new Image();
    this.upgradeMenuBackgroundSprite = new Image();
    this.luckBackgroundSprite = new Image();
    this.shrineSprite = new Image();
    this.luckUISprite = new Image();
    this.luckFlowerSprites = [];
    this.bugSprites = [];
    this.cloudSprites = [];
    this.catSpriteBounds = null;
    this.catIdleFrames = [];
    this.catRunFrames = [];
    this.grassForegroundSprite = null;
    this.currencyUISpriteBounds = null;
    this.cabinSpriteBounds = null;
    this.scratchingPostSpriteBounds = null;
    this.blacksmithSpriteBounds = null;
    this.auntSandersSpriteBounds = null;
    this.blacksmithMenuBackgroundSpriteBounds = null;
    this.museumSpriteBounds = null;
    this.orphanageSpriteBounds = null;
    this.outhouseSpriteBounds = null;
    this.compendiumSpriteBounds = null;
    this.upgradeUISpriteBounds = null;
    this.upgradedUpgradeUISpriteBounds = null;
    this.toughUpgradeUISpriteBounds = null;
    this.maxUpgradeUISpriteBounds = null;
    this.diggaUpgradeUISpriteBounds = null;
    this.fannyUpgradeUISpriteBounds = null;
    this.bucketUpgradeUISpriteBounds = null;
    this.backpackUpgradeUISpriteBounds = null;
    this.crateUpgradeUISpriteBounds = null;
    this.duffelUpgradeUISpriteBounds = null;
    this.treasureChestUpgradeUISpriteBounds = null;
    this.pickaxeUpgradeSpriteBounds = [];
    this.staminaUpgradeUISpriteBounds = [];
    this.signSpriteBounds = null;
    this.tabbySpriteBounds = null;
    this.treeSpriteBounds = null;
    this.textboardSpriteBounds = null;
    this.skyboxSpriteBounds = null;
    this.mainMenuSpriteBounds = null;
    this.upgradeMenuBackgroundSpriteBounds = null;
    this.luckBackgroundSpriteBounds = null;
    this.shrineSpriteBounds = null;
    this.luckUISpriteBounds = null;
    this.luckFlowerSpriteBounds = [];
    this.bugSpriteBounds = [];
    this.cloudSpriteBounds = [];
    this.assetsReady = false;
    this.dpr = 1;
    this.width = 0;
    this.height = 0;
    this.viewWidth = 0;
    this.viewHeight = 0;
    this.currencyUIAlpha = 1;
    this.butterflyAlpha = CONFIG.butterflyOpacity || 0.6;
    this.currencyShownCoins = 0;
    this.currencyRollFrom = 0;
    this.currencyRollTo = 0;
    this.currencyRollElapsed = 0;
    this.currencyRollDuration = 0;
    this.staticTerrainChunkCache = {};
    this.staticTerrainChunkCacheKeys = [];
    this.staticTerrainChunkCacheLimit = CONFIG.staticTerrainChunkCacheLimit || 384;
    this.backgroundCacheCanvas = null;
    this.backgroundCacheCtx = null;
    this.backgroundCacheKey = "";
    this.blacksmithUpgradeHitRects = [];
  }


  Renderer.prototype.resize = function () {
    var rect = this.canvas.getBoundingClientRect();
    var dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    var width = Math.max(320, Math.floor(rect.width));
    var height = Math.max(320, Math.floor(rect.height));

    if (this.canvas.width !== width * dpr || this.canvas.height !== height * dpr) {
      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;
    }

    this.dpr = dpr;
    this.width = width;
    this.height = height;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  };

  Renderer.prototype.render = function (state) {
    var ctx;
    var camera;
    var zoom = CONFIG.cameraZoom;
    var shakeX;
    var shakeY;

    this.resize();
    ctx = this.ctx;
    camera = state.camera;
    this.viewWidth = this.width / zoom;
    this.viewHeight = this.height / zoom;
    state.camera.update(state.cat, this.viewWidth, this.viewHeight, state.world, state.dt);
    shakeX = (Random.value2D(state.frame, 1, CONFIG.seed) - 0.5) * state.effects.shake * 8 / zoom;
    shakeY = (Random.value2D(state.frame, 2, CONFIG.seed) - 0.5) * state.effects.shake * 8 / zoom;

    ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackground(state.world, camera, zoom, state.time);

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(Math.round(-camera.x + shakeX), Math.round(-camera.y + shakeY));
    this.drawParticles(state.effects, "leaves");
    this.drawSurfaceBackProps(state, camera);
    this.drawTownBackBuildings(state, camera);
    this.drawTiles(state.world, camera);
    this.drawActiveCracks(state.world, camera);
    this.drawBreakAnimations(state.world, state.effects);
    this.drawWorldTint(state.world, camera);
    this.drawLuckFlowers(state, camera);
    this.drawShrine(state, camera);
    this.drawSurfaceProps(state, camera);
    this.drawOuthouseOccupiedBubble(state);
    this.drawSurfaceButterflies(state);
    this.drawSurfaceFireflies(state);
    this.drawParticles(state.effects, "world");
    this.drawUndergroundBugs(state, camera);
    this.drawMiningStrokePreview(state);
    this.drawCat(state.cat, state.time);
    if ((!state.isUpgradeUIActive || !state.isUpgradeUIActive()) && (!state.isLuckUIActive || !state.isLuckUIActive())) {
      this.drawInventoryFullWarning(state);
    }
    this.drawGrassForeground(state.world, camera);
    this.drawParticles(state.effects, "surface");
    if (((!state.isUpgradeUIActive || !state.isUpgradeUIActive()) && (!state.isLuckUIActive || !state.isLuckUIActive())) ||
        (state.interactPromptPulseTimer && state.interactPromptPulseTimer > 0)) {
      this.drawCabinPrompt(state);
      this.drawTabbyPrompt(state);
      this.drawShrinePrompt(state);
      this.drawTownMuseumPrompt(state);
      this.drawTownOuthousePrompt(state);
      this.drawTownBlacksmithPrompt(state);
    }
    ctx.restore();

    this.drawRain(state, camera);
    if (state.menuState !== "done") {
      this.drawMainMenu(state);
      return;
    }

    if ((!state.isUpgradeUIActive || !state.isUpgradeUIActive()) && (!state.isLuckUIActive || !state.isLuckUIActive())) {
      this.drawCurrencyUI(state);
      this.drawDialogBoard(state);
    }
    this.drawDiscoveryPopup(state);
    this.drawUpgradeUI(state);
    this.drawLuckUI(state);
    this.drawCompendiumUI(state);
    this.drawBlacksmithUI(state);
    this.drawBlacksmithIntro(state);
  };

  Renderer.prototype.drawWorldTint = function (world, camera) {
    var ctx = this.ctx;

    if (!world || !world.worldTint) {
      return;
    }

    ctx.save();
    ctx.fillStyle = world.worldTint;
    ctx.fillRect(camera.x, camera.y, this.viewWidth, this.viewHeight);
    ctx.restore();
  };

  window.PawsBelow.Renderer = Renderer;
})();
