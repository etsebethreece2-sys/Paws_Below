(function () {
  "use strict";

  window.PawsBelow = window.PawsBelow || {};

  var CONFIG = window.PawsBelow.CONFIG;
  var Random = window.PawsBelow.Random;
  var Tiles = window.PawsBelow.Tiles;

  function GameState(options) {
    this.canvas = options.canvas;
    this.input = options.input;
    this.ui = options.ui;
    this.renderer = new window.PawsBelow.Renderer(this.canvas);
    this.audio = new window.PawsBelow.AudioSystem();
    this.effects = new window.PawsBelow.Effects();
    this.camera = new window.PawsBelow.Camera();
    this.frame = 0;
    this.time = 0;
    this.dt = 0;
    this.lastNow = 0;
    this.actionCooldown = 0;
    this.interactPromptPulse = "";
    this.interactPromptPulseTimer = 0;
    this.fadeAlpha = 0;
    this.fadeTimer = 0;
    this.mode = "running";
    this.menuState = "menu";
    this.menuHoldSeconds = 0;
    this.menuFadeTimer = 0;
    this.tabbyDialogOpen = false;
    this.tabbyDialogClosing = false;
    this.tabbyDialogProgress = 0;
    this.tabbyDialogTextTimer = 0;
    this.tabbyDialogLastCharCount = 0;
    this.tabbyDialogMode = "intro";
    this.tabbyDialogLineIndex = 0;
    this.tabbyDialogMode = "intro";
    this.tabbyDialogComplete = false;
    this.diggaPawsDialogPending = false;
    this.diggaPawsDialogComplete = false;
    this.upgradeUIOpen = false;
    this.upgradeUIClosing = false;
    this.upgradeUIProgress = 0;
    this.luckUIOpen = false;
    this.luckUIClosing = false;
    this.luckUIProgress = 0;
    this.compendiumUIOpen = false;
    this.compendiumUIClosing = false;
    this.compendiumUIProgress = 0;
    this.blacksmithUIOpen = false;
    this.blacksmithUIClosing = false;
    this.blacksmithUIProgress = 0;
    this.blacksmithMessageTimer = 0;
    this.blacksmithMessageText = "";
    this.pickaxeUnlockEffectTimer = 0;
    this.pickaxeUnlockEffectLevel = 0;
    this.pickaxeUnlockEffectSeed = 0;
    this.miningStrokeFlashTimer = 0;
    this.miningStrokeAngle = 0;
    this.miningStrokeTargetCount = 0;
    this.blacksmithIntroOpen = false;
    this.blacksmithIntroClosing = false;
    this.blacksmithIntroProgress = 0;
    this.blacksmithIntroLineIndex = 0;
    this.blacksmithIntroTextTimer = 0;
    this.blacksmithIntroLastCharCount = 0;
    this.blacksmithIntroComplete = false;
    this.outhouseBubbleTimer = 0;
    this.luckMessageTimer = 0;
    this.oreLuckLevel = 0;
    this.pendingOreLuckLevel = 0;
    this.dirtBlocksDug = 0;
    this.pebbliteBlocksDug = 0;
    this.coalclumpBlocksDug = 0;
    this.copperpawBlocksDug = 0;
    this.pebbliteDiscovered = false;
    this.coalclumpDiscovered = false;
    this.copperpawDiscovered = false;
    this.discoveryPopupTimer = 0;
    this.discoveryPopupType = "";
    this.coins = CONFIG.startingCoins || 0;
    this.infiniteCoins = false;
    this.pawLevel = 1;
    this.pawPower = CONFIG.pawBasePower || 1;
    this.pickaxeLevel = 0;
    this.pickPower = 0;
    this.storageLevel = 1;
    this.staminaLevel = 1;
    this.grassRunSoundTimer = 0;
    this.inventoryFullWarningTimer = 0;
    this.runDustTimer = 0;
    this.interactPromptPulse = "";
    this.interactPromptPulseTimer = 0;
    this.smokeTimer = 0;
    this.smokeSeed = 0;
    this.leafTimer = 0;
    this.leafSeed = 0;
    this.areaId = "main";
    this.areaTransitionTarget = "";
    this.areaTransitionSpawn = "";
    this.areaWorlds = {};
    this.dayIndex = 0;
    this.weekIndex = 0;
    this.rainyDays = this.pickRainyDays(this.weekIndex);
    this.reset();
  }

  GameState.prototype.reset = function () {
    this.dirtBlocksDug = 0;
    this.pebbliteBlocksDug = 0;
    this.coalclumpBlocksDug = 0;
    this.copperpawBlocksDug = 0;
    this.pebbliteDiscovered = false;
    this.coalclumpDiscovered = false;
    this.copperpawDiscovered = false;
    this.discoveryPopupTimer = 0;
    this.discoveryPopupType = "";
    this.coins = this.infiniteCoins ? (CONFIG.infiniteCoinsAmount || 999999) : (CONFIG.startingCoins || 0);
    this.pawLevel = 1;
    this.pawPower = CONFIG.pawBasePower || 1;
    this.pickaxeLevel = 0;
    this.pickPower = 0;
    this.storageLevel = 1;
    this.staminaLevel = 1;
    this.oreLuckLevel = 0;
    this.pendingOreLuckLevel = 0;
    this.luckMessageTimer = 0;
    this.tabbyDialogLineIndex = 0;
    this.tabbyDialogMode = "intro";
    this.tabbyDialogComplete = false;
    this.diggaPawsDialogPending = false;
    this.diggaPawsDialogComplete = false;
    this.areaId = "main";
    this.areaTransitionTarget = "";
    this.areaTransitionSpawn = "";
    this.areaWorlds = {};
    this.resetTerrain("main");
    this.fadeAlpha = 0;
    this.fadeTimer = 0;
    this.mode = "running";
    this.menuState = "menu";
    this.menuHoldSeconds = 0;
    this.menuFadeTimer = 0;
    this.dayIndex = 0;
    this.weekIndex = 0;
    this.rainyDays = this.pickRainyDays(this.weekIndex);
  };

  GameState.prototype.resetTerrain = function (areaId, spawnSide) {
    var areaSeedOffset;
    var nextAreaId = areaId || this.areaId || "main";
    var preserveAreaWorld = !!spawnSide;

    if (preserveAreaWorld && this.world) {
      this.areaWorlds[this.areaId || "main"] = this.world;
    } else {
      this.areaWorlds = {};
    }

    this.areaId = nextAreaId;
    areaSeedOffset = this.areaId === "west" ? 700000 : (this.areaId === "town" ? 1400000 : 0);
    if (preserveAreaWorld && this.areaWorlds[this.areaId]) {
      this.world = this.areaWorlds[this.areaId];
    } else {
      this.world = new window.PawsBelow.World(CONFIG.seed + areaSeedOffset + Math.floor(Date.now() % 100000), {
        dirtOnly: this.areaId === "west",
        noDig: this.areaId === "west" || this.areaId === "town",
        noOres: this.areaId === "town",
        oreChanceMultiplier: this.getOreChanceMultiplier(),
        skyTint: this.areaId === "west" ? "rgba(58, 181, 82, 0.42)" : "",
        worldTint: this.areaId === "west" ? "rgba(58, 181, 82, 0.18)" : "",
        width: this.areaId === "west" ? Math.max(4, CONFIG.worldWidth - 12) : CONFIG.worldWidth
      });
      this.areaWorlds[this.areaId] = this.world;
    }
    this.cat = new window.PawsBelow.Cat(this.world);

    if (spawnSide === "left") {
      this.cat.x = 1;
      this.cat.visualX = this.cat.x;
      this.cat.visualFromX = this.cat.x;
      this.cat.visualToX = this.cat.x;
      this.cat.facing = 1;
    } else if (spawnSide === "right") {
      this.cat.x = this.world.width - 2;
      this.cat.visualX = this.cat.x;
      this.cat.visualFromX = this.cat.x;
      this.cat.visualToX = this.cat.x;
      this.cat.facing = -1;
    }

    this.applyPawUpgrade();
    this.applyPickaxeUpgrade();
    this.applyStaminaUpgrade(true);
    this.effects = new window.PawsBelow.Effects();
    this.camera = new window.PawsBelow.Camera();
    this.actionCooldown = 0;
    this.tabbyDialogOpen = false;
    this.tabbyDialogClosing = false;
    this.tabbyDialogProgress = 0;
    this.tabbyDialogTextTimer = 0;
    this.tabbyDialogLastCharCount = 0;
    this.upgradeUIOpen = false;
    this.upgradeUIClosing = false;
    this.upgradeUIProgress = 0;
    this.luckUIOpen = false;
    this.luckUIClosing = false;
    this.luckUIProgress = 0;
    this.compendiumUIOpen = false;
    this.compendiumUIClosing = false;
    this.compendiumUIProgress = 0;
    this.blacksmithUIOpen = false;
    this.blacksmithUIClosing = false;
    this.blacksmithUIProgress = 0;
    this.blacksmithMessageTimer = 0;
    this.blacksmithMessageText = "";
    this.pickaxeUnlockEffectTimer = 0;
    this.pickaxeUnlockEffectLevel = 0;
    this.pickaxeUnlockEffectSeed = 0;
    this.miningStrokeFlashTimer = 0;
    this.miningStrokeAngle = 0;
    this.miningStrokeTargetCount = 0;
    this.blacksmithIntroOpen = false;
    this.blacksmithIntroClosing = false;
    this.blacksmithIntroProgress = 0;
    this.blacksmithIntroLineIndex = 0;
    this.blacksmithIntroTextTimer = 0;
    this.blacksmithIntroLastCharCount = 0;
    this.outhouseBubbleTimer = 0;
    this.luckMessageTimer = 0;
    this.grassRunSoundTimer = 0;
    this.inventoryFullWarningTimer = 0;
    this.runDustTimer = 0;
    this.smokeTimer = 0;
    this.smokeSeed = 0;
    this.leafTimer = 0;
    this.leafSeed = 0;
  };

  GameState.prototype.start = function () {
    var self = this;

    this.renderer.loadAssets().then(function () {
      window.requestAnimationFrame(self.loop.bind(self));
    });
  };

  GameState.prototype.loop = function (now) {
    if (!this.lastNow) {
      this.lastNow = now;
    }

    this.dt = Math.min(0.05, (now - this.lastNow) / 1000);
    this.time += this.dt;
    this.lastNow = now;
    this.frame += 1;

    this.update(now);
    this.renderer.render(this);
    this.ui.update(this);

    window.requestAnimationFrame(this.loop.bind(this));
  };

  GameState.prototype.update = function (now) {
    var dir;
    var surfaceAxis;
    var didUndergroundWalk = false;
    var click;
    var blacksmithHit;

    this.updateChimneySmoke();
    this.updateFallingLeaves();
    this.updateDiscoveryPopup();
    this.updateInteractPromptPulse();
    this.outhouseBubbleTimer = Math.max(0, (this.outhouseBubbleTimer || 0) - this.dt);
    this.blacksmithMessageTimer = Math.max(0, (this.blacksmithMessageTimer || 0) - this.dt);
    this.pickaxeUnlockEffectTimer = Math.max(0, (this.pickaxeUnlockEffectTimer || 0) - this.dt);
    this.miningStrokeFlashTimer = Math.max(0, (this.miningStrokeFlashTimer || 0) - this.dt);
    this.luckMessageTimer = Math.max(0, (this.luckMessageTimer || 0) - this.dt);

    if (this.infiniteCoins) {
      this.coins = CONFIG.infiniteCoinsAmount || 999999;
    }

    if (this.menuState !== "done") {
      this.updateMainMenu();
      this.cat.update(this.dt);
      this.effects.update(this.dt);
      this.stopGameplayAmbience();
      return;
    }

    if (this.input.consumeRestart()) {
      this.reset();
      this.updateSurfaceAmbience();
      return;
    }

    if (this.mode === "fadeout") {
      this.updateFadeOut();
      this.updateSurfaceAmbience();
      return;
    }

    if (this.mode === "fadein") {
      this.updateFadeIn();
      this.updateSurfaceAmbience();
      return;
    }

    if (this.mode === "surfacefadeout") {
      this.updateSurfaceFadeOut();
      this.updateSurfaceAmbience();
      return;
    }

    if (this.mode === "surfacefadein") {
      this.updateSurfaceFadeIn();
      this.updateSurfaceAmbience();
      return;
    }

    if (this.mode === "areafadeout") {
      this.updateAreaFadeOut();
      this.updateSurfaceAmbience();
      return;
    }

    if (this.mode === "areafadein") {
      this.updateAreaFadeIn();
      this.updateSurfaceAmbience();
      return;
    }

    if (this.mode !== "running") {
      this.updateTabbyDialog();
      this.updateUpgradeUI();
      this.updateLuckUI();
      this.updateCompendiumUI();
      this.updateBlacksmithUI();
      this.updateBlacksmithIntro();
      this.effects.update(this.dt);
      this.updateSurfaceAmbience();
      return;
    }

    if (this.input.consumeUpgrade && this.input.consumeUpgrade()) {
      if (this.blacksmithUIOpen && !this.blacksmithUIClosing) {
        this.purchasePickaxeUpgrade();
      } else if (this.upgradeUIOpen && !this.upgradeUIClosing) {
        this.purchasePawUpgrade();
      }
    }

    if (this.input.consumeStorageUpgrade && this.input.consumeStorageUpgrade() && this.upgradeUIOpen && !this.upgradeUIClosing) {
      this.purchaseStorageUpgrade();
    }

    if (this.input.consumeStaminaUpgrade && this.input.consumeStaminaUpgrade() && this.upgradeUIOpen && !this.upgradeUIClosing) {
      this.purchaseStaminaUpgrade();
    }

    click = this.input.consumeClick ? this.input.consumeClick() : null;

    if (click && this.luckUIOpen && !this.luckUIClosing && this.renderer.isLuckUpgradeButtonHit(click.x, click.y)) {
      this.purchaseLuckUpgrade();
    }

    if (click && this.blacksmithIntroOpen && !this.blacksmithIntroClosing) {
      if (this.isBlacksmithIntroTypingFinished()) {
        this.advanceBlacksmithIntro();
      }
      click = null;
    }

    if (click && this.blacksmithUIOpen && !this.blacksmithUIClosing && this.renderer.isBlacksmithUpgradeHit) {
      blacksmithHit = this.renderer.isBlacksmithUpgradeHit(click.x, click.y);

      if (blacksmithHit !== null) {
        this.purchasePickaxeUpgrade(blacksmithHit);
        click = null;
      }
    }

    if (this.input.consumeInteract()) {
      if (this.compendiumUIOpen) {
        this.closeCompendiumUI();
      } else if (this.blacksmithUIOpen) {
        this.closeBlacksmithUI();
      } else if (this.blacksmithIntroOpen) {
        if (this.isBlacksmithIntroTypingFinished()) {
          this.advanceBlacksmithIntro();
        }
      } else if (this.luckUIOpen) {
        this.closeLuckUI();
      } else if (this.upgradeUIOpen) {
        this.closeUpgradeUI();
      } else if (this.tabbyDialogOpen) {
        if (this.isTabbyDialogTypingFinished()) {
          this.advanceTabbyDialog();
        }
      } else if (this.canInteractWithShrine()) {
        this.triggerInteractPromptPulse("shrine");
        this.openLuckUI();
      } else if (this.isInMainArea() && this.isNearCabin()) {
        this.triggerInteractPromptPulse("cabin");
        this.openUpgradeUI();
      } else if (this.isInMainArea() && this.canInteractWithTabby()) {
        this.triggerInteractPromptPulse("tabby");
        this.openTabbyDialog();
      } else if (this.canInteractWithTownBlacksmith()) {
        this.triggerInteractPromptPulse("blacksmith");
        this.openBlacksmith();
      } else if (this.canInteractWithTownMuseum()) {
        this.triggerInteractPromptPulse("museum");
        this.openCompendiumUI();
      } else if (this.canInteractWithTownOuthouse()) {
        this.triggerInteractPromptPulse("outhouse");
        this.showOuthouseOccupiedBubble();
      }
    }

    if (this.tabbyDialogOpen && this.tabbyDialogMode !== "digga-paws" && !this.isNearTabby()) {
      this.closeTabbyDialog();
    }

    if (this.luckUIOpen && !this.isNearShrine()) {
      this.closeLuckUI();
    }

    if (this.compendiumUIOpen && !this.isNearTownMuseum()) {
      this.closeCompendiumUI();
    }

    if (this.blacksmithUIOpen && !this.isNearTownBlacksmith()) {
      this.closeBlacksmithUI();
    }

    this.updateTabbyDialog();
    this.updateUpgradeUI();
    this.updateLuckUI();
    this.updateCompendiumUI();
    this.updateBlacksmithUI();
    this.updateBlacksmithIntro();

    if (this.tabbyDialogOpen || this.upgradeUIOpen || this.upgradeUIClosing || this.luckUIOpen || this.luckUIClosing ||
      this.compendiumUIOpen || this.compendiumUIClosing || this.blacksmithUIOpen || this.blacksmithUIClosing ||
      this.blacksmithIntroOpen || this.blacksmithIntroClosing) {
      this.cat.update(this.dt);
      this.effects.update(this.dt);
      this.updateSurfaceAmbience();
      return;
    }

    this.input.update(now);
    surfaceAxis = this.input.getHorizontalAxis();
    this.grassRunSoundTimer = Math.max(0, this.grassRunSoundTimer - this.dt);
    this.inventoryFullWarningTimer = Math.max(0, this.inventoryFullWarningTimer - this.dt);
    this.runDustTimer = Math.max(0, this.runDustTimer - this.dt);
    if (this.cat.isOnSurface(this.world) && surfaceAxis) {
      if (this.cat.walkSurface(surfaceAxis, this.dt, this.world)) {
        if (this.grassRunSoundTimer <= 0) {
          this.audio.play("grass");
          this.grassRunSoundTimer = CONFIG.grassRunSoundIntervalSeconds;
        }

        if (this.runDustTimer <= 0 && this.effects && typeof this.effects.addRunDust === "function") {
          this.effects.addRunDust(this.cat);
          this.runDustTimer = 0.075;
        }
      }
      this.actionCooldown = 0;
      this.checkAreaEdgeTransition(surfaceAxis);
    } else if (!this.cat.isOnSurface(this.world) && surfaceAxis) {
      if (this.cat.walkUndergroundHorizontal(surfaceAxis, this.dt, this.world)) {
        if (this.runDustTimer <= 0 && this.isCatOnDirt() && this.effects && typeof this.effects.addRunDust === "function") {
          this.effects.addRunDust(this.cat, CONFIG.colors.dirtLight);
          this.runDustTimer = 0.075;
        }

        this.input.clearHorizontalDirections();
        this.actionCooldown = 0;
        didUndergroundWalk = true;
      }
    } else {
      this.grassRunSoundTimer = 0;
      this.runDustTimer = 0;
    }

    if (this.mode !== "running") {
      this.input.clearHorizontalDirections();
      this.cat.update(this.dt);
      this.effects.update(this.dt);
      this.updateSurfaceAmbience();
      return;
    }

    if (this.cat.isOnSurface(this.world) || didUndergroundWalk) {
      this.input.clearHorizontalDirections();
    }

    this.actionCooldown = Math.max(0, this.actionCooldown - this.dt * 1000);

    if (click && this.actionCooldown <= 0 && this.performMiningStroke(click.x, click.y)) {
      click = null;
    }

    if (this.actionCooldown <= 0) {
      dir = this.input.consumeDirection();

      if (dir) {
        if (this.wouldCollectInventoryItem(dir.dx, dir.dy) && this.isInventoryFull()) {
          this.cat.bump = 1;
          this.cat.lastAction = "bump";
          this.inventoryFullWarningTimer = CONFIG.inventoryFullWarningSeconds || 0.95;
          this.audio.play("bump");
          this.actionCooldown = CONFIG.moveCooldownMs;
          this.cat.update(this.dt);
          this.effects.update(this.dt);
          this.updateSurfaceAmbience();
          return;
        }

        this.cat.tryMove(dir.dx, dir.dy, this.world, this.effects, this.audio);
        this.processTileEvents();
        this.actionCooldown = CONFIG.moveCooldownMs;
      }
    }

    this.cat.update(this.dt);
    this.effects.update(this.dt);

    if (this.cat.energy <= 0) {
      this.startFadeReset();
    }

    this.updateSurfaceAmbience();
  };

  GameState.prototype.updateSurfaceAmbience = function () {
    var depth = this.cat ? this.cat.depth(this.world) : 0;

    if (!this.audio || typeof this.audio.updateSurfaceAmbience !== "function") {
      return;
    }

    if (this.menuState !== "done") {
      this.stopGameplayAmbience();
      return;
    }

    if ((this.areaId || "main") === "west") {
      if (typeof this.audio.stopSurfaceAmbience === "function") {
        this.audio.stopSurfaceAmbience();
      }

      if (typeof this.audio.stopRainAmbience === "function") {
        this.audio.stopRainAmbience();
      }

      if (typeof this.audio.updateLuckAmbience === "function") {
        this.audio.updateLuckAmbience(depth);
      }

      return;
    }

    if (typeof this.audio.stopLuckAmbience === "function") {
      this.audio.stopLuckAmbience();
    }

    if (this.isRainyDay && this.isRainyDay()) {
      if (typeof this.audio.stopSurfaceAmbience === "function") {
        this.audio.stopSurfaceAmbience();
      }

      if (typeof this.audio.updateRainAmbience === "function") {
        this.audio.updateRainAmbience(depth);
      }

      return;
    }

    if (typeof this.audio.stopRainAmbience === "function") {
      this.audio.stopRainAmbience();
    }

    this.audio.updateSurfaceAmbience(depth);
  };

  GameState.prototype.stopGameplayAmbience = function () {
    if (!this.audio) {
      return;
    }

    if (typeof this.audio.stopSurfaceAmbience === "function") {
      this.audio.stopSurfaceAmbience();
    }

    if (typeof this.audio.stopRainAmbience === "function") {
      this.audio.stopRainAmbience();
    }

    if (typeof this.audio.stopLuckAmbience === "function") {
      this.audio.stopLuckAmbience();
    }
  };

  GameState.prototype.pickRainyDays = function (weekIndex) {
    var dayCount = (CONFIG.dayNames && CONFIG.dayNames.length) || 7;
    var first = Random.hashInt(weekIndex, 1, CONFIG.seed + 1201) % dayCount;
    var secondRoll = Random.hashInt(weekIndex, 2, CONFIG.seed + 1202) % (dayCount - 1);
    var second = secondRoll >= first ? secondRoll + 1 : secondRoll;
    var days = [];

    days[first] = true;
    days[second] = true;

    return days;
  };

  GameState.prototype.advanceDay = function () {
    var dayCount = (CONFIG.dayNames && CONFIG.dayNames.length) || 7;

    this.applyPendingOreLuck();

    this.dayIndex = (this.dayIndex + 1) % dayCount;

    if (this.dayIndex === 0) {
      this.weekIndex += 1;
      this.rainyDays = this.pickRainyDays(this.weekIndex);
    }
  };

  GameState.prototype.getDayName = function () {
    var dayNames = CONFIG.dayNames || [];

    return dayNames[this.dayIndex] || "DAY " + (this.dayIndex + 1);
  };

  GameState.prototype.isRainyDay = function () {
    return !!(this.rainyDays && this.rainyDays[this.dayIndex]);
  };

  GameState.prototype.isInMainArea = function () {
    return (this.areaId || "main") === "main";
  };

  GameState.prototype.isInTownArea = function () {
    return (this.areaId || "main") === "town";
  };

  GameState.prototype.shouldDrawSurfaceProps = function () {
    return this.isInMainArea() || this.isInTownArea();
  };

  GameState.prototype.shouldDrawCabin = function () {
    return this.isInMainArea();
  };

  GameState.prototype.shouldDrawScratchingPost = function () {
    return this.isInMainArea();
  };

  GameState.prototype.shouldDrawTownBlacksmith = function () {
    return this.isInTownArea();
  };

  GameState.prototype.shouldDrawForegroundSurfaceTree = function () {
    return this.isInMainArea();
  };

  GameState.prototype.shouldDrawTabby = function () {
    return this.isInMainArea();
  };

  GameState.prototype.shouldDrawMewberrySign = function () {
    return this.isInMainArea() && this.pawLevel >= 5;
  };

  GameState.prototype.shouldDrawSurfaceButterflies = function () {
    return this.isInMainArea();
  };

  GameState.prototype.shouldDrawSurfaceFireflies = function () {
    return (this.areaId || "main") === "west";
  };

  GameState.prototype.shouldDrawShrine = function () {
    return (this.areaId || "main") === "west";
  };

  GameState.prototype.getOreChanceMultiplier = function () {
    return 1 + (this.oreLuckLevel || 0) * 0.1;
  };

  GameState.prototype.getTotalLuckPercent = function () {
    return ((this.oreLuckLevel || 0) + (this.pendingOreLuckLevel || 0)) * 10;
  };

  GameState.prototype.getMaxLuckPercent = function () {
    return CONFIG.maxLuckPercent || 1000;
  };

  GameState.prototype.setInfiniteCoins = function (enabled) {
    this.infiniteCoins = !!enabled;

    if (this.infiniteCoins) {
      this.coins = CONFIG.infiniteCoinsAmount || 999999;
    } else if (this.coins >= (CONFIG.infiniteCoinsAmount || 999999)) {
      this.coins = CONFIG.startingCoins || 0;
    }
  };

  GameState.prototype.canAfford = function (cost) {
    return this.infiniteCoins || this.coins >= cost;
  };

  GameState.prototype.spendCoins = function (cost) {
    if (this.infiniteCoins) {
      this.coins = CONFIG.infiniteCoinsAmount || 999999;
      return true;
    }

    if (this.coins < cost) {
      return false;
    }

    this.coins -= cost;
    return true;
  };

  GameState.prototype.applyPendingOreLuck = function () {
    if (this.pendingOreLuckLevel <= 0) {
      return false;
    }

    this.oreLuckLevel += this.pendingOreLuckLevel;
    this.pendingOreLuckLevel = 0;
    delete this.areaWorlds.main;
    return true;
  };

  GameState.prototype.startAreaTransition = function (targetAreaId, spawnSide) {
    this.closeTabbyDialog();
    this.closeUpgradeUI();
    this.closeLuckUI();
    this.closeCompendiumUI();
    this.closeBlacksmithUI();
    this.areaTransitionTarget = targetAreaId;
    this.areaTransitionSpawn = spawnSide;
    this.mode = "areafadeout";
    this.fadeTimer = 0;
    this.fadeAlpha = 0;
    this.actionCooldown = CONFIG.moveCooldownMs;
  };

  GameState.prototype.checkAreaEdgeTransition = function (surfaceAxis) {
    if (!this.cat || !this.world || !this.cat.isOnSurface(this.world)) {
      return;
    }

    if (this.isInMainArea() && surfaceAxis < 0 && this.cat.x <= 0.02) {
      this.startAreaTransition("west", "right");
    } else if (this.isInMainArea() && surfaceAxis > 0 && this.cat.x >= this.world.width - 1.02 && this.pawLevel >= 5) {
      this.startAreaTransition("town", "left");
    } else if ((this.areaId || "main") === "west" && surfaceAxis > 0 && this.cat.x >= this.world.width - 1.02) {
      this.startAreaTransition("main", "left");
    } else if (this.isInTownArea() && surfaceAxis < 0 && this.cat.x <= 0.02) {
      this.startAreaTransition("main", "right");
    }
  };

  GameState.prototype.isCatOnDirt = function () {
    var tile;

    if (!this.cat || !this.world || this.cat.y + 1 < this.world.surfaceY) {
      return false;
    }

    tile = this.world.getTile(Math.round(this.cat.x), this.cat.y + 1);
    return tile && tile.type === "dirt";
  };

  GameState.prototype.triggerInteractPromptPulse = function (type) {
    this.interactPromptPulse = type || "";
    this.interactPromptPulseTimer = CONFIG.interactPromptPulseSeconds || 0.18;
  };

  GameState.prototype.updateInteractPromptPulse = function () {
    this.interactPromptPulseTimer = Math.max(0, this.interactPromptPulseTimer - this.dt);

    if (this.interactPromptPulseTimer <= 0) {
      this.interactPromptPulse = "";
    }
  };

  GameState.prototype.getInteractPromptPulse = function (type) {
    if (this.interactPromptPulse !== type || this.interactPromptPulseTimer <= 0) {
      return 0;
    }

    return this.interactPromptPulseTimer / (CONFIG.interactPromptPulseSeconds || 0.18);
  };

  GameState.prototype.updateMainMenu = function () {
    var holdSeconds = CONFIG.mainMenuHoldSeconds || 1.5;
    var fadeSeconds = CONFIG.mainMenuFadeSeconds || 0.72;

    if (this.input && this.input.consumeInteract) {
      this.input.consumeInteract();
    }

    if (this.menuState === "menu") {
      if (this.audio && typeof this.audio.updateMainMenuMusic === "function") {
        this.audio.updateMainMenuMusic(1);
      }

      if (this.input && this.input.isInteractHeld && this.input.isInteractHeld()) {
        this.menuHoldSeconds = Math.min(holdSeconds, this.menuHoldSeconds + this.dt);
      } else {
        this.menuHoldSeconds = Math.max(0, this.menuHoldSeconds - this.dt * 2.5);
      }

      if (this.menuHoldSeconds >= holdSeconds) {
        this.menuState = "fadeout";
        this.menuFadeTimer = 0;
        this.fadeAlpha = 0;
      }
      return;
    }

    if (this.menuState === "fadeout") {
      this.menuFadeTimer = Math.min(fadeSeconds, this.menuFadeTimer + this.dt);
      this.fadeAlpha = this.menuFadeTimer / fadeSeconds;
      if (this.audio && typeof this.audio.updateMainMenuMusic === "function") {
        this.audio.updateMainMenuMusic(1 - this.fadeAlpha);
      }

      if (this.menuFadeTimer >= fadeSeconds) {
        this.menuState = "fadein";
        this.menuFadeTimer = 0;
        this.fadeAlpha = 1;
        if (this.audio && typeof this.audio.stopMainMenuMusic === "function") {
          this.audio.stopMainMenuMusic();
        }
      }
      return;
    }

    if (this.menuState === "fadein") {
      this.menuFadeTimer = Math.min(fadeSeconds, this.menuFadeTimer + this.dt);
      this.fadeAlpha = 1 - (this.menuFadeTimer / fadeSeconds);

      if (this.menuFadeTimer >= fadeSeconds) {
        this.menuState = "done";
        this.menuFadeTimer = 0;
        this.fadeAlpha = 0;
      }
    }
  };

  GameState.prototype.getMainMenuHoldProgress = function () {
    return Math.max(0, Math.min(1, this.menuHoldSeconds / (CONFIG.mainMenuHoldSeconds || 1.5)));
  };

  GameState.prototype.updateChimneySmoke = function () {
    var tile;
    var cabinHeight;
    var cabinWidth;
    var cabinX;
    var cabinY;
    var blacksmithPlacement;
    var smokeX;
    var smokeY;

    if ((!this.isInMainArea() && !this.isInTownArea()) || !this.world || !this.effects ||
      typeof this.effects.addChimneySmoke !== "function") {
      return;
    }

    this.smokeTimer -= this.dt;

    if (this.smokeTimer > 0) {
      return;
    }

    tile = CONFIG.surfaceVisualTileSize || CONFIG.tileSize;

    if (this.isInTownArea() && this.renderer && typeof this.renderer.getTownBlacksmithPlacement === "function") {
      blacksmithPlacement = this.renderer.getTownBlacksmithPlacement(this.world);
      smokeX = blacksmithPlacement.x + blacksmithPlacement.width * (CONFIG.blacksmithChimneySmokeOffsetX || 0.56);
      smokeY = blacksmithPlacement.y + blacksmithPlacement.height * (CONFIG.blacksmithChimneySmokeOffsetY || 0.12);
      this.effects.addChimneySmoke(smokeX, smokeY, this.smokeSeed);
      this.smokeSeed += 1;
      this.smokeTimer = CONFIG.chimneySmokeIntervalSeconds;
      return;
    }

    cabinHeight = tile * 4.35;
    cabinWidth = cabinHeight * (CONFIG.cabinSpriteAspectRatio || 1);
    cabinX = tile * 0.15;
    cabinY = this.world.surfaceY * CONFIG.tileSize + CONFIG.surfacePropGroundOffset - cabinHeight + CONFIG.cabinGroundSink;
    smokeX = cabinX + cabinWidth * CONFIG.chimneySmokeOffsetX;
    smokeY = cabinY + cabinHeight * CONFIG.chimneySmokeOffsetY;

    this.effects.addChimneySmoke(smokeX, smokeY, this.smokeSeed);
    this.smokeSeed += 1;
    this.smokeTimer = CONFIG.chimneySmokeIntervalSeconds;
  };

  GameState.prototype.updateFallingLeaves = function () {
    var tile;
    var tabbyTileX;
    var treeX;
    var treeY;

    if (!this.isInMainArea() || !this.world || !this.effects || typeof this.effects.addFallingLeaf !== "function") {
      return;
    }

    this.leafTimer -= this.dt;

    if (this.leafTimer > 0) {
      return;
    }

    tile = CONFIG.surfaceVisualTileSize || CONFIG.tileSize;
    tabbyTileX = this.world.width - 1;
    treeX = tabbyTileX * CONFIG.tileSize + CONFIG.tileSize / 2 + ((CONFIG.treeOffsetXTiles || 0) + 0.42) * tile;
    treeY = this.world.surfaceY * CONFIG.tileSize + CONFIG.surfacePropGroundOffset - tile * ((CONFIG.treeHeightTiles || 4.7) * 0.62);
    this.effects.addFallingLeaf(treeX, treeY, this.leafSeed);
    this.leafSeed += 1;
    this.leafTimer = CONFIG.fallingLeafIntervalSeconds || 0.22;
  };

  GameState.prototype.startFadeReset = function () {
    this.advanceDay();
    this.mode = "fadeout";
    this.fadeTimer = 0;
    this.fadeAlpha = 0;
    this.actionCooldown = CONFIG.moveCooldownMs * 2;
  };

  GameState.prototype.getTabbyTileX = function () {
    return this.world.width - 1;
  };

  GameState.prototype.isNearTabby = function () {
    var ratio = (CONFIG.surfaceVisualTileSize || CONFIG.tileSize) / CONFIG.tileSize;

    return this.isInMainArea() &&
      this.cat.y === this.world.surfaceY - 1 &&
      Math.abs(this.cat.x - this.getTabbyTileX()) <= (CONFIG.tabbyInteractDistance || 2.5) * ratio;
  };

  GameState.prototype.canInteractWithTabby = function () {
    return !this.tabbyDialogComplete && this.isNearTabby();
  };

  GameState.prototype.getShrineTileX = function () {
    return (CONFIG.shrineOffsetXTiles || 1.35) * ((CONFIG.surfaceVisualTileSize || CONFIG.tileSize) / CONFIG.tileSize);
  };

  GameState.prototype.isNearShrine = function () {
    var ratio = (CONFIG.surfaceVisualTileSize || CONFIG.tileSize) / CONFIG.tileSize;

    return (this.areaId || "main") === "west" &&
      this.cat &&
      this.world &&
      this.cat.y === this.world.surfaceY - 1 &&
      Math.abs(this.cat.x - this.getShrineTileX()) <= (CONFIG.shrineInteractDistance || 2.25) * ratio;
  };

  GameState.prototype.canInteractWithShrine = function () {
    return this.isNearShrine();
  };

  GameState.prototype.getCatDistanceFromPlacementCenter = function (placement) {
    var tile = CONFIG.tileSize;
    var distanceTile = CONFIG.surfaceVisualTileSize || tile;
    var catCenterX;
    var placementCenterX;

    if (!placement || !this.cat || !this.world || this.cat.y !== this.world.surfaceY - 1) {
      return Infinity;
    }

    catCenterX = this.cat.x * tile + tile / 2;
    placementCenterX = placement.x + placement.width / 2;
    return Math.abs(catCenterX - placementCenterX) / distanceTile;
  };

  GameState.prototype.getTownMuseumPlacement = function () {
    if (!this.renderer || !this.world || !this.renderer.getTownMuseumPlacement || !this.renderer.getTownBlacksmithPlacement) {
      return null;
    }

    return this.renderer.getTownMuseumPlacement(this.world, this.renderer.getTownBlacksmithPlacement(this.world));
  };

  GameState.prototype.getTownOuthousePlacement = function () {
    if (!this.renderer || !this.world || !this.renderer.getTownOuthousePlacement) {
      return null;
    }

    return this.renderer.getTownOuthousePlacement(this.world);
  };

  GameState.prototype.getTownBlacksmithPlacement = function () {
    if (!this.renderer || !this.world || !this.renderer.getTownBlacksmithPlacement) {
      return null;
    }

    return this.renderer.getTownBlacksmithPlacement(this.world);
  };

  GameState.prototype.isNearTownMuseum = function () {
    return this.isInTownArea() &&
      this.getCatDistanceFromPlacementCenter(this.getTownMuseumPlacement()) <= (CONFIG.museumInteractDistance || 2.7);
  };

  GameState.prototype.canInteractWithTownMuseum = function () {
    return this.isNearTownMuseum();
  };

  GameState.prototype.isNearTownOuthouse = function () {
    return this.isInTownArea() &&
      this.getCatDistanceFromPlacementCenter(this.getTownOuthousePlacement()) <= (CONFIG.outhouseInteractDistance || 1.35);
  };

  GameState.prototype.canInteractWithTownOuthouse = function () {
    return this.isNearTownOuthouse();
  };

  GameState.prototype.isNearTownBlacksmith = function () {
    return this.isInTownArea() &&
      this.getCatDistanceFromPlacementCenter(this.getTownBlacksmithPlacement()) <= (CONFIG.blacksmithInteractDistance || 2.3);
  };

  GameState.prototype.canInteractWithTownBlacksmith = function () {
    return this.isNearTownBlacksmith();
  };

  GameState.prototype.showOuthouseOccupiedBubble = function () {
    this.outhouseBubbleTimer = CONFIG.outhouseOccupiedBubbleSeconds || 1.4;
    this.audio.play("bump");
  };

  GameState.prototype.isNearCabin = function () {
    var ratio = (CONFIG.surfaceVisualTileSize || CONFIG.tileSize) / CONFIG.tileSize;

    return this.isInMainArea() &&
      this.cat.y === this.world.surfaceY - 1 &&
      Math.abs(this.cat.x - (CONFIG.cabinInteractCenterX || 0) * ratio) <= (CONFIG.cabinInteractDistance || 0) * ratio;
  };

  GameState.prototype.openUpgradeUI = function () {
    this.upgradeUIOpen = true;
    this.upgradeUIClosing = false;
    this.upgradeUIProgress = Math.max(this.upgradeUIProgress, 0.08);
    this.audio.play("dooropen");
  };

  GameState.prototype.applyPawUpgrade = function () {
    if (this.pawLevel >= 5) {
      this.pawPower = CONFIG.pawLevel5Power || 5;
    } else if (this.pawLevel >= 4) {
      this.pawPower = CONFIG.pawLevel4Power || 2.5;
    } else if (this.pawLevel >= 3) {
      this.pawPower = CONFIG.pawLevel3Power || 2;
    } else if (this.pawLevel >= 2) {
      this.pawPower = CONFIG.pawLevel2Power || 1.4;
    } else {
      this.pawPower = CONFIG.pawBasePower || 1;
    }

    if (this.cat) {
      this.cat.digPower = this.pawPower;
    }
  };

  GameState.prototype.getPickaxeUpgrades = function () {
    return CONFIG.pickaxeUpgrades || [];
  };

  GameState.prototype.getPickaxeStrength = function (level) {
    var upgrades = this.getPickaxeUpgrades();
    var index = Math.max(0, Math.min(upgrades.length - 1, (level || 0) - 1));

    if (level <= 0 || !upgrades[index]) {
      return 0;
    }

    return upgrades[index].strength || 0;
  };

  GameState.prototype.applyPickaxeUpgrade = function () {
    this.pickPower = this.getPickaxeStrength(this.pickaxeLevel || 0);

    if (this.cat) {
      this.cat.pickPower = this.pickPower;
    }
  };

  GameState.prototype.getPickaxeUpgradeCost = function (level) {
    var costs = CONFIG.pickaxeUpgradeCosts || [];
    var index = Math.max(0, (level || 1) - 1);

    return costs[index] || 0;
  };

  GameState.prototype.purchasePickaxeUpgrade = function (index) {
    var targetLevel = (typeof index === "number" ? index : this.pickaxeLevel) + 1;
    var upgrades = this.getPickaxeUpgrades();
    var cost;

    if (targetLevel < 1 || targetLevel > upgrades.length) {
      this.blacksmithMessageText = "All picks owned";
      this.blacksmithMessageTimer = 1.2;
      this.audio.play("deny");
      return false;
    }

    if (targetLevel !== (this.pickaxeLevel || 0) + 1) {
      this.blacksmithMessageText = targetLevel <= (this.pickaxeLevel || 0) ? "Already owned" : "Buy in order";
      this.blacksmithMessageTimer = 1.2;
      this.audio.play("deny");
      return false;
    }

    cost = this.getPickaxeUpgradeCost(targetLevel);

    if (!this.canAfford(cost)) {
      this.blacksmithMessageText = "Need " + cost + " coins";
      this.blacksmithMessageTimer = 1.2;
      this.audio.play("deny");
      return false;
    }

    this.spendCoins(cost);
    this.pickaxeLevel = targetLevel;
    this.applyPickaxeUpgrade();
    this.blacksmithMessageText = "Bought " + upgrades[targetLevel - 1].name;
    this.blacksmithMessageTimer = 1.2;
    this.pickaxeUnlockEffectTimer = CONFIG.blacksmithUnlockEffectSeconds || 0.9;
    this.pickaxeUnlockEffectLevel = targetLevel;
    this.pickaxeUnlockEffectSeed = this.frame || 1;
    this.audio.play("sell");
    return true;
  };

  GameState.prototype.purchasePawUpgrade = function () {
    var cost = typeof CONFIG.pawUpgradeCost === "number" ? CONFIG.pawUpgradeCost : 50;

    if (this.pawLevel >= (CONFIG.pawMaxLevel || 2)) {
      return false;
    }

    if (!this.canAfford(cost)) {
      this.audio.play("bump");
      return false;
    }

    this.spendCoins(cost);
    this.pawLevel += 1;
    this.applyPawUpgrade();
    if (this.pawLevel >= 5 && !this.diggaPawsDialogComplete) {
      this.diggaPawsDialogPending = true;
    }
    this.audio.play("sell");
    return true;
  };

  GameState.prototype.purchaseStorageUpgrade = function () {
    var cost = typeof CONFIG.storageUpgradeCost === "number" ? CONFIG.storageUpgradeCost : 50;

    if (this.storageLevel >= this.getStorageMaxLevel()) {
      return false;
    }

    if (!this.canAfford(cost)) {
      this.audio.play("bump");
      return false;
    }

    this.spendCoins(cost);
    this.storageLevel += 1;
    this.audio.play("sell");
    return true;
  };

  GameState.prototype.getStaminaMaxLevel = function () {
    var capacities = CONFIG.staminaCapacities || [];

    return Math.max(1, capacities.length || 1);
  };

  GameState.prototype.getMaxEnergyForLevel = function (level) {
    var capacities = CONFIG.staminaCapacities || [];
    var index = Math.max(0, Math.min(this.getStaminaMaxLevel() - 1, (level || 1) - 1));

    return capacities[index] || CONFIG.maxEnergy || 100;
  };

  GameState.prototype.getMaxEnergy = function () {
    return this.getMaxEnergyForLevel(this.staminaLevel || 1);
  };

  GameState.prototype.applyStaminaUpgrade = function (fillEnergy) {
    var maxEnergy = this.getMaxEnergy();

    if (!this.cat) {
      return;
    }

    this.cat.maxEnergy = maxEnergy;
    this.cat.energy = fillEnergy ? maxEnergy : Math.min(this.cat.energy, maxEnergy);
  };

  GameState.prototype.purchaseStaminaUpgrade = function () {
    var cost = typeof CONFIG.staminaUpgradeCost === "number" ? CONFIG.staminaUpgradeCost : 50;

    if (this.staminaLevel >= this.getStaminaMaxLevel()) {
      return false;
    }

    if (!this.canAfford(cost)) {
      this.audio.play("bump");
      return false;
    }

    this.spendCoins(cost);
    this.staminaLevel += 1;
    this.applyStaminaUpgrade(true);
    this.audio.play("sell");
    return true;
  };

  GameState.prototype.closeUpgradeUI = function () {
    if (!this.upgradeUIOpen && !this.upgradeUIClosing) {
      return;
    }

    this.upgradeUIOpen = false;
    this.upgradeUIClosing = true;
    this.audio.play("doorclose");
  };

  GameState.prototype.openLuckUI = function () {
    this.luckUIOpen = true;
    this.luckUIClosing = false;
    this.luckUIProgress = Math.max(this.luckUIProgress, 0.08);
    this.audio.play("upgradeopen");
  };

  GameState.prototype.closeLuckUI = function () {
    if (!this.luckUIOpen && !this.luckUIClosing) {
      return;
    }

    this.luckUIOpen = false;
    this.luckUIClosing = true;
    this.audio.play("upgradeclose");
  };

  GameState.prototype.openCompendiumUI = function () {
    this.compendiumUIOpen = true;
    this.compendiumUIClosing = false;
    this.compendiumUIProgress = Math.max(this.compendiumUIProgress, 0.08);
    this.audio.play("upgradeopen");
  };

  GameState.prototype.closeCompendiumUI = function () {
    if (!this.compendiumUIOpen && !this.compendiumUIClosing) {
      return;
    }

    this.compendiumUIOpen = false;
    this.compendiumUIClosing = true;
    this.audio.play("upgradeclose");
  };

  GameState.prototype.openBlacksmith = function () {
    if (this.blacksmithIntroComplete) {
      this.openBlacksmithUI();
      return;
    }

    this.openBlacksmithIntro();
  };

  GameState.prototype.openBlacksmithIntro = function () {
    this.blacksmithIntroOpen = true;
    this.blacksmithIntroClosing = false;
    this.blacksmithIntroProgress = Math.max(this.blacksmithIntroProgress, 0.08);
    this.blacksmithIntroLineIndex = 0;
    this.blacksmithIntroTextTimer = 0;
    this.blacksmithIntroLastCharCount = 0;
    this.audio.play("upgradeopen");
  };

  GameState.prototype.closeBlacksmithIntro = function () {
    if (!this.blacksmithIntroOpen && !this.blacksmithIntroClosing) {
      return;
    }

    this.blacksmithIntroOpen = false;
    this.blacksmithIntroClosing = true;
  };

  GameState.prototype.getBlacksmithIntroLines = function () {
    return CONFIG.blacksmithIntroTexts || [];
  };

  GameState.prototype.getBlacksmithIntroText = function () {
    var lines = this.getBlacksmithIntroLines();
    var index = Math.max(0, Math.min(lines.length - 1, this.blacksmithIntroLineIndex || 0));

    return lines[index] || "";
  };

  GameState.prototype.isBlacksmithIntroTypingFinished = function () {
    return Math.floor(this.blacksmithIntroTextTimer * CONFIG.tabbyDialogCharsPerSecond) >= this.getBlacksmithIntroText().length;
  };

  GameState.prototype.advanceBlacksmithIntro = function () {
    var lines = this.getBlacksmithIntroLines();

    if (this.blacksmithIntroLineIndex < lines.length - 1) {
      this.blacksmithIntroLineIndex += 1;
      this.blacksmithIntroTextTimer = 0;
      this.blacksmithIntroLastCharCount = 0;
      return;
    }

    this.blacksmithIntroComplete = true;
    this.blacksmithIntroOpen = false;
    this.blacksmithIntroClosing = false;
    this.blacksmithIntroProgress = 0;
    this.blacksmithIntroTextTimer = 0;
    this.blacksmithIntroLastCharCount = 0;
    this.openBlacksmithUI();
  };

  GameState.prototype.openBlacksmithUI = function () {
    this.blacksmithUIOpen = true;
    this.blacksmithUIClosing = false;
    this.blacksmithUIProgress = Math.max(this.blacksmithUIProgress, 0.08);
    this.blacksmithMessageTimer = 0;
    this.blacksmithMessageText = "";
    this.audio.play("upgradeopen");
  };

  GameState.prototype.closeBlacksmithUI = function () {
    if (!this.blacksmithUIOpen && !this.blacksmithUIClosing) {
      return;
    }

    this.blacksmithUIOpen = false;
    this.blacksmithUIClosing = true;
    this.audio.play("upgradeclose");
  };

  GameState.prototype.updateBlacksmithIntro = function () {
    var charCount;
    var text;

    if (this.blacksmithIntroOpen) {
      text = this.getBlacksmithIntroText();
      this.blacksmithIntroProgress = Math.min(
        1,
        this.blacksmithIntroProgress + this.dt / (CONFIG.blacksmithIntroOpenSeconds || CONFIG.tabbyDialogOpenSeconds || 0.22)
      );
      this.blacksmithIntroTextTimer += this.dt;
      charCount = Math.min(
        text.length,
        Math.floor(this.blacksmithIntroTextTimer * CONFIG.tabbyDialogCharsPerSecond)
      );

      if (charCount > this.blacksmithIntroLastCharCount && charCount < text.length) {
        this.audio.play("type");
      }

      this.blacksmithIntroLastCharCount = charCount;
      return;
    }

    if (this.blacksmithIntroClosing) {
      this.blacksmithIntroProgress = Math.max(
        0,
        this.blacksmithIntroProgress - this.dt / (CONFIG.blacksmithIntroCloseSeconds || CONFIG.tabbyDialogCloseSeconds || 0.14)
      );

      if (this.blacksmithIntroProgress <= 0) {
        this.blacksmithIntroClosing = false;
        this.blacksmithIntroTextTimer = 0;
        this.blacksmithIntroLastCharCount = 0;
      }
    }
  };

  GameState.prototype.updateCompendiumUI = function () {
    if (this.compendiumUIOpen) {
      this.compendiumUIProgress = Math.min(
        1,
        this.compendiumUIProgress + this.dt / (CONFIG.compendiumUIOpenSeconds || CONFIG.luckUIOpenSeconds || 0.2)
      );
      return;
    }

    if (this.compendiumUIClosing) {
      this.compendiumUIProgress = Math.max(
        0,
        this.compendiumUIProgress - this.dt / (CONFIG.compendiumUICloseSeconds || CONFIG.luckUICloseSeconds || 0.14)
      );

      if (this.compendiumUIProgress <= 0) {
        this.compendiumUIClosing = false;
      }
    }
  };

  GameState.prototype.updateBlacksmithUI = function () {
    if (this.blacksmithUIOpen) {
      this.blacksmithUIProgress = Math.min(
        1,
        this.blacksmithUIProgress + this.dt / (CONFIG.blacksmithUIOpenSeconds || CONFIG.luckUIOpenSeconds || 0.2)
      );
      return;
    }

    if (this.blacksmithUIClosing) {
      this.blacksmithUIProgress = Math.max(
        0,
        this.blacksmithUIProgress - this.dt / (CONFIG.blacksmithUICloseSeconds || CONFIG.luckUICloseSeconds || 0.14)
      );

      if (this.blacksmithUIProgress <= 0) {
        this.blacksmithUIClosing = false;
      }
    }
  };

  GameState.prototype.updateLuckUI = function () {
    if (this.luckUIOpen) {
      this.luckUIProgress = Math.min(
        1,
        this.luckUIProgress + this.dt / (CONFIG.luckUIOpenSeconds || CONFIG.upgradeUIOpenSeconds)
      );
      return;
    }

    if (this.luckUIClosing) {
      this.luckUIProgress = Math.max(
        0,
        this.luckUIProgress - this.dt / (CONFIG.luckUICloseSeconds || CONFIG.upgradeUICloseSeconds)
      );

      if (this.luckUIProgress <= 0) {
        this.luckUIClosing = false;
      }
    }
  };

  GameState.prototype.purchaseLuckUpgrade = function () {
    if (this.getTotalLuckPercent() >= this.getMaxLuckPercent()) {
      this.audio.play("deny");
      return false;
    }

    this.pendingOreLuckLevel = (this.pendingOreLuckLevel || 0) + 1;
    this.luckMessageTimer = 1.35;
    this.audio.play("luckupgrade");
    return true;
  };

  GameState.prototype.updateUpgradeUI = function () {
    if (this.upgradeUIOpen) {
      this.upgradeUIProgress = Math.min(
        1,
        this.upgradeUIProgress + this.dt / CONFIG.upgradeUIOpenSeconds
      );
      return;
    }

    if (this.upgradeUIClosing) {
      this.upgradeUIProgress = Math.max(
        0,
        this.upgradeUIProgress - this.dt / CONFIG.upgradeUICloseSeconds
      );

      if (this.upgradeUIProgress <= 0) {
        this.upgradeUIClosing = false;
        if (this.diggaPawsDialogPending && !this.diggaPawsDialogComplete) {
          this.openDiggaPawsDialog();
        }
      }
    }
  };

  GameState.prototype.openTabbyDialog = function () {
    if (this.tabbyDialogComplete) {
      return;
    }

    this.tabbyDialogMode = "intro";
    this.tabbyDialogOpen = true;
    this.tabbyDialogClosing = false;
    this.tabbyDialogProgress = Math.max(this.tabbyDialogProgress, 0.08);
    this.tabbyDialogTextTimer = 0;
    this.tabbyDialogLastCharCount = 0;
  };

  GameState.prototype.openDiggaPawsDialog = function () {
    this.diggaPawsDialogPending = false;
    this.tabbyDialogMode = "digga-paws";
    this.tabbyDialogLineIndex = 0;
    this.tabbyDialogOpen = true;
    this.tabbyDialogClosing = false;
    this.tabbyDialogProgress = Math.max(this.tabbyDialogProgress, 0.08);
    this.tabbyDialogTextTimer = 0;
    this.tabbyDialogLastCharCount = 0;
  };

  GameState.prototype.closeTabbyDialog = function () {
    if (!this.tabbyDialogOpen && !this.tabbyDialogClosing) {
      return;
    }

    this.tabbyDialogOpen = false;
    this.tabbyDialogClosing = true;
  };

  GameState.prototype.getTabbyDialogLines = function () {
    if (this.tabbyDialogMode === "digga-paws") {
      return CONFIG.diggaPawsDialogTexts || [];
    }

    return CONFIG.tabbyDialogTexts || [CONFIG.tabbyDialogText || ""];
  };

  GameState.prototype.getTabbyDialogText = function () {
    var lines = this.getTabbyDialogLines();
    var index = Math.max(0, Math.min(lines.length - 1, this.tabbyDialogLineIndex || 0));

    return lines[index] || "";
  };

  GameState.prototype.advanceTabbyDialog = function () {
    var lines = this.getTabbyDialogLines();

    if (this.tabbyDialogLineIndex < lines.length - 1) {
      this.tabbyDialogLineIndex += 1;
      this.tabbyDialogTextTimer = 0;
      this.tabbyDialogLastCharCount = 0;
      return;
    }

    if (this.tabbyDialogMode === "digga-paws") {
      this.diggaPawsDialogComplete = true;
    } else {
      this.tabbyDialogComplete = true;
    }
    this.closeTabbyDialog();
  };

  GameState.prototype.isTabbyDialogTypingFinished = function () {
    return Math.floor(this.tabbyDialogTextTimer * CONFIG.tabbyDialogCharsPerSecond) >= this.getTabbyDialogText().length;
  };

  GameState.prototype.updateTabbyDialog = function () {
    var charCount;
    var text;

    if (this.tabbyDialogOpen) {
      text = this.getTabbyDialogText();
      this.tabbyDialogProgress = Math.min(
        1,
        this.tabbyDialogProgress + this.dt / CONFIG.tabbyDialogOpenSeconds
      );
      this.tabbyDialogTextTimer += this.dt;
      charCount = Math.min(
        text.length,
        Math.floor(this.tabbyDialogTextTimer * CONFIG.tabbyDialogCharsPerSecond)
      );

      if (charCount > this.tabbyDialogLastCharCount && charCount < text.length) {
        this.audio.play("type");
      }

      this.tabbyDialogLastCharCount = charCount;
      return;
    }

    if (this.tabbyDialogClosing) {
      this.tabbyDialogProgress = Math.max(
        0,
        this.tabbyDialogProgress - this.dt / CONFIG.tabbyDialogCloseSeconds
      );

      if (this.tabbyDialogProgress <= 0) {
        this.tabbyDialogClosing = false;
        this.tabbyDialogTextTimer = 0;
        this.tabbyDialogLastCharCount = 0;
      }
    }
  };

  GameState.prototype.returnToSurface = function () {
    if (!this.cat || !this.world || this.cat.depth(this.world) < 1) {
      return;
    }

    this.closeTabbyDialog();
    this.closeUpgradeUI();
    this.closeLuckUI();
    this.closeCompendiumUI();
    this.closeBlacksmithUI();
    this.closeBlacksmithIntro();
    this.advanceDay();
    this.mode = "surfacefadeout";
    this.fadeTimer = 0;
    this.fadeAlpha = 0;
    this.actionCooldown = CONFIG.moveCooldownMs;
  };

  GameState.prototype.getSellValue = function () {
    return (this.dirtBlocksDug || 0) +
      (this.pebbliteBlocksDug || 0) * (CONFIG.pebbliteValue || 3) +
      (this.coalclumpBlocksDug || 0) * (CONFIG.coalclumpValue || 5) +
      (this.copperpawBlocksDug || 0) * (CONFIG.copperpawValue || 10);
  };

  GameState.prototype.getDirtCarryCapacity = function () {
    return this.getInventoryCapacity();
  };

  GameState.prototype.getInventoryCapacity = function () {
    return this.getStorageCapacityForLevel(this.storageLevel || 1);
  };

  GameState.prototype.getInventoryUsed = function () {
    return (this.dirtBlocksDug || 0) +
      (this.pebbliteBlocksDug || 0) +
      (this.coalclumpBlocksDug || 0) +
      (this.copperpawBlocksDug || 0);
  };

  GameState.prototype.getInventorySpaceLeft = function () {
    return Math.max(0, this.getInventoryCapacity() - this.getInventoryUsed());
  };

  GameState.prototype.getStorageMaxLevel = function () {
    var capacities = CONFIG.storageCapacities || [];

    return Math.max(1, capacities.length || 1);
  };

  GameState.prototype.getStorageCapacityForLevel = function (level) {
    var capacities = CONFIG.storageCapacities || [];
    var index = Math.max(0, Math.min(this.getStorageMaxLevel() - 1, (level || 1) - 1));

    return capacities[index] || CONFIG.dirtCarryCapacity || 5;
  };

  GameState.prototype.isDirtStorageFull = function () {
    return this.isInventoryFull();
  };

  GameState.prototype.isInventoryFull = function () {
    return this.getInventorySpaceLeft() <= 0;
  };

  GameState.prototype.isInventoryTileType = function (type) {
    return type === "dirt" || type === "pebblite" || type === "coalclump" || type === "copperpaw";
  };

  GameState.prototype.processTileEvents = function () {
    var events = this.world && this.world.consumeTileEvents ? this.world.consumeTileEvents() : [];
    var i;

    for (i = 0; i < events.length; i += 1) {
      this.handleTileEvent(events[i]);
    }
  };

  GameState.prototype.screenToWorldPoint = function (screenX, screenY) {
    var zoom = CONFIG.cameraZoom || 1;

    return {
      x: (this.camera ? this.camera.x : 0) + screenX / zoom,
      y: (this.camera ? this.camera.y : 0) + screenY / zoom
    };
  };

  GameState.prototype.getMiningStrokeOrigin = function () {
    var tile = CONFIG.tileSize;

    if (!this.cat) {
      return null;
    }

    return {
      x: this.cat.x * tile + tile / 2,
      y: this.cat.y * tile + tile / 2
    };
  };

  GameState.prototype.getAngleDifference = function (a, b) {
    return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
  };

  GameState.prototype.getMiningStrokePreview = function () {
    var pointer;
    var worldPoint;
    var origin;
    var radius;
    var coneHalf;
    var angle;

    if (!this.input || !this.input.getPointerPosition || !this.cat || !this.world || this.world.noDig ||
      this.menuState !== "done" || this.mode !== "running" || this.isAnyModalUIActive()) {
      return null;
    }

    pointer = this.input.getPointerPosition();

    if (!pointer || !pointer.inside) {
      return null;
    }

    origin = this.getMiningStrokeOrigin();

    if (!origin) {
      return null;
    }

    worldPoint = this.screenToWorldPoint(pointer.x, pointer.y);
    angle = Math.atan2(worldPoint.y - origin.y, worldPoint.x - origin.x);
    radius = (CONFIG.miningStrokeRadiusTiles || 3) * CONFIG.tileSize;
    coneHalf = ((CONFIG.miningStrokeConeDegrees || 58) * Math.PI / 180) / 2;

    return {
      originX: origin.x,
      originY: origin.y,
      angle: angle,
      radius: radius,
      coneHalf: coneHalf,
      flash: this.miningStrokeFlashTimer || 0,
      targetCount: this.miningStrokeTargetCount || 0
    };
  };

  GameState.prototype.getMiningStrokeTargetLimit = function () {
    var maxTargets = CONFIG.miningStrokeMaxTargets || 5;
    var baseTargets = CONFIG.miningStrokeBaseTargets || 4;
    var power = Math.max(this.pawPower || 1, this.pickPower || 0);
    var bonus = Math.floor(Math.max(0, power - 1) / 1.7);

    return Math.max(1, Math.min(maxTargets, baseTargets + bonus));
  };

  GameState.prototype.getMiningStrokeDamage = function (type) {
    var pickDamage = this.pickPower > 0 ? this.pickPower * (CONFIG.pickaxeOreDamageScale || 1) : 1;
    var dirtDamage = Math.max(this.pawPower || 1, pickDamage);
    var damage = type === "dirt" ? dirtDamage : pickDamage;

    return damage * (CONFIG.miningStrokeDamageScale || 1);
  };

  GameState.prototype.getMiningStrokeTargets = function (angle, limit) {
    var targets = [];
    var origin = this.getMiningStrokeOrigin();
    var tile = CONFIG.tileSize;
    var radius = (CONFIG.miningStrokeRadiusTiles || 3) * tile;
    var coneHalf = ((CONFIG.miningStrokeConeDegrees || 58) * Math.PI / 180) / 2;
    var minX;
    var maxX;
    var minY;
    var maxY;
    var x;
    var y;
    var tileData;
    var def;
    var centerX;
    var centerY;
    var dx;
    var dy;
    var dist;
    var diff;
    var surfaceTargetTaken = false;

    if (!origin || !this.world || this.world.noDig) {
      return targets;
    }

    limit = Math.max(1, limit || this.getMiningStrokeTargetLimit());
    minX = Math.max(0, Math.floor((origin.x - radius) / tile));
    maxX = Math.min(this.world.width - 1, Math.floor((origin.x + radius) / tile));
    minY = Math.max(this.world.surfaceY, Math.floor((origin.y - radius) / tile));
    maxY = Math.floor((origin.y + radius) / tile);

    for (y = minY; y <= maxY; y += 1) {
      for (x = minX; x <= maxX; x += 1) {
        if (x === Math.round(this.cat.x) && y === this.cat.y) {
          continue;
        }

        tileData = this.world.getTile(x, y);
        def = Tiles.getTileDef(tileData.type);

        if (!def.solid || !def.diggable || (this.world.canDigTile && !this.world.canDigTile(x, y))) {
          continue;
        }

        centerX = x * tile + tile / 2;
        centerY = y * tile + tile / 2;
        dx = centerX - origin.x;
        dy = centerY - origin.y;
        dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > radius || dist < tile * 0.18) {
          continue;
        }

        diff = this.getAngleDifference(Math.atan2(dy, dx), angle);

        if (diff > coneHalf) {
          continue;
        }

        targets.push({
          x: x,
          y: y,
          tile: tileData,
          def: def,
          dx: dx,
          dy: dy,
          dist: dist,
          diff: diff,
          score: dist * 0.72 + diff * radius * 0.9
        });
      }
    }

    targets.sort(function (a, b) {
      return a.score - b.score;
    });

    if (this.world.surfaceHoleX === null) {
      targets = targets.filter(function (target) {
        if (target.y !== this.world.surfaceY) {
          return true;
        }

        if (surfaceTargetTaken) {
          return false;
        }

        surfaceTargetTaken = true;
        return true;
      }, this);
    }

    return targets.slice(0, limit);
  };

  GameState.prototype.showInventoryFullWarning = function () {
    if (this.cat) {
      this.cat.bump = 1;
      this.cat.lastAction = "bump";
    }

    this.inventoryFullWarningTimer = CONFIG.inventoryFullWarningSeconds || 0.95;

    if (this.audio) {
      this.audio.play("bump");
    }
  };

  GameState.prototype.getMiningStrokeEnergyCost = function (targets) {
    var cost = 0;
    var i;

    for (i = 0; i < targets.length; i += 1) {
      cost += targets[i].def.cost || 1;
    }

    return Math.max(1, Math.ceil(cost * (CONFIG.miningStrokeEnergyCostScale || 0.45)));
  };

  GameState.prototype.performMiningStroke = function (screenX, screenY) {
    var worldPoint;
    var origin;
    var angle;
    var targetLimit;
    var candidates;
    var spaceLeft;
    var targets;
    var brokeDirt = false;
    var brokeOre = false;
    var hitAny = false;
    var i;
    var target;
    var damage;
    var quickMine;
    var result;
    var particleLimit;
    var scaleMultiplier;

    if (!this.cat || !this.world || this.world.noDig || this.actionCooldown > 0) {
      return false;
    }

    origin = this.getMiningStrokeOrigin();

    if (!origin) {
      return false;
    }

    worldPoint = this.screenToWorldPoint(screenX, screenY);
    angle = Math.atan2(worldPoint.y - origin.y, worldPoint.x - origin.x);
    targetLimit = this.getMiningStrokeTargetLimit();
    candidates = this.getMiningStrokeTargets(angle, targetLimit);

    this.miningStrokeAngle = angle;
    this.miningStrokeFlashTimer = 0.16;
    this.miningStrokeTargetCount = candidates.length;

    if (!candidates.length) {
      return false;
    }

    if (this.isInventoryFull() && candidates.some(function (candidate) {
      return candidate.def.solid && candidate.def.diggable;
    })) {
      this.showInventoryFullWarning();
      this.actionCooldown = CONFIG.moveCooldownMs;
      return true;
    }

    spaceLeft = this.getInventorySpaceLeft();
    targets = candidates.slice(0, Math.max(1, Math.min(targetLimit, spaceLeft || targetLimit)));
    particleLimit = Math.min(3, targets.length);
    scaleMultiplier = targets.length > 3 ? 0.65 : 0.82;

    if (Math.cos(angle) !== 0) {
      this.cat.facing = Math.cos(angle) >= 0 ? 1 : -1;
    }

    this.cat.spendEnergy(this.getMiningStrokeEnergyCost(targets));
    this.cat.bump = Math.max(this.cat.bump || 0, 0.42);
    this.cat.lastAction = "stroke";

    for (i = 0; i < targets.length; i += 1) {
      target = targets[i];
      damage = this.getMiningStrokeDamage(target.tile.type);
      quickMine = Math.ceil(target.def.hp / Math.max(0.1, damage)) <= 2;
      result = this.world.hitTile(target.x, target.y, damage);

      if (result.blocked) {
        continue;
      }

      hitAny = true;

      if (result.broke) {
        if (target.tile.type === "dirt") {
          brokeDirt = true;
        } else {
          brokeOre = true;
        }

        if (this.effects && typeof this.effects.addBlockBreak === "function") {
          this.effects.addBlockBreak(target.x, target.y, target.def.color, target.dx, target.dy, target.tile.type, {
            skipDust: quickMine || targets.length > 2,
            scaleMultiplier: scaleMultiplier
          });
        }

        if (target.y === this.world.surfaceY && this.effects && typeof this.effects.addGrassBreak === "function") {
          this.effects.addGrassBreak(target.x, target.y);
        }
      } else if (i < particleLimit && this.effects && typeof this.effects.addDigBurst === "function") {
        this.effects.addDigBurst(target.x, target.y, target.def.color, target.dx, target.dy, {
          scale: 0.38,
          skipDust: quickMine || targets.length > 2
        });
      }
    }

    this.processTileEvents();

    if (!hitAny) {
      this.audio.play("bump");
      this.actionCooldown = CONFIG.moveCooldownMs;
      return true;
    }

    if (brokeOre) {
      this.audio.play("orebreak");
      this.cat.lastAction = "break";
    } else if (brokeDirt) {
      this.audio.play("dig");
      this.cat.lastAction = "break";
    } else {
      this.audio.play("chip");
      this.cat.lastAction = "chip";
    }

    this.actionCooldown = CONFIG.miningStrokeCooldownMs || CONFIG.moveCooldownMs;
    return true;
  };

  GameState.prototype.handleTileEvent = function (event) {
    if (!event || event.eventType !== "tile-break") {
      return;
    }

    if (event.tileType === "dirt") {
      this.dirtBlocksDug += 1;
      return;
    }

    if (event.tileType === "pebblite") {
      this.pebbliteBlocksDug += 1;
      this.discoverOre("pebblite", event.x, event.y);
      return;
    }

    if (event.tileType === "coalclump") {
      this.coalclumpBlocksDug += 1;
      this.discoverOre("coalclump", event.x, event.y);
      return;
    }

    if (event.tileType === "copperpaw") {
      this.copperpawBlocksDug += 1;
      this.discoverOre("copperpaw", event.x, event.y);
    }
  };

  GameState.prototype.wouldDigDirt = function (dx, dy) {
    return this.wouldCollectInventoryItem(dx, dy);
  };

  GameState.prototype.wouldCollectInventoryItem = function (dx, dy) {
    var targetX;
    var targetY;
    var tile;
    var def;

    if (!this.cat || !this.world) {
      return false;
    }

    targetX = Math.round(this.cat.x) + dx;
    targetY = this.cat.y + dy;

    if (!this.cat.canTarget(targetX, targetY, this.world)) {
      return false;
    }

    tile = this.world.getTile(targetX, targetY);
    def = Tiles.getTileDef(tile.type);

    if (typeof this.world.canDigTile === "function" && !this.world.canDigTile(targetX, targetY)) {
      return false;
    }

    return this.isInventoryTileType(tile.type) && def.solid && def.diggable;
  };

  GameState.prototype.sellDirt = function () {
    var sellValue = this.getSellValue();

    if (!this.canSellDirt() || sellValue <= 0) {
      return;
    }

    this.coins += sellValue;
    this.dirtBlocksDug = 0;
    this.pebbliteBlocksDug = 0;
    this.coalclumpBlocksDug = 0;
    this.copperpawBlocksDug = 0;
    this.audio.play("sell");
  };

  GameState.prototype.canSellDirt = function () {
    return this.isInMainArea() && this.cat && this.world && this.cat.depth(this.world) === 0;
  };

  GameState.prototype.discoverPebblite = function (tileX, tileY) {
    this.discoverOre("pebblite", tileX, tileY);
  };

  GameState.prototype.discoverOre = function (type, tileX, tileY) {
    var discoveredKey = type + "Discovered";

    if (this[discoveredKey]) {
      return;
    }

    this[discoveredKey] = true;
    this.discoveryPopupType = type;
    this.discoveryPopupTimer = CONFIG.oreDiscoveryPopupSeconds || 4.4;

    if (this.effects && typeof this.effects.addOreDiscovery === "function") {
      this.effects.addOreDiscovery(tileX, tileY, type);
    }
  };

  GameState.prototype.updateDiscoveryPopup = function () {
    this.discoveryPopupTimer = Math.max(0, (this.discoveryPopupTimer || 0) - this.dt);
  };

  GameState.prototype.isTabbyDialogActive = function () {
    return this.tabbyDialogOpen || this.tabbyDialogClosing || this.tabbyDialogProgress > 0;
  };

  GameState.prototype.isUpgradeUIActive = function () {
    return this.upgradeUIOpen || this.upgradeUIClosing || this.upgradeUIProgress > 0;
  };

  GameState.prototype.isLuckUIActive = function () {
    return this.luckUIOpen || this.luckUIClosing || this.luckUIProgress > 0;
  };

  GameState.prototype.isCompendiumUIActive = function () {
    return this.compendiumUIOpen || this.compendiumUIClosing || this.compendiumUIProgress > 0;
  };

  GameState.prototype.isBlacksmithUIActive = function () {
    return this.blacksmithUIOpen || this.blacksmithUIClosing || this.blacksmithUIProgress > 0;
  };

  GameState.prototype.isBlacksmithIntroActive = function () {
    return this.blacksmithIntroOpen || this.blacksmithIntroClosing || this.blacksmithIntroProgress > 0;
  };

  GameState.prototype.isAnyModalUIActive = function () {
    return this.isUpgradeUIActive() || this.isLuckUIActive() || this.isCompendiumUIActive() ||
      this.isBlacksmithUIActive() || this.isBlacksmithIntroActive() || this.isTabbyDialogActive();
  };

  GameState.prototype.updateFadeOut = function () {
    this.cat.update(this.dt);
    this.effects.update(this.dt);
    this.fadeTimer += this.dt;
    this.fadeAlpha = Math.min(1, this.fadeTimer / CONFIG.resetFadeSeconds);

    if (this.fadeAlpha >= 1) {
      this.resetTerrain();
      this.mode = "fadein";
      this.fadeTimer = 0;
      this.fadeAlpha = 1;
    }
  };

  GameState.prototype.updateFadeIn = function () {
    this.cat.update(this.dt);
    this.effects.update(this.dt);
    this.fadeTimer += this.dt;
    this.fadeAlpha = Math.max(0, 1 - this.fadeTimer / CONFIG.resetFadeSeconds);

    if (this.fadeAlpha <= 0) {
      this.fadeAlpha = 0;
      this.mode = "running";
    }
  };

  GameState.prototype.updateSurfaceFadeOut = function () {
    var fadeSeconds = CONFIG.surfaceReturnFadeSeconds || CONFIG.resetFadeSeconds;

    this.cat.update(this.dt);
    this.effects.update(this.dt);
    this.fadeTimer += this.dt;
    this.fadeAlpha = Math.min(1, this.fadeTimer / fadeSeconds);

    if (this.fadeAlpha >= 1) {
      this.resetTerrain();
      this.mode = "surfacefadein";
      this.fadeTimer = 0;
      this.fadeAlpha = 1;
      this.actionCooldown = CONFIG.moveCooldownMs;
    }
  };

  GameState.prototype.updateSurfaceFadeIn = function () {
    var fadeSeconds = CONFIG.surfaceReturnFadeSeconds || CONFIG.resetFadeSeconds;

    this.cat.update(this.dt);
    this.effects.update(this.dt);
    this.fadeTimer += this.dt;
    this.fadeAlpha = Math.max(0, 1 - this.fadeTimer / fadeSeconds);

    if (this.fadeAlpha <= 0) {
      this.fadeAlpha = 0;
      this.mode = "running";
    }
  };

  GameState.prototype.updateAreaFadeOut = function () {
    var fadeSeconds = CONFIG.areaTransitionFadeSeconds || ((CONFIG.surfaceReturnFadeSeconds || CONFIG.resetFadeSeconds) + 0.5);

    this.cat.update(this.dt);
    this.effects.update(this.dt);
    this.fadeTimer += this.dt;
    this.fadeAlpha = Math.min(1, this.fadeTimer / fadeSeconds);

    if (this.fadeAlpha >= 1) {
      if ((this.areaTransitionTarget || "main") === "main") {
        this.applyPendingOreLuck();
      }

      this.resetTerrain(this.areaTransitionTarget || "main", this.areaTransitionSpawn || "");
      this.mode = "areafadein";
      this.fadeTimer = 0;
      this.fadeAlpha = 1;
      this.actionCooldown = CONFIG.moveCooldownMs;
      this.areaTransitionTarget = "";
      this.areaTransitionSpawn = "";
    }
  };

  GameState.prototype.updateAreaFadeIn = function () {
    var fadeSeconds = CONFIG.areaTransitionFadeSeconds || ((CONFIG.surfaceReturnFadeSeconds || CONFIG.resetFadeSeconds) + 0.5);

    this.cat.update(this.dt);
    this.effects.update(this.dt);
    this.fadeTimer += this.dt;
    this.fadeAlpha = Math.max(0, 1 - this.fadeTimer / fadeSeconds);

    if (this.fadeAlpha <= 0) {
      this.fadeAlpha = 0;
      this.mode = "running";
    }
  };

  window.PawsBelow.GameState = GameState;
})();
