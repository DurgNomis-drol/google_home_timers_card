/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  LitElement,
  html,
  customElement,
  property,
  CSSResult,
  TemplateResult,
  css,
  PropertyValues,
  internalProperty,
} from 'lit-element';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types

import './editor';

import type { GoogleHomeCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION, ICON_ALARM, ICON_ALARM_DONE, ICON_ALARM_TIME, ICON_DURATION, ICON_LABEL, ICON_NEXT, ICON_TIMER, JSON_DURATION, JSON_FIRE_TIME, JSON_LOCAL_TIME, JSON_NAME, JSON_RECURRENCE, STRING_HOURS, STRING_MINUTES, STRING_SECONDS, TIMER_IS_DONE, WEEKDAYS } from './const';
import { localize } from './localize/localize';

/* eslint no-console: 0 */
console.info(
  `%c  GOOGLEHOME-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'googlehome-card',
  name: 'Google Home Card',
  description: 'A custom card for the Google Home community integration.',
});

// TODO Name your custom element
@customElement('googlehome-card')
export class GoogleHomeCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('googlehome-card-editor');
  }

  public static getStubConfig(): object {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here
  // https://lit-element.polymer-project.org/guide/properties
  @property({ attribute: false }) public hass!: HomeAssistant;
  @internalProperty() private config!: GoogleHomeCardConfig;

  // https://lit-element.polymer-project.org/guide/properties#accessors-custom
  public setConfig(config: GoogleHomeCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      name: 'Google Home',
      ...config,
    };
  }

  // https://lit-element.polymer-project.org/guide/lifecycle#shouldupdate
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  // https://lit-element.polymer-project.org/guide/templates
  protected render(): TemplateResult | void {
    // TODO Check for stateObj or other necessary things and render a warning if missing
    if (this.config.show_warning) {
      return this._showWarning(localize('common.show_warning'));
    }

    if (this.config.show_error) {
      return this._showError(localize('common.show_error'));
    }

    return html`
      <ha-card
        .header=${this.config.name}
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.config.hold_action),
          hasDoubleClick: hasAction(this.config.double_tap_action),
        })}
        tabindex="0"
        .label=${`Google Home: ${this.config.entity || 'No Entity Defined'}`}
      >
        <div class="entries">
          ${this.generate_entries()}
        </div>
      </ha-card>
    `;
  }

  private get_alarms_or_timers_attirbute_from_entity(entityId: string) {

    var attributes = this.hass.states[entityId].state.attributes[];

    return attributes
  }

  private get_timedelta(timestamp: number) {
    return new Date((timestamp * 1000) - Date.now());
  }

  private format_to_human_readeble(rt: any) {
    var h = rt.getUTCHours() > 0 ? rt.getUTCHours() + STRING_HOURS : ""
    var m = rt.getUTCMinutes() < 10  && rt.getUTCHours() > 1 ? "0"+ rt.getUTCMinutes() : rt.getUTCMinutes();
    var s = rt.getUTCSeconds() < 10 ? "0"+ rt.getUTCSeconds() : rt.getUTCSeconds();
    var ts = h + m + STRING_MINUTES + s + STRING_SECONDS;
    return ts;
  }

  private format_alarm_time(ts: number, is_ampm: boolean) {
    var d = new Date(ts * 1000)
    var time = d.toLocaleString(window.navigator.language, {weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: is_ampm })
    return time
  }

  private generate_alarm_entry(alarm: string) {

    var formatted_time = this.format_alarm_time(alarm[JSON_FIRE_TIME], this.config.use_12hour)

    var alarm_name = alarm[JSON_NAME] != null ? "<div style='margin: 0 15px 0 15px;'><span class='title'><ha-icon style='padding: 0 3px 0 0; --mdc-icon-size: 1.1em;' icon='" + ICON_LABEL + "'></ha-icon>" + alarm[JSON_NAME] + "</span></div>" : ""
    var recurrence = "";
    var alarm_next = alarm[JSON_RECURRENCE] != null ? '<ha-icon style="padding: 0 3px 0 0; --mdc-icon-size: 1.1em;" icon="'+ ICON_NEXT +'"></ha-icon>' : ""

    if (alarm[JSON_RECURRENCE] != null && alarm[JSON_RECURRENCE].length >= 7) {
      recurrence = "all weekdays"
    } else if (alarm[JSON_RECURRENCE] != null) {
      alarm[JSON_RECURRENCE].forEach(function(entry) {
          recurrence += WEEKDAYS[entry] + " "
      });
    }

    var entry = `
    <div>
      ${alarm_name}
      <div class="info" style="margin: -5px 0 -5px;">
        <div class="icon"><ha-icon style="padding: 0 5px 0 0; --mdc-icon-size: 24px;" icon="${ICON_ALARM}"></ha-icon></div>
        <div class="alarm">${formatted_time}<span class="next">${alarm_next}${recurrence}</span></div>
      </div>
    </div>
    `;

    return entry
  }

  private generate_timer_entry(timer: string) {

    var timer_icon = ICON_TIMER

    var remaining_time = this.get_timedelta(timer[JSON_FIRE_TIME])
    var formatted_time = this.format_to_human_readeble(remaining_time)

    if (Math.sign(Number(remaining_time)) == -1) {
      formatted_time = TIMER_IS_DONE
      timer_icon = ICON_ALARM_DONE
    }
    
    var timer_name = timer[JSON_NAME] != null ? "<div style='margin: 0 15px 0 15px;'><span class='title'><ha-icon style='padding: 0 3px 0 0; --mdc-icon-size: 1.1em;' icon='" + ICON_LABEL + "'></ha-icon>" + timer[JSON_NAME] + "</span></div>" : ""
    var alarm_time = this.config.show_fire_time ? "<span class='duration'><ha-icon style='padding: 0 3px 0 0; --mdc-icon-size: 1.1em;' icon='" + ICON_ALARM_TIME + "'></ha-icon>" + timer[JSON_LOCAL_TIME].split(" ")[1] + "</span>" : ""

    var entry = `
    <div>
      ${timer_name}
      <div class="info" style="margin: -5px 0 -5px;">
        <div class="icon"><ha-icon style="padding: 0 5px 0 0; --mdc-icon-size: 24px;" icon="${timer_icon}"></ha-icon></div>
        <div class="timer">${formatted_time}<span class="duration"><ha-icon style="padding: 0 3px 0 0; --mdc-icon-size: 1.1em;" icon="${ICON_DURATION}"></ha-icon>${timer[JSON_DURATION]}</span>${alarm_time}</div>
      </div>
    </div>
    `;

    return entry
  }

  private generate_entries(alarms: string[], timers: string[]) {

    var entries

    for (var alarm in alarms) {
      entries.push(this.generate_alarm_entry(alarm))
    }

    for (var timer in timers) {
      entries.push(this.generate_timer_entry(timer))
    }

    return entries
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this.config && ev.detail.action) {
      handleAction(this, this.hass, this.config, ev.detail.action);
    }
  }

  private _showWarning(warning: string): TemplateResult {
    return html`
      <hui-warning>${warning}</hui-warning>
    `;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card');
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html`
      ${errorCard}
    `;
  }

  // https://lit-element.polymer-project.org/guide/styles
  static get styles(): CSSResult {
    return css``;
  }
}
