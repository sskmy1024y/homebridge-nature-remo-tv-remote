<div align="center">
  <img src="https://user-images.githubusercontent.com/16918590/116787064-fb440c80-aadc-11eb-8dae-af15ab8e2e7b.png" width="148px" />
  <h1>Homebridge Nature Remo TV Remote</h1>
</div>

<div align="center">
<a href="https://github.com/sskmy1024y/homebridge-nature-remo-tv-remote/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License: MIT" /></a>
<img src="https://img.shields.io/npm/dt/homebridge-nature-remo-tv-remote" alt="downloads" />

</div>

<div align="center">
  <strong>This plugin add the TV remote control registered in Nature Remo to homebridge</strong>
  <p><a href="https://github.com/sskmy1024y/homebridge-nature-remo-tv-remote/blob/main/README.ja.md">🇯🇵 Japanese</a></p>
</div>

<div align="center">
<img width="680px" src="https://user-images.githubusercontent.com/16918590/116787459-0e57dc00-aadf-11eb-96e9-581137ac9cbc.png" alt="screenshot" />
</div>



## 📲 Installation

Go to the "Plugins" tab in [config-ui-x](https://github.com/oznu/homebridge-config-ui-x) and search for `homebridge-nature-remo-tv-remote`, or use the following command to install it.

```sh
npm i -g homebridge-nature-remo-tv-remote
```

## ✅ Customize devices

### 1. Get Nature-Remo OAuth2 Access Token

Issue at https://home.nature.global/

### 2. Get the Appliance ID of your TV.

Open a terminal and execute the following command.  
In `${access-token}`, put the token you got in step 1.

```sh
curl -X GET "https://api.nature.global/1/appliances" -H "Authorization: Bearer ${access-token}" > appliance_id.json
```

Open the saved `appliance_id.json` and check the Appliance ID.

```json
{
  {
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx", // <- **Appliance ID**
    "device": {...},
    "model": null,
    "type": "TV",
    "nickname": "テレビ", // <- Names registered in NatureRemo
    "image": "ico_tv",
    "settings": null,
    "aircon": null,
    "signals": [...],
    "tv": { ... }
  },
  ...
}
```

### 3. Sign up for homebridge.

Using [config-ui-x](https://github.com/oznu/homebridge-config-ui-x), you can easily add a configuration.  
Open the "homebridge-nature-remo-tv-remote" configuration from the "Plugins" tab, and enter the access token and Appliance ID obtained in steps 1 and 2.

After pressing "Save", restart homebridge.

<img src="https://user-images.githubusercontent.com/16918590/116787692-8672d180-aae0-11eb-94fd-603e530c57ce.png" alt="homebridge setting" width="640px" />


## 🏠 Add TV's to home app

Even if you have already added homebridge as a bridge, you will need to add a new one.

1. Open the Home App
2. Type + in the top right corner to add a device
3. Then click on Don't Have a Code or Can't scan?
4. The found TV should appear under Nearby Accessories ... click on it
5. Use the pin that you configured under config > bridge > pin or check the config-ui-x

<img width="680px" src="https://user-images.githubusercontent.com/16918590/116788425-752bc400-aae4-11eb-8233-e68967cc585b.png" alt="add-homeapp-step" />

<img width="480px" src="https://user-images.githubusercontent.com/16918590/116788626-9e991f80-aae5-11eb-8718-77c2396fae8d.png" alt="confirm-setting-code">


## 🔖 Advance setting

<details>
<summary>Example button name</summary>

| button name | detail |
|----|----|
| `power` | TV Power |
| `input-terrestrial` | Select Terrestrial |
| `input-bs` | Select BS |
| `input-cs` | Select CS |
| `ch-1` | Select 1 channel |
| `ch-2` | Select 2 channel |
| `ch-3` | Select 3 channel |
| `ch-4` | Select 4 channel |
| `ch-5` | Select 5 channel |
| `ch-6` | Select 6 channel |
| `ch-7` | Select 7 channel |
| `ch-8` | Select 8 channel |
| `ch-9` | Select 9 channel |
| `ch-10` | Select 10 channel |
| `ch-11` | Select 11 channel |
| `ch-12` | Select 12 channel |
| `ch-up` | Next channnel |
| `ch-down` | Previous channel |
| `back` | Back button |
| `ok` | OK/Select button |
| `vol-up` | Volume up |
| `vol-down` | Volume down |

In addition, there are various other buttons.  
You can check the list of buttons from the `appliance_id.json` that you got when checking the appliance ID.

```json
{
  {
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx",
    "device": {...},
    "model": null,
    "type": "TV",
    "nickname": "テレビ", // <- NatureRemoに登録されている名前
    "image": "ico_tv",
    "settings": null,
    "aircon": null,
    "signals": [...],
    "tv": {
      "button": [
        {
          "name": "power", // <- **button name**
          "image": "ico_io",
          "label": "TV_power"
        },
        {
          "name": "select-input-src", // <- **button name**
          "image": "ico_input",
          "label": "TV_source"
        },
        ...
      ]
    }
  },
  ...
}
```


</details>

<details>
<summary>Set Input Sources</summary>

Allows you to set the input source for the TV.  
By setting it, you can select the input source from the Home app.

<img width="680px" src="https://user-images.githubusercontent.com/16918590/116789696-030aad80-aaeb-11eb-88e8-2dfaa7bdca37.png" />

Open the plugin tab of config-ui-x and go to Settings and open Sources.

In **Label**, enter the label of the input source.  
And **Button Name**, enter the name of the button you got from Nature Remo.

<img width="480px" src="https://user-images.githubusercontent.com/16918590/116789125-40217080-aae8-11eb-8210-a4b92481e475.png">

If you have changed the input sources, **you will need to restart homebridge and re-register in home.app.**

</details>

<details>
<summary>Relocate the keymap</summary>

Assign any button on TV remote in the Control Center to any button.

<img width="220px" src="https://user-images.githubusercontent.com/16918590/116789890-41549c80-aaec-11eb-8469-ff75c1b246f5.png" />

Open the plugin tab of config-ui-x and go to Settings and open Key maps.

<img width="680px" src="https://user-images.githubusercontent.com/16918590/116789847-f175d580-aaeb-11eb-991c-76a2da0a1074.png" />

</details>

## 🤝 Contributing

1. Fork it (https://github.com/sskmy1024y/homebridge-nature-remo-tv-remote/fork)
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create a new Pull Request


## 🎫 Licence

The MIT License (MIT)

* Copyright (c) 2021 Sho YAMASHITA

## 🖋 Author

* [sskmy1024y](https://github.com/sskmy1024y)
