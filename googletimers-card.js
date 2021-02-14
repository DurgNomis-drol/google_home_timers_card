  /*jshint esversion: 9 */
class GoogleTimersCard extends HTMLElement {
  set hass(hass) {
    const entityId = this.config.entity;
    const state = hass.states[entityId];

    if (state === undefined) {
      this.innerHTML = `
        <ha-card>
          <div style="display: block; color: black; background-color: #fce588; padding: 8px;">
            Entity not found: ${entityId}
          </div>
        </ha-card>
      `;
      return;
    }

    const name = this.config.title || state.attributes['friendly_name'];

    if (!this.content) {
      const card = document.createElement('ha-card');
      this.content = document.createElement('div');
      const style = document.createElement('style');
      style.textContent = `
        ha-card {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          outline: none;
        }
        .header {
          display: flex;
          padding: 8px 16px 0;
          justify-content: space-between;
        }
        .name {
          color: var(--secondary-text-color);
          line-height: 40px;
          font-weight: 500;
          font-size: 16px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .icon {
          color: var(--state-icon-color, #44739e);
          line-height: 40px;
        }
        .info {
          display: flex;
          padding: 0px 16px 16px;
          overflow: hidden;
          margin-top: -4px;
          white-space: nowrap;
          text-overflow: ellipsis;
          line-height: 28px;
        }
        .value {
          font-size: 28px;
          margin-right: 4px;
        }
        .timer {
          font-size: 20px;
          margin: 8px 4px -5px;
        }
        .title {
          font-size: 0.9em;
          padding: 0 5px 0 5px;
          text-transform: capitalize;
        }
        .duration {
          font-size: 0.7em;
          padding: 0 5px 0 5px;
        }
        `;
      card.appendChild(style);
      card.appendChild(this.content);
      this.appendChild(card);
    }

    var timers = [];

    if (state.state != 'unknown') {
      var device = {
        'state': state.state,
      };

      timers = [device].concat(state.attributes['timers']);
    }

    var html = `
    <div class="header">
      <div class="name">${name}</div>
      <div class="icon"><ha-icon style="--mdc-icon-size: 24px;" icon="mdi:timer-sand"></ha-icon></div>
    </div>
    `;

    if (timers.length > 1) {
      for (const timer of timers) {
        if (timer['id'] === undefined) {
          continue;
        }

        var timer_name = timer['label'] ? "<ha-icon style='padding: 0 3px 0 0; --mdc-icon-size: 1em;' icon='mdi:label'></ha-icon>" + timer['label'] : "";

        var remaining_time = new Date(timer['fire_time'] - Date.now());
        var hours = remaining_time.getHours() > 1 ? remaining_time.getHours() - 1 + " t. " : ""
        var minutes = remaining_time.getMinutes() < 10  && remaining_time.getHours() > 1 ? "0"+ remaining_time.getMinutes() : remaining_time.getMinutes();
        var seconds = remaining_time.getSeconds() < 10 ? "0"+ remaining_time.getSeconds() : remaining_time.getSeconds();
        var time_to_show = hours + minutes +" min. "+ seconds + " sek.";

        if (Math.sign(remaining_time) == -1) {
          html += `
          <div class="info" style="margin: -5px 0 -5px;">
            <div class="icon"><ha-icon style="padding: 0 5px 0 0; color: orange; --mdc-icon-size: 24px;" icon="mdi:bell-ring"></ha-icon></div>
            <div class="timer">TIMER FÆRDIG!<span class="title">${timer_name}</span></div>
          </div>
          `;
          continue;
        }

        html += `
        <div class="info" style="margin: -5px 0 -5px;">
          <div class="icon"><ha-icon style="padding: 0 5px 0 0; --mdc-icon-size: 24px;" icon="mdi:alarm"></ha-icon></div>
          <div class="timer">${time_to_show}<span class="title">${timer_name}</span><span class="duration"><ha-icon style="padding: 0 3px 0 0; --mdc-icon-size: 1em;" icon="mdi:timelapse"></ha-icon>${timer['duration']}</span></div>
        </div>
        `;
      }

    } else {
      html += `
      <div class="info">
        <span class="value">${device['state']}</span>
      </div>
      `;
    }

    this.content.innerHTML = html;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
  }

  getCardSize() {
    return 6
  }
}
customElements.define('googletimers-card', GoogleTimersCard);
