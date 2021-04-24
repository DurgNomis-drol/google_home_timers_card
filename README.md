<p align="center">
  <img src="https://brands.home-assistant.io/google_home/icon.png" height="150"></img>
</p>

# Card for Home Assistant Google Home integration

## Important to know!

It will not be a smooth countdown (It will jump some seconds), but it will always be done at the right time.

## Installation

### Prerequisites

Make sure you have Home-Assistant [Google home](https://github.com/leikoilja/ha-google-home) integration installed.


### HACS

Since the integration is under active development, it is not yet added to HACS default repository, only manual installation is available for early testers

To install the integration follow HACS description to add custom repository. Provide `https://github.com/DurgNomis-drol/google_home_timers_card` as repository URL and select the "Lovelace" category. We recommend you select the latest release.

### Manual installation

1. Download [`googletimers-card.js`](https://raw.githubusercontent.com/DurgNomis-drol/google_home_timers_card/main/googletimers-card.js) and right click and save it.
2. Copy it into the 'www' folder. If 'www' does not exists in your config folder, then just create it.
3. Add it to lovelace by going to `lovelace Dashboards` and then `Resources`.
4. and then input `/local/googletimers-card.js` and change resourcetype to `javascript-module`
5. Restart Home Assistant or clear browser cache.

### YAML installation - Not recommended

Follow step 1 -> 2 above and then add this to your `ui-lovelace.yaml` file.

```yaml
lovelace:
  resources:
    - url: /local/googletimers-card.js
      type: module
```

### Usage

The countdown is done client-side. This means that it will always fire at the correct time.

### Options

| Name | Type | Default	| Supported options	| Description |
| --- | --- | --- | --- | --- |
`type`|string|Required|`custom:googletimers-card`| Type of the card.
`entity`|string|Required|`sensor.kitchen_timers`| Has to be a timer sensor from google_home integration.
`title`|string|Optional|Any string that you want| Name displayed in the header. Defaults to the entity name.
`icon`|string|Optional|`mdi:kitchen`| Icon displayed in the header. Defaults to the entity icon.
`hide_header`|boolean|`false`|`true` or `false`| Whether to show the header or not.
`show_fire_time`|boolean|`false`|`true` or `false`| Whether to also show the time when it's done.
`alarms_entity`|string|Optional|`sensor.kitchen_alarms`| To show alarms as well.

### Example 

```yaml
type: 'custom:googletimers-card'
entity: sensor.kitchen_timers
alarms_entity: sensor.kitchen_alarms
title: Kitchen
```

Ecample using auto-entities to hide card and only display active timers:

```yaml
type: 'custom:auto-entities'
card:
  type: vertical-stack
card_param: cards
filter:
  exclude:
    - state: unavailable
  include:
    - domain: sensor
      entity_id: sensor.*_home_timers
      options:
        type: 'custom:googletimers-card'
```


<p align="center">
  <img src="/images/example.png">
</p>

### Bugs/Features

Please open a issue if you have found a bug or even better make a PR if you can fix it :smile:
