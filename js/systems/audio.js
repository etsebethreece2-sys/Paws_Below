(function () {
  "use strict";

  window.PawsBelow = window.PawsBelow || {};

  var CONFIG = window.PawsBelow.CONFIG;

  function AudioSystem() {
    this.context = null;
    this.enabled = true;
    this.surfaceAmbience = null;
    this.surfaceAmbienceWanted = false;
    this.surfaceAmbienceStarted = false;
    this.rainAmbience = null;
    this.rainAmbienceWanted = false;
    this.luckAmbience = null;
    this.luckAmbienceWanted = false;
    this.mainMenuMusic = null;
    this.mainMenuMusicWanted = false;
    this.backToSurfaceSound = null;
    this.doorOpenSound = null;
    this.doorCloseSound = null;
    this.luckUpgradeSound = null;
    this.rockBreakPool = [];
    this.rockBreakPoolIndex = 0;
    this.ambienceVolumeScale = typeof CONFIG.ambienceVolumeScale === "number" ? CONFIG.ambienceVolumeScale : 1;
    this.effectsVolumeScale = typeof CONFIG.effectsVolumeScale === "number" ? CONFIG.effectsVolumeScale : 1;
    this.diggingVolumeScale = typeof CONFIG.diggingVolumeScale === "number" ? CONFIG.diggingVolumeScale : 1;
  }

  AudioSystem.prototype.clampVolume = function (value) {
    return Math.max(0, Math.min(1, Number(value) || 0));
  };

  AudioSystem.prototype.setAmbienceVolume = function (value) {
    this.ambienceVolumeScale = this.clampVolume(value);

    if (this.mainMenuMusic) {
      this.mainMenuMusic.volume = (CONFIG.mainMenuMusicVolume || 0.46) * this.ambienceVolumeScale;
    }
  };

  AudioSystem.prototype.setEffectsVolume = function (value) {
    this.effectsVolumeScale = this.clampVolume(value);

    if (this.backToSurfaceSound) {
      this.backToSurfaceSound.volume = CONFIG.backToSurfaceSoundVolume * this.effectsVolumeScale;
    }

    if (this.doorOpenSound) {
      this.doorOpenSound.volume = (CONFIG.doorOpenSoundVolume || CONFIG.doorSoundVolume || 0.7) * this.effectsVolumeScale;
    }

    if (this.doorCloseSound) {
      this.doorCloseSound.volume = (CONFIG.doorCloseSoundVolume || CONFIG.doorSoundVolume || 0.7) * this.effectsVolumeScale;
    }

    if (this.luckUpgradeSound) {
      this.luckUpgradeSound.volume = (CONFIG.luckUpgradeSoundVolume || 0.72) * this.effectsVolumeScale;
    }

    if (this.rockBreakPool.length) {
      this.updateRockBreakPoolVolume();
    }
  };

  AudioSystem.prototype.setDiggingVolume = function (value) {
    this.diggingVolumeScale = this.clampVolume(value);
  };

  AudioSystem.prototype.ensureContext = function () {
    var AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext || this.context) {
      return;
    }

    this.context = new AudioContext();
  };

  AudioSystem.prototype.play = function (name) {
    var table = {
      step: [180, 0.025, "triangle", 0.0144],
      type: [420, 0.018, "square", 0.01872],
      treasure: [560, 0.11, "sine", 0.045],
      bump: [70, 0.05, "square", 0.04]
    };
    var spec = table[name];
    var osc;
    var gain;
    var now;

    if (name === "grass") {
      this.playGrassRustle();
      return;
    }

    if (name === "chip" || name === "dig") {
      this.playDirtDig(name === "dig");
      return;
    }

    if (name === "orebreak") {
      this.playOreBreak();
      return;
    }

    if (name === "upgradeopen" || name === "upgradeclose") {
      this.playUpgradeMenuTone(name === "upgradeopen");
      return;
    }

    if (name === "sell") {
      this.playSellTone();
      return;
    }

    if (name === "deny") {
      this.playDenyTone();
      return;
    }

    if (name === "backtosurface") {
      this.playBackToSurface();
      return;
    }

    if (name === "dooropen" || name === "doorclose") {
      this.playDoorSound(name === "dooropen");
      return;
    }

    if (name === "luckupgrade") {
      this.playLuckUpgrade();
      return;
    }

    if (!this.enabled || !spec || this.effectsVolumeScale <= 0) {
      return;
    }

    this.ensureContext();

    if (!this.context) {
      return;
    }

    now = this.context.currentTime;
    osc = this.context.createOscillator();
    gain = this.context.createGain();
    osc.frequency.value = spec[0];
    osc.type = spec[2];
    gain.gain.setValueAtTime(spec[3] * this.effectsVolumeScale, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + spec[1]);
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(now);
    osc.stop(now + spec[1]);
  };

  AudioSystem.prototype.playDenyTone = function () {
    var now;
    var osc;
    var gain;

    if (!this.enabled || this.effectsVolumeScale <= 0) {
      return;
    }

    this.ensureContext();

    if (!this.context) {
      return;
    }

    now = this.context.currentTime;
    osc = this.context.createOscillator();
    gain = this.context.createGain();
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(58, now + 0.16);
    osc.type = "square";
    gain.gain.setValueAtTime(0.035 * this.effectsVolumeScale, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  };

  AudioSystem.prototype.playGrassRustle = function () {
    var duration = 0.055;
    var buffer;
    var data;
    var source;
    var gain;
    var now;
    var i;
    var t;

    if (!this.enabled || this.effectsVolumeScale <= 0) {
      return;
    }

    this.ensureContext();

    if (!this.context) {
      return;
    }

    buffer = this.context.createBuffer(1, Math.floor(this.context.sampleRate * duration), this.context.sampleRate);
    data = buffer.getChannelData(0);

    for (i = 0; i < data.length; i += 1) {
      t = i / data.length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.4);
    }

    now = this.context.currentTime;
    source = this.context.createBufferSource();
    gain = this.context.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(0.01728 * this.effectsVolumeScale, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(gain);
    gain.connect(this.context.destination);
    source.start(now);
    source.stop(now + duration);
  };

  AudioSystem.prototype.playDirtDig = function (heavy) {
    var duration = heavy ? 0.105 : 0.066;
    var sampleRate;
    var buffer;
    var data;
    var source;
    var noiseGain;
    var filter;
    var thud;
    var thudGain;
    var now;
    var hold = 0;
    var held = 0;
    var holdSamples;
    var i;
    var t;
    var envelope;
    var grit;

    if (!this.enabled || this.diggingVolumeScale <= 0) {
      return;
    }

    this.ensureContext();

    if (!this.context) {
      return;
    }

    sampleRate = this.context.sampleRate;
    buffer = this.context.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
    data = buffer.getChannelData(0);
    holdSamples = Math.max(1, Math.floor(sampleRate / (heavy ? 3200 : 2500)));

    for (i = 0; i < data.length; i += 1) {
      t = i / data.length;

      if (hold <= 0) {
        grit = Math.random() * 2 - 1;
        held = Math.round(grit * 5) / 5;
        hold = holdSamples + Math.floor(Math.random() * 3);
      }

      envelope = Math.pow(1 - t, heavy ? 2.2 : 2.7);
      data[i] = held * envelope;
      hold -= 1;
    }

    now = this.context.currentTime;
    source = this.context.createBufferSource();
    noiseGain = this.context.createGain();
    filter = this.context.createBiquadFilter();
    thud = this.context.createOscillator();
    thudGain = this.context.createGain();

    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(heavy ? 430 : 560, now);
    filter.Q.setValueAtTime(0.9, now);
    noiseGain.gain.setValueAtTime((heavy ? 0.0344 : 0.03) * this.diggingVolumeScale, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    thud.type = "square";
    thud.frequency.setValueAtTime(heavy ? 78 : 104, now);
    thud.frequency.exponentialRampToValueAtTime(heavy ? 46 : 68, now + duration * 0.7);
    thudGain.gain.setValueAtTime((heavy ? 0.0192 : 0.014) * this.diggingVolumeScale, now);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.82);

    source.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.context.destination);
    thud.connect(thudGain);
    thudGain.connect(this.context.destination);

    source.start(now);
    source.stop(now + duration);
    thud.start(now);
    thud.stop(now + duration);
  };

  AudioSystem.prototype.playOreBreak = function () {
    if (this.playRockBreakSound()) {
      return;
    }

    this.playSyntheticOreBreak();
  };

  AudioSystem.prototype.ensureRockBreakPool = function () {
    var srcs = CONFIG.rockBreakSoundSrcs || [];
    var copiesPerSound = 3;
    var i;
    var j;
    var audio;

    if (this.rockBreakPool.length || !srcs.length) {
      return;
    }

    for (i = 0; i < srcs.length; i += 1) {
      for (j = 0; j < copiesPerSound; j += 1) {
        audio = new Audio(srcs[i]);
        audio.preload = "auto";
        audio.volume = (CONFIG.rockBreakSoundVolume || 0.62) * this.effectsVolumeScale;
        this.rockBreakPool.push(audio);
      }
    }
  };

  AudioSystem.prototype.updateRockBreakPoolVolume = function () {
    var i;

    for (i = 0; i < this.rockBreakPool.length; i += 1) {
      this.rockBreakPool[i].volume = (CONFIG.rockBreakSoundVolume || 0.62) * this.effectsVolumeScale;
    }
  };

  AudioSystem.prototype.playRockBreakSound = function () {
    var audio;
    var startIndex;
    var playPromise;

    if (!this.enabled || this.effectsVolumeScale <= 0) {
      return false;
    }

    this.ensureRockBreakPool();

    if (!this.rockBreakPool.length) {
      return false;
    }

    startIndex = Math.floor(Math.random() * this.rockBreakPool.length);
    audio = this.rockBreakPool[startIndex];
    this.rockBreakPoolIndex = (startIndex + 1) % this.rockBreakPool.length;

    try {
      audio.currentTime = 0;
    } catch (error) {
    }

    playPromise = audio.play();

    if (playPromise && typeof playPromise["catch"] === "function") {
      playPromise["catch"](function () {});
    }

    return true;
  };

  AudioSystem.prototype.playSyntheticOreBreak = function () {
    var now;
    var gain;
    var low;
    var high;
    var noiseDuration = 0.11;
    var buffer;
    var data;
    var source;
    var noiseGain;
    var filter;
    var i;
    var t;

    if (!this.enabled || this.effectsVolumeScale <= 0) {
      return;
    }

    this.ensureContext();

    if (!this.context) {
      return;
    }

    now = this.context.currentTime;
    gain = this.context.createGain();
    low = this.context.createOscillator();
    high = this.context.createOscillator();
    buffer = this.context.createBuffer(1, Math.floor(this.context.sampleRate * noiseDuration), this.context.sampleRate);
    data = buffer.getChannelData(0);
    source = this.context.createBufferSource();
    noiseGain = this.context.createGain();
    filter = this.context.createBiquadFilter();

    for (i = 0; i < data.length; i += 1) {
      t = i / data.length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 1.8);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.026 * this.effectsVolumeScale, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    low.type = "triangle";
    low.frequency.setValueAtTime(132, now);
    low.frequency.exponentialRampToValueAtTime(82, now + 0.16);
    high.type = "square";
    high.frequency.setValueAtTime(660, now);
    high.frequency.exponentialRampToValueAtTime(980, now + 0.06);

    source.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.setValueAtTime(900, now);
    noiseGain.gain.setValueAtTime(0.012 * this.effectsVolumeScale, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + noiseDuration);

    low.connect(gain);
    high.connect(gain);
    gain.connect(this.context.destination);
    source.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.context.destination);

    low.start(now);
    high.start(now + 0.012);
    source.start(now);
    low.stop(now + 0.18);
    high.stop(now + 0.09);
    source.stop(now + noiseDuration);
  };

  AudioSystem.prototype.playUpgradeMenuTone = function (opening) {
    var duration = 0.115;
    var osc;
    var gain;
    var now;
    var startFreq = opening ? 240 : 300;
    var endFreq = opening ? 360 : 170;

    if (!this.enabled || this.effectsVolumeScale <= 0) {
      return;
    }

    this.ensureContext();

    if (!this.context) {
      return;
    }

    now = this.context.currentTime;
    osc = this.context.createOscillator();
    gain = this.context.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    gain.gain.setValueAtTime(0.024 * this.effectsVolumeScale, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(now);
    osc.stop(now + duration);
  };

  AudioSystem.prototype.playSellTone = function () {
    var now;
    var gain;
    var first;
    var second;

    if (!this.enabled || this.effectsVolumeScale <= 0) {
      return;
    }

    this.ensureContext();

    if (!this.context) {
      return;
    }

    now = this.context.currentTime;
    gain = this.context.createGain();
    first = this.context.createOscillator();
    second = this.context.createOscillator();

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.03 * this.effectsVolumeScale, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    first.type = "square";
    first.frequency.setValueAtTime(640, now);
    first.frequency.setValueAtTime(880, now + 0.07);

    second.type = "triangle";
    second.frequency.setValueAtTime(1280, now + 0.045);
    second.frequency.setValueAtTime(1760, now + 0.12);

    first.connect(gain);
    second.connect(gain);
    gain.connect(this.context.destination);
    first.start(now);
    second.start(now + 0.045);
    first.stop(now + 0.2);
    second.stop(now + 0.22);
  };

  AudioSystem.prototype.ensureSurfaceAmbience = function () {
    var self = this;
    var start = CONFIG.surfaceAmbienceStartSeconds || 0;
    var loopLead = CONFIG.surfaceAmbienceLoopLeadSeconds || 0.08;

    if (this.surfaceAmbience || !CONFIG.surfaceAmbienceSrc) {
      return;
    }

    this.surfaceAmbience = new Audio(CONFIG.surfaceAmbienceSrc);
    this.surfaceAmbience.preload = "auto";
    this.surfaceAmbience.volume = 0;

    this.surfaceAmbience.addEventListener("ended", function () {
      if (!self.surfaceAmbienceWanted) {
        return;
      }

      self.playSurfaceAmbience();
    });

    this.surfaceAmbience.addEventListener("timeupdate", function () {
      if (!self.surfaceAmbienceWanted || !self.surfaceAmbience.duration) {
        return;
      }

      if (self.surfaceAmbience.currentTime >= self.surfaceAmbience.duration - loopLead) {
        try {
          self.surfaceAmbience.currentTime = start;
        } catch (error) {
        }
      }
    });

    this.surfaceAmbience.addEventListener("loadedmetadata", function () {
      if (!self.surfaceAmbienceWanted || self.surfaceAmbience.currentTime >= start) {
        return;
      }

      try {
        self.surfaceAmbience.currentTime = start;
      } catch (error) {
      }
    });
  };

  AudioSystem.prototype.playSurfaceAmbience = function () {
    var audio;
    var start = CONFIG.surfaceAmbienceStartSeconds || 0;
    var playPromise;

    if (!this.enabled || this.ambienceVolumeScale <= 0) {
      return;
    }

    this.ensureSurfaceAmbience();
    audio = this.surfaceAmbience;

    if (!audio) {
      return;
    }

    this.surfaceAmbienceWanted = true;

    if (audio.paused || audio.ended) {
      try {
        if (!this.surfaceAmbienceStarted || audio.ended || audio.currentTime < start) {
          audio.currentTime = start;
        }
      } catch (error) {
        // Some browsers only allow seeking after metadata is available.
      }

      playPromise = audio.play();
      this.surfaceAmbienceStarted = true;

      if (playPromise && typeof playPromise["catch"] === "function") {
        playPromise["catch"](function () {});
      }
    }
  };

  AudioSystem.prototype.stopSurfaceAmbience = function () {
    this.surfaceAmbienceWanted = false;

    if (this.surfaceAmbience && !this.surfaceAmbience.paused) {
      this.surfaceAmbience.pause();
    }
  };

  AudioSystem.prototype.ensureMainMenuMusic = function () {
    if (this.mainMenuMusic || !CONFIG.mainMenuMusicSrc) {
      return;
    }

    this.mainMenuMusic = new Audio(CONFIG.mainMenuMusicSrc);
    this.mainMenuMusic.preload = "auto";
    this.mainMenuMusic.loop = true;
    this.mainMenuMusic.volume = 0;
  };

  AudioSystem.prototype.updateMainMenuMusic = function (fade) {
    var audio;
    var playPromise;
    var targetVolume = (CONFIG.mainMenuMusicVolume || 0.46) * this.ambienceVolumeScale * Math.max(0, Math.min(1, fade));

    if (!this.enabled || this.ambienceVolumeScale <= 0) {
      return;
    }

    this.ensureMainMenuMusic();
    audio = this.mainMenuMusic;

    if (!audio) {
      return;
    }

    this.mainMenuMusicWanted = targetVolume > 0.001;
    audio.volume = targetVolume;

    if (this.mainMenuMusicWanted && (audio.paused || audio.ended)) {
      playPromise = audio.play();

      if (playPromise && typeof playPromise["catch"] === "function") {
        playPromise["catch"](function () {});
      }
    }

    if (!this.mainMenuMusicWanted && !audio.paused) {
      audio.pause();
    }
  };

  AudioSystem.prototype.stopMainMenuMusic = function () {
    this.mainMenuMusicWanted = false;

    if (this.mainMenuMusic) {
      this.mainMenuMusic.volume = 0;

      if (!this.mainMenuMusic.paused) {
        this.mainMenuMusic.pause();
      }
    }
  };

  AudioSystem.prototype.ensureRainAmbience = function () {
    if (this.rainAmbience || !CONFIG.rainAmbienceSrc) {
      return;
    }

    this.rainAmbience = new Audio(CONFIG.rainAmbienceSrc);
    this.rainAmbience.preload = "auto";
    this.rainAmbience.loop = true;
    this.rainAmbience.volume = 0;
  };

  AudioSystem.prototype.playRainAmbience = function () {
    var audio;
    var playPromise;

    if (!this.enabled) {
      return;
    }

    this.ensureRainAmbience();
    audio = this.rainAmbience;

    if (!audio) {
      return;
    }

    this.rainAmbienceWanted = true;

    if (audio.paused || audio.ended) {
      playPromise = audio.play();

      if (playPromise && typeof playPromise["catch"] === "function") {
        playPromise["catch"](function () {});
      }
    }
  };

  AudioSystem.prototype.stopRainAmbience = function () {
    this.rainAmbienceWanted = false;

    if (this.rainAmbience && !this.rainAmbience.paused) {
      this.rainAmbience.pause();
    }
  };

  AudioSystem.prototype.ensureLuckAmbience = function () {
    if (this.luckAmbience || !CONFIG.luckAmbienceSrc) {
      return;
    }

    this.luckAmbience = new Audio(CONFIG.luckAmbienceSrc);
    this.luckAmbience.preload = "auto";
    this.luckAmbience.loop = true;
    this.luckAmbience.volume = 0;
  };

  AudioSystem.prototype.playLuckAmbience = function () {
    var audio;
    var playPromise;

    if (!this.enabled) {
      return;
    }

    this.ensureLuckAmbience();
    audio = this.luckAmbience;

    if (!audio) {
      return;
    }

    this.luckAmbienceWanted = true;

    if (audio.paused || audio.ended) {
      playPromise = audio.play();

      if (playPromise && typeof playPromise["catch"] === "function") {
        playPromise["catch"](function () {});
      }
    }
  };

  AudioSystem.prototype.stopLuckAmbience = function () {
    this.luckAmbienceWanted = false;

    if (this.luckAmbience && !this.luckAmbience.paused) {
      this.luckAmbience.pause();
    }
  };

  AudioSystem.prototype.updateLuckAmbience = function (depth) {
    var fadeDepth = Math.max(1, CONFIG.surfaceAmbienceFadeDepth || 8);
    var targetVolume = (CONFIG.luckAmbienceVolume || 0.34) * this.ambienceVolumeScale * Math.max(0, Math.min(1, 1 - depth / fadeDepth));
    var currentVolume;

    if (targetVolume > 0.001) {
      this.playLuckAmbience();
    } else {
      this.luckAmbienceWanted = false;
    }

    if (!this.luckAmbience) {
      return;
    }

    currentVolume = this.luckAmbience.volume;
    this.luckAmbience.volume = currentVolume + (targetVolume - currentVolume) * 0.08;

    if (targetVolume <= 0.001 && this.luckAmbience.volume <= 0.004) {
      this.stopLuckAmbience();
    }
  };

  AudioSystem.prototype.ensureBackToSurfaceSound = function () {
    if (this.backToSurfaceSound || !CONFIG.backToSurfaceSoundSrc) {
      return;
    }

    this.backToSurfaceSound = new Audio(CONFIG.backToSurfaceSoundSrc);
    this.backToSurfaceSound.preload = "auto";
    this.backToSurfaceSound.volume = CONFIG.backToSurfaceSoundVolume * this.effectsVolumeScale;
  };

  AudioSystem.prototype.playBackToSurface = function () {
    var audio;
    var playPromise;

    if (!this.enabled) {
      return;
    }

    this.ensureBackToSurfaceSound();
    audio = this.backToSurfaceSound;

    if (!audio) {
      return;
    }

    try {
      audio.currentTime = 0;
    } catch (error) {
    }

    playPromise = audio.play();

    if (playPromise && typeof playPromise["catch"] === "function") {
      playPromise["catch"](function () {});
    }
  };

  AudioSystem.prototype.ensureDoorSounds = function () {
    if (!this.doorOpenSound && CONFIG.doorOpenSoundSrc) {
      this.doorOpenSound = new Audio(CONFIG.doorOpenSoundSrc);
      this.doorOpenSound.preload = "auto";
      this.doorOpenSound.volume = (CONFIG.doorOpenSoundVolume || CONFIG.doorSoundVolume || 0.7) * this.effectsVolumeScale;
    }

    if (!this.doorCloseSound && CONFIG.doorCloseSoundSrc) {
      this.doorCloseSound = new Audio(CONFIG.doorCloseSoundSrc);
      this.doorCloseSound.preload = "auto";
      this.doorCloseSound.volume = (CONFIG.doorCloseSoundVolume || CONFIG.doorSoundVolume || 0.7) * this.effectsVolumeScale;
    }
  };

  AudioSystem.prototype.playDoorSound = function (opening) {
    var audio;
    var playPromise;

    if (!this.enabled || this.effectsVolumeScale <= 0) {
      return;
    }

    this.ensureDoorSounds();
    audio = opening ? this.doorOpenSound : this.doorCloseSound;

    if (!audio) {
      return;
    }

    try {
      audio.currentTime = 0;
    } catch (error) {
    }

    playPromise = audio.play();

    if (playPromise && typeof playPromise["catch"] === "function") {
      playPromise["catch"](function () {});
    }
  };

  AudioSystem.prototype.ensureLuckUpgradeSound = function () {
    if (this.luckUpgradeSound || !CONFIG.luckUpgradeSoundSrc) {
      return;
    }

    this.luckUpgradeSound = new Audio(CONFIG.luckUpgradeSoundSrc);
    this.luckUpgradeSound.preload = "auto";
    this.luckUpgradeSound.volume = (CONFIG.luckUpgradeSoundVolume || 0.72) * this.effectsVolumeScale;
  };

  AudioSystem.prototype.playLuckUpgrade = function () {
    var audio;
    var playPromise;

    if (!this.enabled || this.effectsVolumeScale <= 0) {
      return;
    }

    this.ensureLuckUpgradeSound();
    audio = this.luckUpgradeSound;

    if (!audio) {
      return;
    }

    try {
      audio.currentTime = 0;
    } catch (error) {
    }

    playPromise = audio.play();

    if (playPromise && typeof playPromise["catch"] === "function") {
      playPromise["catch"](function () {});
    }
  };

  AudioSystem.prototype.updateSurfaceAmbience = function (depth) {
    var fadeDepth = Math.max(1, CONFIG.surfaceAmbienceFadeDepth || 8);
    var targetVolume = CONFIG.surfaceAmbienceVolume * this.ambienceVolumeScale * Math.max(0, Math.min(1, 1 - depth / fadeDepth));
    var currentVolume;

    if (targetVolume > 0.001) {
      this.playSurfaceAmbience();
    } else {
      this.surfaceAmbienceWanted = false;
    }

    if (!this.surfaceAmbience) {
      return;
    }

    currentVolume = this.surfaceAmbience.volume;
    this.surfaceAmbience.volume = currentVolume + (targetVolume - currentVolume) * 0.08;

    if (targetVolume <= 0.001 && this.surfaceAmbience.volume <= 0.004) {
      this.stopSurfaceAmbience();
    }
  };

  AudioSystem.prototype.updateRainAmbience = function (depth) {
    var fadeDepth = Math.max(1, CONFIG.surfaceAmbienceFadeDepth || 8);
    var targetVolume = CONFIG.rainAmbienceVolume * this.ambienceVolumeScale * Math.max(0, Math.min(1, 1 - depth / fadeDepth));
    var currentVolume;

    if (targetVolume > 0.001) {
      this.playRainAmbience();
    } else {
      this.rainAmbienceWanted = false;
    }

    if (!this.rainAmbience) {
      return;
    }

    currentVolume = this.rainAmbience.volume;
    this.rainAmbience.volume = currentVolume + (targetVolume - currentVolume) * 0.08;

    if (targetVolume <= 0.001 && this.rainAmbience.volume <= 0.004) {
      this.stopRainAmbience();
    }
  };

  window.PawsBelow.AudioSystem = AudioSystem;
})();
