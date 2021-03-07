# Card for ha-google-home integration

<b>[!] IS STILL IN ALPHA<b>
  
## Example

<p align="center">
  <img src="/images/example.png">
</p>

## Installation

### Prerequisites

Make sure you have installed ha-google-home. (Latest master)

Link to [ha-google-home](https://github.com/leikoilja/ha-google-home)

### Manual installation

1. Download `googletimers-card.js` and place it in 'www' folder. If 'www' does not exists in your config folder, then just create it.
2. Add it to lovelace by going to `lovelace Dashboards` and then `Resources`.
3. and then input `/local/googletimers-card.js` and change resourcetype to `javascript-module`
4. Restart ha or clear browser cache.

### Usage

The countdown is done client-side. This means that it will always fire at the correct time.

```yaml
type: 'custom:googletimers-card'
entity: sensor.kitchen_timers
title: My own title
```

### Bugs/Features

Please open a issue if you have found a bug or even better make a PR if you can fix it :smile:
