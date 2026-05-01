(function () {
  "use strict";

  window.PawsBelow = window.PawsBelow || {};

  var Renderer = window.PawsBelow.Renderer;
  var CONFIG = window.PawsBelow.CONFIG;

  if (!Renderer) {
    return;
  }

  Renderer.prototype.loadAssets = function () {
    var self = this;
    var cloudSrcs = CONFIG.cloudSpriteSrcs || [];
    var staminaSrcs = CONFIG.staminaUpgradeUISpriteSrcs || [];
    var luckFlowerSrcs = CONFIG.luckFlowerSpriteSrcs || [];
    var bugSrcs = CONFIG.bugSpriteSrcs || [];
    var pickaxeUpgrades = CONFIG.pickaxeUpgrades || [];
    var pickaxeLoadCount = 0;
    var j;

    for (j = 0; j < pickaxeUpgrades.length; j += 1) {
      if (pickaxeUpgrades[j] && pickaxeUpgrades[j].iconSrc) {
        pickaxeLoadCount += 1;
      }
    }

    if (this.assetsReady) {
      return Promise.resolve();
    }

    return new Promise(function (resolve, reject) {
      var remaining = 39 + pickaxeLoadCount + staminaSrcs.length + cloudSrcs.length + luckFlowerSrcs.length + bugSrcs.length;
      var failed = false;
      var i;
      var cloud;
      var staminaImage;
      var flowerImage;
      var bugImage;

      function markReady() {
        remaining -= 1;

        if (remaining === 0 && !failed) {
          self.assetsReady = true;
          resolve();
        }
      }

      function fail(src) {
        if (!failed) {
          failed = true;
          reject(new Error("Could not load " + src));
        }
      }

      self.catSprite.onload = function () {
        self.catSpriteBounds = self.findImageBounds(self.catSprite);
        markReady();
      };

      self.catSprite.onerror = function () {
        fail(CONFIG.catSpriteSrc);
      };

      self.catIdleSprite.onload = function () {
        self.catIdleFrames = self.createSpriteSheetFrames(
          self.catIdleSprite,
          CONFIG.catIdleFrameColumns,
          CONFIG.catIdleFrameRows,
          CONFIG.catIdleFrameCount
        );
        markReady();
      };

      self.catIdleSprite.onerror = function () {
        fail(CONFIG.catIdleSpriteSrc);
      };

      self.catRunSprite.onload = function () {
        self.catRunFrames = self.createSpriteSheetFrames(
          self.catRunSprite,
          CONFIG.catRunFrameColumns,
          CONFIG.catRunFrameRows,
          CONFIG.catRunFrameCount
        );
        markReady();
      };

      self.catRunSprite.onerror = function () {
        fail(CONFIG.catRunSpriteSrc);
      };

      self.dirtSprite.onload = function () {
        markReady();
      };

      self.dirtSprite.onerror = function () {
        fail(CONFIG.dirtSpriteSrc);
      };

      self.pebbliteSprite.onload = function () {
        markReady();
      };

      self.pebbliteSprite.onerror = function () {
        fail(CONFIG.pebbliteSpriteSrc);
      };

      self.coalclumpSprite.onload = function () {
        markReady();
      };

      self.coalclumpSprite.onerror = function () {
        fail(CONFIG.coalclumpSpriteSrc);
      };

      self.copperpawSprite.onload = function () {
        markReady();
      };

      self.copperpawSprite.onerror = function () {
        fail(CONFIG.copperpawSpriteSrc);
      };

      self.grassSprite.onload = function () {
        self.grassForegroundSprite = self.createForegroundGrassSprite(self.grassSprite);
        markReady();
      };

      self.grassSprite.onerror = function () {
        fail(CONFIG.grassSpriteSrc);
      };

      self.currencyUISprite.onload = function () {
        self.currencyUISpriteBounds = self.findImageBounds(self.currencyUISprite);
        markReady();
      };

      self.currencyUISprite.onerror = function () {
        fail(CONFIG.currencyUISpriteSrc);
      };

      self.cabinSprite.onload = function () {
        self.cabinSpriteBounds = self.findImageBounds(self.cabinSprite);
        markReady();
      };

      self.cabinSprite.onerror = function () {
        fail(CONFIG.cabinSpriteSrc);
      };

      self.scratchingPostSprite.onload = function () {
        self.scratchingPostSpriteBounds = self.findImageBounds(self.scratchingPostSprite);
        markReady();
      };

      self.scratchingPostSprite.onerror = function () {
        fail(CONFIG.scratchingPostSpriteSrc);
      };

      self.blacksmithSprite.onload = function () {
        self.blacksmithSpriteBounds = self.findImageBounds(self.blacksmithSprite);
        markReady();
      };

      self.blacksmithSprite.onerror = function () {
        fail(CONFIG.blacksmithSpriteSrc);
      };

      self.auntSandersSprite.onload = function () {
        self.auntSandersSpriteBounds = self.findImageBounds(self.auntSandersSprite);
        markReady();
      };

      self.auntSandersSprite.onerror = function () {
        self.auntSandersSpriteBounds = null;
        markReady();
      };

      self.blacksmithMenuBackgroundSprite.onload = function () {
        self.blacksmithMenuBackgroundSpriteBounds = {
          x: 0,
          y: 0,
          width: self.blacksmithMenuBackgroundSprite.naturalWidth || self.blacksmithMenuBackgroundSprite.width,
          height: self.blacksmithMenuBackgroundSprite.naturalHeight || self.blacksmithMenuBackgroundSprite.height
        };
        markReady();
      };

      self.blacksmithMenuBackgroundSprite.onerror = function () {
        self.blacksmithMenuBackgroundSpriteBounds = null;
        markReady();
      };

      self.museumSprite.onload = function () {
        self.museumSpriteBounds = self.findImageBounds(self.museumSprite);
        markReady();
      };

      self.museumSprite.onerror = function () {
        fail(CONFIG.museumSpriteSrc);
      };

      self.orphanageSprite.onload = function () {
        self.orphanageSpriteBounds = self.findImageBounds(self.orphanageSprite);
        markReady();
      };

      self.orphanageSprite.onerror = function () {
        fail(CONFIG.orphanageSpriteSrc);
      };

      self.outhouseSprite.onload = function () {
        self.outhouseSpriteBounds = self.findImageBounds(self.outhouseSprite);
        markReady();
      };

      self.outhouseSprite.onerror = function () {
        fail(CONFIG.outhouseSpriteSrc);
      };

      self.compendiumSprite.onload = function () {
        self.compendiumSpriteBounds = self.findImageBounds(self.compendiumSprite);
        markReady();
      };

      self.compendiumSprite.onerror = function () {
        fail(CONFIG.compendiumSpriteSrc);
      };

      self.upgradeUISprite.onload = function () {
        self.upgradeUISpriteBounds = self.findImageBounds(self.upgradeUISprite);
        markReady();
      };

      self.upgradeUISprite.onerror = function () {
        fail(CONFIG.upgradeUISpriteSrc);
      };

      self.upgradedUpgradeUISprite.onload = function () {
        self.upgradedUpgradeUISpriteBounds = self.findImageBounds(self.upgradedUpgradeUISprite);
        markReady();
      };

      self.upgradedUpgradeUISprite.onerror = function () {
        fail(CONFIG.upgradedUpgradeUISpriteSrc);
      };

      self.toughUpgradeUISprite.onload = function () {
        self.toughUpgradeUISpriteBounds = self.findImageBounds(self.toughUpgradeUISprite);
        markReady();
      };

      self.toughUpgradeUISprite.onerror = function () {
        fail(CONFIG.toughUpgradeUISpriteSrc);
      };

      self.maxUpgradeUISprite.onload = function () {
        self.maxUpgradeUISpriteBounds = self.findImageBounds(self.maxUpgradeUISprite);
        markReady();
      };

      self.maxUpgradeUISprite.onerror = function () {
        fail(CONFIG.maxUpgradeUISpriteSrc);
      };

      self.diggaUpgradeUISprite.onload = function () {
        self.diggaUpgradeUISpriteBounds = self.findImageBounds(self.diggaUpgradeUISprite);
        markReady();
      };

      self.diggaUpgradeUISprite.onerror = function () {
        fail(CONFIG.diggaUpgradeUISpriteSrc);
      };

      self.fannyUpgradeUISprite.onload = function () {
        self.fannyUpgradeUISpriteBounds = self.findImageBounds(self.fannyUpgradeUISprite);
        markReady();
      };

      self.fannyUpgradeUISprite.onerror = function () {
        fail(CONFIG.fannyUpgradeUISpriteSrc);
      };

      self.bucketUpgradeUISprite.onload = function () {
        self.bucketUpgradeUISpriteBounds = self.findImageBounds(self.bucketUpgradeUISprite);
        markReady();
      };

      self.bucketUpgradeUISprite.onerror = function () {
        fail(CONFIG.bucketUpgradeUISpriteSrc);
      };

      self.backpackUpgradeUISprite.onload = function () {
        self.backpackUpgradeUISpriteBounds = self.findImageBounds(self.backpackUpgradeUISprite);
        markReady();
      };

      self.backpackUpgradeUISprite.onerror = function () {
        fail(CONFIG.backpackUpgradeUISpriteSrc);
      };

      self.crateUpgradeUISprite.onload = function () {
        self.crateUpgradeUISpriteBounds = self.findImageBounds(self.crateUpgradeUISprite);
        markReady();
      };

      self.crateUpgradeUISprite.onerror = function () {
        fail(CONFIG.crateUpgradeUISpriteSrc);
      };

      self.duffelUpgradeUISprite.onload = function () {
        self.duffelUpgradeUISpriteBounds = self.findImageBounds(self.duffelUpgradeUISprite);
        markReady();
      };

      self.duffelUpgradeUISprite.onerror = function () {
        fail(CONFIG.duffelUpgradeUISpriteSrc);
      };

      self.treasureChestUpgradeUISprite.onload = function () {
        self.treasureChestUpgradeUISpriteBounds = self.findImageBounds(self.treasureChestUpgradeUISprite);
        markReady();
      };

      self.treasureChestUpgradeUISprite.onerror = function () {
        fail(CONFIG.treasureChestUpgradeUISpriteSrc);
      };

      self.signSprite.onload = function () {
        self.signSpriteBounds = self.findImageBounds(self.signSprite);
        markReady();
      };

      self.signSprite.onerror = function () {
        fail(CONFIG.signSpriteSrc);
      };

      self.tabbySprite.onload = function () {
        self.tabbySpriteBounds = self.findImageBounds(self.tabbySprite);
        markReady();
      };

      self.tabbySprite.onerror = function () {
        fail(CONFIG.tabbySpriteSrc);
      };

      self.treeSprite.onload = function () {
        self.treeSpriteBounds = self.findImageBounds(self.treeSprite);
        markReady();
      };

      self.treeSprite.onerror = function () {
        self.treeSpriteBounds = null;
        markReady();
      };

      self.textboardSprite.onload = function () {
        self.textboardSpriteBounds = self.findImageBounds(self.textboardSprite);
        markReady();
      };

      self.textboardSprite.onerror = function () {
        fail(CONFIG.textboardSpriteSrc);
      };

      self.skyboxSprite.onload = function () {
        self.skyboxSpriteBounds = {
          x: 0,
          y: 0,
          width: self.skyboxSprite.naturalWidth || self.skyboxSprite.width,
          height: self.skyboxSprite.naturalHeight || self.skyboxSprite.height
        };
        markReady();
      };

      self.skyboxSprite.onerror = function () {
        fail(CONFIG.skyboxSpriteSrc);
      };

      self.mainMenuSprite.onload = function () {
        self.mainMenuSpriteBounds = {
          x: 0,
          y: 0,
          width: self.mainMenuSprite.naturalWidth || self.mainMenuSprite.width,
          height: self.mainMenuSprite.naturalHeight || self.mainMenuSprite.height
        };
        markReady();
      };

      self.mainMenuSprite.onerror = function () {
        fail(CONFIG.mainMenuSpriteSrc);
      };

      self.upgradeMenuBackgroundSprite.onload = function () {
        self.upgradeMenuBackgroundSpriteBounds = {
          x: 0,
          y: 0,
          width: self.upgradeMenuBackgroundSprite.naturalWidth || self.upgradeMenuBackgroundSprite.width,
          height: self.upgradeMenuBackgroundSprite.naturalHeight || self.upgradeMenuBackgroundSprite.height
        };
        markReady();
      };

      self.upgradeMenuBackgroundSprite.onerror = function () {
        fail(CONFIG.upgradeMenuBackgroundSrc);
      };

      self.luckBackgroundSprite.onload = function () {
        self.luckBackgroundSpriteBounds = {
          x: 0,
          y: 0,
          width: self.luckBackgroundSprite.naturalWidth || self.luckBackgroundSprite.width,
          height: self.luckBackgroundSprite.naturalHeight || self.luckBackgroundSprite.height
        };
        markReady();
      };

      self.luckBackgroundSprite.onerror = function () {
        fail(CONFIG.luckBackgroundSpriteSrc);
      };

      self.shrineSprite.onload = function () {
        self.shrineSpriteBounds = self.findImageBounds(self.shrineSprite);
        markReady();
      };

      self.shrineSprite.onerror = function () {
        fail(CONFIG.shrineSpriteSrc);
      };

      self.luckUISprite.onload = function () {
        self.luckUISpriteBounds = self.findImageBounds(self.luckUISprite);
        markReady();
      };

      self.luckUISprite.onerror = function () {
        fail(CONFIG.luckUISpriteSrc);
      };

      self.staminaUpgradeUISprites = [];
      self.staminaUpgradeUISpriteBounds = [];
      self.pickaxeUpgradeSprites = [];
      self.pickaxeUpgradeSpriteBounds = [];

      for (i = 0; i < pickaxeUpgrades.length; i += 1) {
        if (!pickaxeUpgrades[i] || !pickaxeUpgrades[i].iconSrc) {
          self.pickaxeUpgradeSprites.push(null);
          self.pickaxeUpgradeSpriteBounds.push(null);
          continue;
        }

        staminaImage = new Image();
        self.pickaxeUpgradeSprites.push(staminaImage);
        self.pickaxeUpgradeSpriteBounds.push(null);

        staminaImage.onload = (function (image, index) {
          return function () {
            self.pickaxeUpgradeSpriteBounds[index] = self.findImageBounds(image);
            markReady();
          };
        }(staminaImage, i));

        staminaImage.onerror = function () {
          markReady();
        };

        staminaImage.src = pickaxeUpgrades[i].iconSrc;
      }

      for (i = 0; i < staminaSrcs.length; i += 1) {
        staminaImage = new Image();
        self.staminaUpgradeUISprites.push(staminaImage);
        self.staminaUpgradeUISpriteBounds.push(null);

        staminaImage.onload = (function (image, index) {
          return function () {
            self.staminaUpgradeUISpriteBounds[index] = self.findImageBounds(image);
            markReady();
          };
        }(staminaImage, i));

        staminaImage.onerror = function () {
          markReady();
        };

        staminaImage.src = staminaSrcs[i];
      }

      self.luckFlowerSprites = [];
      self.luckFlowerSpriteBounds = [];

      for (i = 0; i < luckFlowerSrcs.length; i += 1) {
        flowerImage = new Image();
        self.luckFlowerSprites.push(flowerImage);
        self.luckFlowerSpriteBounds.push(null);

        flowerImage.onload = (function (image, index) {
          return function () {
            self.luckFlowerSpriteBounds[index] = self.findImageBounds(image);
            markReady();
          };
        }(flowerImage, i));

        flowerImage.onerror = function () {
          markReady();
        };

        flowerImage.src = luckFlowerSrcs[i];
      }

      self.bugSprites = [];
      self.bugSpriteBounds = [];

      for (i = 0; i < bugSrcs.length; i += 1) {
        bugImage = new Image();
        self.bugSprites.push(bugImage);
        self.bugSpriteBounds.push(null);

        bugImage.onload = (function (image, index) {
          return function () {
            self.bugSpriteBounds[index] = self.findImageBounds(image);
            markReady();
          };
        }(bugImage, i));

        bugImage.onerror = function () {
          markReady();
        };

        bugImage.src = bugSrcs[i];
      }

      self.catSprite.src = CONFIG.catSpriteSrc;
      self.catIdleSprite.src = CONFIG.catIdleSpriteSrc;
      self.catRunSprite.src = CONFIG.catRunSpriteSrc;
      self.dirtSprite.src = CONFIG.dirtSpriteSrc;
      self.pebbliteSprite.src = CONFIG.pebbliteSpriteSrc;
      self.coalclumpSprite.src = CONFIG.coalclumpSpriteSrc;
      self.copperpawSprite.src = CONFIG.copperpawSpriteSrc;
      self.grassSprite.src = CONFIG.grassSpriteSrc;
      self.currencyUISprite.src = CONFIG.currencyUISpriteSrc;
      self.cabinSprite.src = CONFIG.cabinSpriteSrc;
      self.scratchingPostSprite.src = CONFIG.scratchingPostSpriteSrc;
      self.blacksmithSprite.src = CONFIG.blacksmithSpriteSrc;
      self.auntSandersSprite.src = CONFIG.auntSandersSpriteSrc;
      self.blacksmithMenuBackgroundSprite.src = CONFIG.blacksmithMenuBackgroundSrc;
      self.museumSprite.src = CONFIG.museumSpriteSrc;
      self.orphanageSprite.src = CONFIG.orphanageSpriteSrc;
      self.outhouseSprite.src = CONFIG.outhouseSpriteSrc;
      self.compendiumSprite.src = CONFIG.compendiumSpriteSrc;
      self.upgradeUISprite.src = CONFIG.upgradeUISpriteSrc;
      self.upgradedUpgradeUISprite.src = CONFIG.upgradedUpgradeUISpriteSrc;
      self.toughUpgradeUISprite.src = CONFIG.toughUpgradeUISpriteSrc;
      self.maxUpgradeUISprite.src = CONFIG.maxUpgradeUISpriteSrc;
      self.diggaUpgradeUISprite.src = CONFIG.diggaUpgradeUISpriteSrc;
      self.fannyUpgradeUISprite.src = CONFIG.fannyUpgradeUISpriteSrc;
      self.bucketUpgradeUISprite.src = CONFIG.bucketUpgradeUISpriteSrc;
      self.backpackUpgradeUISprite.src = CONFIG.backpackUpgradeUISpriteSrc;
      self.crateUpgradeUISprite.src = CONFIG.crateUpgradeUISpriteSrc;
      self.duffelUpgradeUISprite.src = CONFIG.duffelUpgradeUISpriteSrc;
      self.treasureChestUpgradeUISprite.src = CONFIG.treasureChestUpgradeUISpriteSrc;
      self.signSprite.src = CONFIG.signSpriteSrc;
      self.tabbySprite.src = CONFIG.tabbySpriteSrc;
      self.treeSprite.src = CONFIG.treeSpriteSrc;
      self.textboardSprite.src = CONFIG.textboardSpriteSrc;
      self.skyboxSprite.src = CONFIG.skyboxSpriteSrc;
      self.mainMenuSprite.src = CONFIG.mainMenuSpriteSrc;
      self.upgradeMenuBackgroundSprite.src = CONFIG.upgradeMenuBackgroundSrc;
      self.luckBackgroundSprite.src = CONFIG.luckBackgroundSpriteSrc;
      self.shrineSprite.src = CONFIG.shrineSpriteSrc;
      self.luckUISprite.src = CONFIG.luckUISpriteSrc;

      self.cloudSprites = [];
      self.cloudSpriteBounds = [];

      for (i = 0; i < cloudSrcs.length; i += 1) {
        cloud = new Image();
        self.cloudSprites.push(cloud);
        self.cloudSpriteBounds.push(null);

        cloud.onload = (function (image, index) {
          return function () {
            var sprite = self.createCloudSprite(image);

            self.cloudSprites[index] = sprite;
            self.cloudSpriteBounds[index] = self.findImageBounds(sprite);
            markReady();
          };
        })(cloud, i);

        cloud.onerror = (function (src) {
          return function () {
            fail(src);
          };
        })(cloudSrcs[i]);

        cloud.src = cloudSrcs[i];
      }
    });
  };

  Renderer.prototype.createCloudSprite = function (image) {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var width = image.naturalWidth || image.width;
    var height = image.naturalHeight || image.height;
    var imageData;
    var data;
    var i;
    var r;
    var g;
    var b;
    var a;
    var isCloud;
    var isSky;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0);

    try {
      imageData = ctx.getImageData(0, 0, width, height);
    } catch (error) {
      return image;
    }

    data = imageData.data;

    for (i = 0; i < data.length; i += 4) {
      r = data[i];
      g = data[i + 1];
      b = data[i + 2];
      a = data[i + 3];
      isCloud = r > 175 && g > 175 && b > 175 && Math.abs(r - g) < 70;
      isSky = a > 0 && b > 165 && g > 95 && b - r > 35 && !isCloud;

      if (isSky) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };

  Renderer.prototype.findImageBounds = function (image) {
    var width = image.naturalWidth || image.width;
    var height = image.naturalHeight || image.height;

    return {
      x: 0,
      y: 0,
      width: width,
      height: height
    };
  };

  Renderer.prototype.createSpriteSheetFrames = function (image, columns, rows, count) {
    var frameWidth = Math.floor((image.naturalWidth || image.width) / columns);
    var frameHeight = Math.floor((image.naturalHeight || image.height) / rows);
    var frames = [];
    var limit = Math.min(count || columns * rows, columns * rows);
    var i;
    var cellX;
    var cellY;
    var bounds;
    var maxFrameHeight = 1;
    var maxFrameBottom = 1;
    var frame;

    for (i = 0; i < limit; i += 1) {
      cellX = (i % columns) * frameWidth;
      cellY = Math.floor(i / columns) * frameHeight;
      bounds = this.findImageBoundsInRect(image, cellX, cellY, frameWidth, frameHeight);
      frame = {
        x: cellX + bounds.x,
        y: cellY + bounds.y,
        width: bounds.width,
        height: bounds.height,
        offsetX: bounds.x,
        offsetY: bounds.y,
        cellWidth: frameWidth,
        cellHeight: frameHeight
      };
      frames.push(frame);
      maxFrameHeight = Math.max(maxFrameHeight, frame.height);
      maxFrameBottom = Math.max(maxFrameBottom, frame.offsetY + frame.height);
    }

    for (i = 0; i < frames.length; i += 1) {
      frames[i].baseHeight = maxFrameHeight;
      frames[i].baseBottom = maxFrameBottom;
    }

    return frames;
  };

  Renderer.prototype.findImageBoundsInRect = function (image, sx, sy, width, height) {
    return {
      x: 0,
      y: 0,
      width: width,
      height: height
    };
  };

  Renderer.prototype.createForegroundGrassSprite = function (image) {
    var sourceWidth = image.naturalWidth || image.width;
    var sourceHeight = image.naturalHeight || image.height;
    var cropY = Math.floor(sourceHeight * 0.38);
    var cropHeight = Math.floor(sourceHeight * 0.28);
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var imageData;
    var data;
    var i;
    var y;
    var r;
    var g;
    var b;
    var alpha;
    var brightness;
    var chroma;
    var keep;
    var fade;

    canvas.width = sourceWidth;
    canvas.height = cropHeight;
    ctx.drawImage(image, 0, cropY, sourceWidth, cropHeight, 0, 0, sourceWidth, cropHeight);

    try {
      imageData = ctx.getImageData(0, 0, sourceWidth, cropHeight);
    } catch (error) {
      return canvas;
    }

    data = imageData.data;

    for (i = 0; i < data.length; i += 4) {
      y = Math.floor(i / 4 / sourceWidth);
      r = data[i];
      g = data[i + 1];
      b = data[i + 2];
      alpha = data[i + 3];
      brightness = (r + g + b) / 3;
      chroma = Math.max(r, g, b) - Math.min(r, g, b);
      keep = y > cropHeight * 0.54 || brightness < 118 || chroma > 48;

      if (!keep) {
        data[i + 3] = 0;
        continue;
      }

      fade = Math.max(0, Math.min(1, (y - cropHeight * 0.08) / (cropHeight * 0.28)));
      data[i + 3] = Math.round(alpha * Math.max(0.25, fade));
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };
})();
