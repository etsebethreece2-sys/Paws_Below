(function () {
  "use strict";

  window.addEventListener("DOMContentLoaded", function () {
    var ns = window.PawsBelow;
    var canvas = document.getElementById("gameCanvas");
    var input = new ns.InputController(canvas);
    var ui = new ns.UI({
      energyFill: document.getElementById("energyFill"),
      dayHud: document.getElementById("dayHud"),
      fpsCounter: document.getElementById("fpsCounter"),
      depthValue: document.getElementById("depthValue"),
      oreInventoryHud: document.getElementById("oreInventoryHud"),
      dirtInventoryValue: document.getElementById("dirtInventoryValue"),
      pebbliteInventoryValue: document.getElementById("pebbliteInventoryValue"),
      pebbliteInventoryLock: document.getElementById("pebbliteInventoryLock"),
      coalclumpInventoryValue: document.getElementById("coalclumpInventoryValue"),
      coalclumpInventoryLock: document.getElementById("coalclumpInventoryLock"),
      copperpawInventoryValue: document.getElementById("copperpawInventoryValue"),
      copperpawInventoryLock: document.getElementById("copperpawInventoryLock"),
      inventorySpaceHud: document.getElementById("inventorySpaceHud"),
      inventorySpaceValue: document.getElementById("inventorySpaceValue"),
      settingsButton: document.getElementById("settingsButton"),
      settingsMenu: document.getElementById("settingsMenu"),
      ambienceVolumeSlider: document.getElementById("ambienceVolumeSlider"),
      effectsVolumeSlider: document.getElementById("effectsVolumeSlider"),
      diggingVolumeSlider: document.getElementById("diggingVolumeSlider"),
      infiniteCoinsToggle: document.getElementById("infiniteCoinsToggle"),
      fadeOverlay: document.getElementById("fadeOverlay"),
      surfaceButton: document.getElementById("surfaceButton"),
      sellButton: document.getElementById("sellButton"),
      sellValue: document.getElementById("sellValue")
    });
    var game = new ns.GameState({
      canvas: canvas,
      input: input,
      ui: ui
    });

    ui.bindSurfaceButton(function () {
      game.returnToSurface();
    });

    ui.bindSellButton(function () {
      game.sellDirt();
    });

    ui.bindSettings(game.audio);
    ui.bindInfiniteCoins(function (enabled) {
      game.setInfiniteCoins(enabled);
    });

    game.start();
  });
})();
