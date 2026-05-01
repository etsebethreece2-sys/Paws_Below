(function () {
  "use strict";

  window.PawsBelow = window.PawsBelow || {};

  var CONFIG = window.PawsBelow.CONFIG;

  function InputController(canvas) {
    this.canvas = canvas || null;
    this.queue = [];
    this.clickQueue = [];
    this.pointerX = 0;
    this.pointerY = 0;
    this.pointerInside = false;
    this.held = {};
    this.lastRepeat = 0;
    this.restartRequested = false;
    this.interactRequested = false;
    this.interactHeld = false;
    this.upgradeRequested = false;
    this.storageUpgradeRequested = false;
    this.staminaUpgradeRequested = false;
    this.keyMap = {
      ArrowLeft: [-1, 0],
      KeyA: [-1, 0],
      ArrowDown: [0, 1],
      KeyS: [0, 1],
      ArrowRight: [1, 0],
      KeyD: [1, 0]
    };

    this.bindKeyboard();
    this.bindPointer();
  }

  InputController.prototype.bindKeyboard = function () {
    var self = this;

    window.addEventListener("keydown", function (event) {
      var dir = self.keyMap[event.code];

      if (dir) {
        event.preventDefault();
        self.held[event.code] = dir;

        if (!event.repeat) {
          self.enqueue(dir[0], dir[1], event.code, false);
          self.lastRepeat = event.timeStamp;
        }
      }

      if (event.code === "KeyR") {
        self.restartRequested = true;
      }

      if (event.code === "KeyE" && !event.repeat) {
        event.preventDefault();
        self.interactRequested = true;
      }

      if (event.code === "KeyE") {
        self.interactHeld = true;
      }

      if (event.code === "KeyF" && !event.repeat) {
        event.preventDefault();
        self.upgradeRequested = true;
      }

      if (event.code === "KeyG" && !event.repeat) {
        event.preventDefault();
        self.storageUpgradeRequested = true;
      }

      if (event.code === "KeyH" && !event.repeat) {
        event.preventDefault();
        self.staminaUpgradeRequested = true;
      }
    });

    window.addEventListener("keyup", function (event) {
      var dir = self.keyMap[event.code];
      delete self.held[event.code];

      if (dir) {
        self.clearQueuedRepeats(event.code);
      }

      if (event.code === "KeyE") {
        self.interactHeld = false;
      }
    });
  };

  InputController.prototype.bindPointer = function () {
    var self = this;

    if (!this.canvas) {
      return;
    }

    function updatePointer(event) {
      var rect = self.canvas.getBoundingClientRect();

      self.pointerX = event.clientX - rect.left;
      self.pointerY = event.clientY - rect.top;
      self.pointerInside = self.pointerX >= 0 && self.pointerX <= rect.width && self.pointerY >= 0 && self.pointerY <= rect.height;
    }

    this.canvas.addEventListener("pointermove", function (event) {
      updatePointer(event);
    });

    this.canvas.addEventListener("pointerenter", function (event) {
      updatePointer(event);
      self.pointerInside = true;
    });

    this.canvas.addEventListener("pointerleave", function () {
      self.pointerInside = false;
    });

    this.canvas.addEventListener("pointerdown", function (event) {
      if (typeof event.button === "number" && event.button !== 0) {
        return;
      }

      updatePointer(event);
      self.clickQueue.push({
        x: self.pointerX,
        y: self.pointerY
      });

      if (self.clickQueue.length > 4) {
        self.clickQueue.shift();
      }

      event.preventDefault();
    });
  };

  InputController.prototype.update = function (now) {
    var keys;
    var first;

    if (now - this.lastRepeat < CONFIG.inputRepeatMs) {
      return;
    }

    keys = Object.keys(this.held);

    if (keys.length === 0) {
      return;
    }

    first = this.held[keys[keys.length - 1]];
    this.enqueue(first[0], first[1], keys[keys.length - 1], true);
    this.lastRepeat = now;
  };

  InputController.prototype.enqueue = function (dx, dy, source, repeat) {
    this.queue.push({
      dx: dx,
      dy: dy,
      source: source || "",
      repeat: !!repeat
    });

    if (this.queue.length > 3) {
      this.queue.shift();
    }
  };

  InputController.prototype.clearQueuedRepeats = function (source) {
    this.queue = this.queue.filter(function (dir) {
      return dir.source !== source || !dir.repeat;
    });
  };

  InputController.prototype.consumeDirection = function () {
    return this.queue.shift() || null;
  };

  InputController.prototype.getHorizontalAxis = function () {
    var axis = 0;

    if (this.held.ArrowLeft || this.held.KeyA) {
      axis -= 1;
    }

    if (this.held.ArrowRight || this.held.KeyD) {
      axis += 1;
    }

    return axis;
  };

  InputController.prototype.clearHorizontalDirections = function () {
    this.queue = this.queue.filter(function (dir) {
      return dir.dx === 0;
    });
  };

  InputController.prototype.consumeRestart = function () {
    var requested = this.restartRequested;
    this.restartRequested = false;
    return requested;
  };

  InputController.prototype.consumeInteract = function () {
    var requested = this.interactRequested;
    this.interactRequested = false;
    return requested;
  };

  InputController.prototype.isInteractHeld = function () {
    return !!this.interactHeld;
  };

  InputController.prototype.consumeClick = function () {
    return this.clickQueue.shift() || null;
  };

  InputController.prototype.getPointerPosition = function () {
    return {
      x: this.pointerX,
      y: this.pointerY,
      inside: !!this.pointerInside
    };
  };

  InputController.prototype.consumeUpgrade = function () {
    var requested = this.upgradeRequested;
    this.upgradeRequested = false;
    return requested;
  };

  InputController.prototype.consumeStorageUpgrade = function () {
    var requested = this.storageUpgradeRequested;
    this.storageUpgradeRequested = false;
    return requested;
  };

  InputController.prototype.consumeStaminaUpgrade = function () {
    var requested = this.staminaUpgradeRequested;
    this.staminaUpgradeRequested = false;
    return requested;
  };

  window.PawsBelow.InputController = InputController;
})();
