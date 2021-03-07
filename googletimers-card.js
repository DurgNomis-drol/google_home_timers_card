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
          color: var(--secondary-text-color);
          font-size: 1.2em;
          padding: 0 5px 0 5px;
          text-transform: capitalize;
          font-weight: 500;
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

    const STATE_ON = "on";
    const STATE_UNKOWN = "unknown"

    const NO_TIMERS = "No timers set.";
    const TIMER_IS_DONE = "TIMER DONE!";

    const JSON_TIMERS = "timers"
    const JSON_DURATION = "duration";
    const JSON_LOCAL_TIME = "local_time";
    const JSON_NAME = "label";

    const ICON_ALARM = "mdi:alarm";
    const ICON_ALARM_DONE = "mdi:bell-ring";
    const ICON_DURATION = "mdi:timelapse";
    const ICON_ALARM_TIME = "mdi:clock";
    const ICON_LABEL = "mdi:label-variant"

    const STRING_HOURS = " h. "
    const STRING_MINUTES = " mins. "
    const STRING_SECONDS = " secs."

    function get_timedelta(time) {
        return new Date(Date.parse(time) - Date.now());
    }

    function format_to_human_readable(remaining_time) {
        var hours = remaining_time.getHours() > 1 ? remaining_time.getHours() - 1 + STRING_HOURS : ""
        var minutes = remaining_time.getMinutes() < 10  && remaining_time.getHours() > 1 ? "0"+ remaining_time.getMinutes() : remaining_time.getMinutes();
        var seconds = remaining_time.getSeconds() < 10 ? "0"+ remaining_time.getSeconds() : remaining_time.getSeconds();
        var time_to_show = hours + minutes + STRING_MINUTES + seconds + STRING_SECONDS;
        return time_to_show;
    }

    var timers = [];

    if (state.state != STATE_UNKOWN) {
      timers = state.attributes[JSON_TIMERS];
    }

    var html = `
    <div class="header">
      <div class="name">${name}</div>
      <div class="icon"><ha-icon style="--mdc-icon-size: 24px;" icon="mdi:timer-sand"></ha-icon></div>
    </div>
    `;

    if (state.state == STATE_ON) {
      for (const timer of timers) {
        if (timer[JSON_DURATION] === undefined) {
          continue;
        }

        var timer_name = ""
        var alarm_time = ""
        var icon = ICON_ALARM

        var remaining_time = get_timedelta(timer[JSON_LOCAL_TIME])
        var formatted_time = format_to_human_readable(remaining_time)

        if (Math.sign(remaining_time) == -1) {
          formatted_time = TIMER_IS_DONE
          icon = ICON_ALARM_DONE
        }

        if (this.config.show_fire_time) {
          alarm_time = "<span class='duration'><ha-icon style='padding: 0 3px 0 0; --mdc-icon-size: 1.1em;' icon='" + ICON_ALARM_TIME + "'></ha-icon>" + timer[JSON_LOCAL_TIME].split(" ")[1] + "</span>"
        }

        if (timer[JSON_NAME]) {
          timer_name = "<div style='margin: 0 15px 0 15px;'><span class='title'><ha-icon style='padding: 0 3px 0 0; --mdc-icon-size: 1.1em;' icon='" + ICON_LABEL + "'></ha-icon>" + timer[JSON_NAME] + "</span></div>"
        }

        html += `
        <div>
          ${timer_name}
          <div class="info" style="margin: -5px 0 -5px;">
            <div class="icon"><ha-icon style="padding: 0 5px 0 0; --mdc-icon-size: 24px;" icon="${icon}"></ha-icon></div>
            <div class="timer">${formatted_time}<span class="duration"><ha-icon style="padding: 0 3px 0 0; --mdc-icon-size: 1.1em;" icon="${ICON_DURATION}"></ha-icon>${timer[JSON_DURATION]}</span>${alarm_time}</div>
          </div>
        </div>
        `;
      }

    } else {
      html += `
      <div class="info">
        <span class="value">${NO_TIMERS}</span>
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
    return 2
  }
}
customElements.define('googletimers-card', GoogleTimersCard);
