const request = require("request-promise-native");

const BASE_URL = "https://api.nature.global";
const PLUGIN_NAME = 'homebridge-nature-remo-tv';
const PLATFORM_NAME = 'NatureRemoTVRemote';

module.exports = (api) => {
  api.registerPlatform(PLATFORM_NAME, NatureRemoTVRemote);
}

class NatureRemoTVRemote {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;

    this.Service = api.hap.Service;
    this.Characteristic = api.hap.Characteristic;

    // cached accessories from Homebridge
    this.cachedAccessories = [];

    // wait for the "didFinishLaunching" event to set up accessories
    this.api.on('didFinishLaunching', () => {
      this.setupAccessory();
    });
  }

  /**
   * Called by Homebridge to restore cached accessories from disk.
   */
  configureAccessory(accessory) {
    this.log.debug('Restoring cached accessory:', accessory.displayName);
    this.cachedAccessories.push(accessory);
  }

  setupAccessory() {
    // get the name
    const tvName = this.config.name || 'Nature Remo TV';

    // generate a UUID
    const uuid = this.api.hap.uuid.generate(`homebridge:${PLUGIN_NAME}` + tvName);

    // check if the accessory was already cached
    const existingAccessory = this.cachedAccessories.find(acc => acc.UUID === uuid);

    if (existingAccessory) {
      // use the cached accessory
      this.log.debug('Restoring existing accessory from cache:', tvName);
      this.tvAccessory = existingAccessory;
      this.tvAccessory.category = this.api.hap.Categories.TELEVISION;
      this.configureServices();
    } else {
      // create a new accessory
      this.log.debug('Adding new accessory:', tvName);
      this.tvAccessory = new this.api.platformAccessory(tvName, uuid);
      this.tvAccessory.category = this.api.hap.Categories.TELEVISION;
      this.configureServices();

      // register the new accessory with Homebridge
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [this.tvAccessory]);
    }

    // remove any stale cached accessories that no longer match
    const staleAccessories = this.cachedAccessories.filter(acc => acc.UUID !== uuid);
    if (staleAccessories.length > 0) {
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, staleAccessories);
    }
  }

  configureServices() {
    /***********************************************************************************
    *********************************   TV Service   ***********************************
    /***********************************************************************************/

    // get or add the Television service
    let tvService = this.tvAccessory.getService(this.Service.Television);
    if (!tvService) {
      tvService = this.tvAccessory.addService(this.Service.Television);
    }

    const tvName = this.config.name || 'Nature Remo TV';

    // set the tv name
    tvService.setCharacteristic(this.Characteristic.ConfiguredName, tvName);

    // set sleep discovery characteristic
    tvService.setCharacteristic(this.Characteristic.SleepDiscoveryMode, this.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);

    // handle on / off events using the Active characteristic
    tvService.getCharacteristic(this.Characteristic.Active)
      .onSet((newValue) => {
        const prevState = tvService.getCharacteristic(this.Characteristic.Active).value
        if (prevState !== newValue) {
          this.log.debug(`> [Power]: ${newValue ? 'On' : 'Off'}`);
          this.setOnCharacteristicHandler("power");
        }
      });

    tvService.setCharacteristic(this.Characteristic.ActiveIdentifier, 1);

    // handle input source changes
    tvService.getCharacteristic(this.Characteristic.ActiveIdentifier)
      .onSet((newValue) => {
        const buttonName = this.config.sources[parseInt(newValue) - 1].button
        this.setOnCharacteristicHandler(buttonName);
        this.log.debug('> [Change Input Source]: ' + buttonName);
      });

    // handle remote control input
    tvService.getCharacteristic(this.Characteristic.RemoteKey)
      .onSet((newValue) => {
        const { allow_up, allow_down, allow_left, allow_right, select, back, information, play_pause } = this.config
        switch(newValue) {
          case this.Characteristic.RemoteKey.REWIND: {
            this.setOnCharacteristicHandler("fast-rewind");
            this.log.debug('> [Remote Key Pressed]: REWIND');
            break;
          }
          case this.Characteristic.RemoteKey.FAST_FORWARD: {
            this.setOnCharacteristicHandler("fast-forward");
            this.log.debug('> [Remote Key Pressed]: FAST_FORWARD');
            break;
          }
          case this.Characteristic.RemoteKey.NEXT_TRACK: {
            this.log.debug('> [Remote Key Pressed]: NEXT_TRACK');
            break;
          }
          case this.Characteristic.RemoteKey.PREVIOUS_TRACK: {
            this.log.debug('> [Remote Key Pressed]: PREVIOUS_TRACK');
            break;
          }
          case this.Characteristic.RemoteKey.ARROW_UP: {
            this.setOnCharacteristicHandler(allow_up || "up");
            this.log.debug('> [Remote Key Pressed]: ARROW_UP');
            break;
          }
          case this.Characteristic.RemoteKey.ARROW_DOWN: {
            this.setOnCharacteristicHandler(allow_down || "down");
            this.log.debug('> [Remote Key Pressed]: ARROW_DOWN');
            break;
          }
          case this.Characteristic.RemoteKey.ARROW_LEFT: {
            this.setOnCharacteristicHandler(allow_left || "left");
            this.log.debug('> [Remote Key Pressed]: ARROW_LEFT');
            break;
          }
          case this.Characteristic.RemoteKey.ARROW_RIGHT: {
            this.setOnCharacteristicHandler(allow_right || "right");
            this.log.debug('> [Remote Key Pressed]: ARROW_RIGHT');
            break;
          }
          case this.Characteristic.RemoteKey.SELECT: {
            this.setOnCharacteristicHandler(select || "ok");
            this.log.debug('> [Remote Key Pressed]: SELECT');
            break;
          }
          case this.Characteristic.RemoteKey.BACK: {
            this.setOnCharacteristicHandler(back || "back");
            this.log.debug('> [Remote Key Pressed]: BACK');
            break;
          }
          case this.Characteristic.RemoteKey.EXIT: {
            this.log.debug('[Remote Key Pressed]: EXIT');
            break;
          }
          case this.Characteristic.RemoteKey.PLAY_PAUSE: {
            this.setOnCharacteristicHandler(play_pause || "back");
            this.log.debug('[Remote Key Pressed]: PLAY_PAUSE');
            break;
          }
          case this.Characteristic.RemoteKey.INFORMATION: {
            this.setOnCharacteristicHandler(information || "display");
            this.log.debug('[Remote Key Pressed]: INFORMATION');
            break;
          }
        }
      });

    /**
     * Create a speaker service to allow volume control
     */

    let speakerService = this.tvAccessory.getService(this.Service.TelevisionSpeaker);
    if (!speakerService) {
      speakerService = this.tvAccessory.addService(this.Service.TelevisionSpeaker);
    }

    speakerService
      .setCharacteristic(this.Characteristic.Active, this.Characteristic.Active.ACTIVE)
      .setCharacteristic(this.Characteristic.VolumeControlType, this.Characteristic.VolumeControlType.ABSOLUTE);

    // handle volume control
    speakerService.getCharacteristic(this.Characteristic.VolumeSelector)
      .onSet((newValue) => {
        this.setOnCharacteristicHandler(newValue ? "vol-down" : "vol-up");
        this.log.debug(`[Volume Key Pressed]: ${newValue ? 'DONW' : 'UP'}`);
      });

    /**
     * Create TV Input Source Services
     * These are the inputs the user can select from.
     * When a user selected an input the corresponding Identifier Characteristic
     * is sent to the TV Service ActiveIdentifier Characteristic handler.
     */

    // remove old input source services before re-adding (for cached accessories)
    this.tvAccessory.services
      .filter(s => s instanceof this.Service.InputSource)
      .forEach(s => this.tvAccessory.removeService(s));

    if (this.config.sources && this.config.sources.length > 0) {
      this.config.sources.map((src, index) => {
        const inputService = this.tvAccessory.addService(this.Service.InputSource, src.label, src.label);
        inputService
          .setCharacteristic(this.Characteristic.Identifier, index + 1)
          .setCharacteristic(this.Characteristic.ConfiguredName, src.label)
          .setCharacteristic(this.Characteristic.IsConfigured, this.Characteristic.IsConfigured.CONFIGURED)
          .setCharacteristic(this.Characteristic.InputSourceType, this.Characteristic.InputSourceType.HDMI);
        tvService.addLinkedService(inputService); // link to tv service
      })
    }
  }

  async setOnCharacteristicHandler(button) {
    const options = {
      method: "POST",
      url: `${BASE_URL}/1/appliances/${this.config.appliance_id}/tv`,
      form: { button },
      headers: {
        Authorization: `Bearer ${this.config.access_token}`,
      },
    };
    await request(options);
  }
}
