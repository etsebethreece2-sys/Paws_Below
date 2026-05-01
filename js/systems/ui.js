(function () {
  "use strict";

  window.PawsBelow = window.PawsBelow || {};

  var CONFIG = window.PawsBelow.CONFIG;

  function UI(elements) {
    this.energyFill = elements.energyFill;
    this.energyHud = this.energyFill && this.energyFill.parentElement &&
      this.energyFill.parentElement.parentElement ?
      this.energyFill.parentElement.parentElement.parentElement :
      null;
    this.dayHud = elements.dayHud;
    this.fpsCounter = elements.fpsCounter;
    this.depthValue = elements.depthValue;
    this.depthHud = this.depthValue ? this.depthValue.parentElement : null;
    this.oreInventoryHud = elements.oreInventoryHud;
    this.dirtInventoryValue = elements.dirtInventoryValue;
    this.pebbliteInventoryValue = elements.pebbliteInventoryValue;
    this.pebbliteInventoryLock = elements.pebbliteInventoryLock;
    this.coalclumpInventoryValue = elements.coalclumpInventoryValue;
    this.coalclumpInventoryLock = elements.coalclumpInventoryLock;
    this.copperpawInventoryValue = elements.copperpawInventoryValue;
    this.copperpawInventoryLock = elements.copperpawInventoryLock;
    this.inventorySpaceHud = elements.inventorySpaceHud;
    this.inventorySpaceValue = elements.inventorySpaceValue;
    this.settingsButton = elements.settingsButton;
    this.settingsMenu = elements.settingsMenu;
    this.ambienceVolumeSlider = elements.ambienceVolumeSlider;
    this.effectsVolumeSlider = elements.effectsVolumeSlider;
    this.diggingVolumeSlider = elements.diggingVolumeSlider;
    this.infiniteCoinsToggle = elements.infiniteCoinsToggle;
    this.fadeOverlay = elements.fadeOverlay;
    this.surfaceButton = elements.surfaceButton;
    this.sellButton = elements.sellButton;
    this.sellValue = elements.sellValue;
    this.fpsElapsed = 0;
    this.fpsFrames = 0;
    this.settingsOpen = false;
  }

  UI.prototype.bindSurfaceButton = function (handler) {
    if (!this.surfaceButton) {
      return;
    }

    this.surfaceButton.addEventListener("click", function (event) {
      event.preventDefault();
      handler();
    });
  };

  UI.prototype.bindSellButton = function (handler) {
    if (!this.sellButton) {
      return;
    }

    this.sellButton.addEventListener("click", function (event) {
      event.preventDefault();
      handler();
    });
  };

  UI.prototype.bindSettings = function (audio) {
    var self = this;

    if (this.settingsButton) {
      this.settingsButton.addEventListener("click", function (event) {
        event.preventDefault();
        self.setSettingsOpen(!self.settingsOpen);
      });
    }

    function bindSlider(slider, setter) {
      if (!slider || !audio || typeof audio[setter] !== "function") {
        return;
      }

      slider.addEventListener("input", function () {
        audio[setter](Number(slider.value) / 100);
      });

      audio[setter](Number(slider.value) / 100);
    }

    bindSlider(this.ambienceVolumeSlider, "setAmbienceVolume");
    bindSlider(this.effectsVolumeSlider, "setEffectsVolume");
    bindSlider(this.diggingVolumeSlider, "setDiggingVolume");
  };

  UI.prototype.bindInfiniteCoins = function (handler) {
    var toggle = this.infiniteCoinsToggle;

    if (!toggle || typeof handler !== "function") {
      return;
    }

    toggle.addEventListener("change", function () {
      handler(!!toggle.checked);
    });

    handler(!!toggle.checked);
  };

  UI.prototype.setSettingsOpen = function (open) {
    this.settingsOpen = !!open;

    if (this.settingsMenu) {
      this.settingsMenu.hidden = !this.settingsOpen;
    }

    if (this.settingsButton) {
      this.settingsButton.setAttribute("aria-expanded", this.settingsOpen ? "true" : "false");
      this.settingsButton.classList.toggle("is-open", this.settingsOpen);
    }
  };

  UI.prototype.update = function (state) {
    var maxEnergy = state.getMaxEnergy ? state.getMaxEnergy() : (CONFIG.maxEnergy || 100);
    var energyPercent = Math.max(0, Math.round((state.cat.energy / maxEnergy) * 100));
    var depth = state.cat.depth(state.world);
    var sellValue = state.getSellValue ? state.getSellValue() : (state.dirtBlocksDug || 0);
    var canSell = state.canSellDirt ? state.canSellDirt() : depth === 0;
    var canUseButtons = state.mode === "running";
    var hideHud = state.menuState !== "done" ||
      (state.isUpgradeUIActive && state.isUpgradeUIActive()) ||
      (state.isLuckUIActive && state.isLuckUIActive()) ||
      (state.isCompendiumUIActive && state.isCompendiumUIActive()) ||
      (state.isBlacksmithUIActive && state.isBlacksmithUIActive());
    this.energyFill.style.width = energyPercent + "%";
    this.depthValue.textContent = depth;

    if (this.energyHud) {
      this.energyHud.style.opacity = !hideHud && depth >= 1 ? "1" : "0";
    }

    if (this.fpsCounter) {
      this.fpsCounter.style.opacity = hideHud ? "0" : "1";
      this.fpsElapsed += state.dt || 0;
      this.fpsFrames += 1;

      if (this.fpsElapsed >= 0.25) {
        this.fpsCounter.textContent = "FPS " + Math.round(this.fpsFrames / this.fpsElapsed);
        this.fpsElapsed = 0;
        this.fpsFrames = 0;
      }
    }

    if (this.dayHud && state.getDayName) {
      this.dayHud.style.opacity = hideHud ? "0" : "1";
      this.dayHud.textContent = state.getDayName();
      this.dayHud.classList.toggle("is-rainy", !!(state.isRainyDay && state.isRainyDay()));
    }

    if (this.oreInventoryHud) {
      this.oreInventoryHud.style.opacity = !hideHud && depth >= 2 ? "1" : "0";
    }

    if (this.dirtInventoryValue) {
      this.dirtInventoryValue.textContent = state.dirtBlocksDug || 0;
    }

    if (this.pebbliteInventoryValue) {
      this.pebbliteInventoryValue.style.display = state.pebbliteDiscovered ? "block" : "none";
      this.pebbliteInventoryValue.textContent = state.pebbliteBlocksDug || 0;
    }

    if (this.coalclumpInventoryValue) {
      this.coalclumpInventoryValue.style.display = state.coalclumpDiscovered ? "block" : "none";
      this.coalclumpInventoryValue.textContent = state.coalclumpBlocksDug || 0;
    }

    if (this.copperpawInventoryValue) {
      this.copperpawInventoryValue.style.display = state.copperpawDiscovered ? "block" : "none";
      this.copperpawInventoryValue.textContent = state.copperpawBlocksDug || 0;
    }

    if (this.pebbliteInventoryLock) {
      this.pebbliteInventoryLock.classList.toggle("is-unlocked", !!state.pebbliteDiscovered);
    }

    if (this.coalclumpInventoryLock) {
      this.coalclumpInventoryLock.classList.toggle("is-unlocked", !!state.coalclumpDiscovered);
    }

    if (this.copperpawInventoryLock) {
      this.copperpawInventoryLock.classList.toggle("is-unlocked", !!state.copperpawDiscovered);
    }

    if (this.inventorySpaceHud) {
      this.inventorySpaceHud.style.opacity = !hideHud && depth >= 2 ? "1" : "0";
    }

    if (this.inventorySpaceValue) {
      this.inventorySpaceValue.textContent = state.getInventorySpaceLeft ?
        state.getInventorySpaceLeft() :
        Math.max(0, (CONFIG.dirtCarryCapacity || 5) - (state.dirtBlocksDug || 0));
    }

    if (this.surfaceButton) {
      this.surfaceButton.hidden = hideHud || depth < 1 || !canUseButtons;
    }

    if (this.sellButton) {
      this.sellButton.hidden = hideHud || !canSell || !sellValue || !canUseButtons;
    }

    if (this.sellValue) {
      this.sellValue.hidden = hideHud || !canSell || !sellValue || !canUseButtons;
      this.sellValue.textContent = "Value: " + sellValue;
    }

    if (this.depthHud) {
      this.depthHud.hidden = false;
      this.depthHud.style.opacity = !hideHud && depth >= 2 ? "1" : "0";
    }

    if (this.settingsButton) {
      this.settingsButton.hidden = hideHud;
    }

    if (hideHud && this.settingsOpen) {
      this.setSettingsOpen(false);
    }

    if (this.fadeOverlay) {
      this.fadeOverlay.style.opacity = state.fadeAlpha;
    }
  };

  window.PawsBelow.UI = UI;
})();
