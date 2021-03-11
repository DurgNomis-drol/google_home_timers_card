<p align="center">
  <img src="https://brands.home-assistant.io/google_home/icon.png" height="150"></img>
</p>

# Card for Home Assistant Google Home integration

## Important to know!

It will not be a smooth countdown (It will jump some seconds), but it will always be done at the right time.

## Installation

### Prerequisites

Make sure you have Home-Assistant [Google home](https://github.com/leikoilja/ha-google-home) integration installed.

### Manual installation

1. Download [`googletimers-card.js`](https://raw.githubusercontent.com/DurgNomis-drol/google_home_timers_card/main/googletimers-card.js) and right click and save it.
2. Copy it into the 'www' folder. If 'www' does not exists in your config folder, then just create it.
3. Add it to lovelace by going to `lovelace Dashboards` and then `Resources`.
4. and then input `/local/googletimers-card.js` and change resourcetype to `javascript-module`
5. Restart Home Assistant or clear browser cache.

### Usage

The countdown is done client-side. This means that it will always fire at the correct time.

```yaml
type: 'custom:googletimers-card'
entity: sensor.kitchen_timers
title: My own title # Defaults to entity's name
icon: mdi:flower # Defaults to entity's icon
hide_header: false # Defaults to False
show_fire_time: false # Defaults to False
```
<p align="center">
  <img src="/images/example.png">
</p>

### Bugs/Features

Please open a issue if you have found a bug or even better make a PR if you can fix it :smile:
