/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Default Timer Duration (minutes) - Default duration for the timer in minutes */
  "defaultTime": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `timer` command */
  export type Timer = ExtensionPreferences & {}
  /** Preferences accessible in the `custom-time-form` command */
  export type CustomTimeForm = ExtensionPreferences & {}
  /** Preferences accessible in the `start-timer` command */
  export type StartTimer = ExtensionPreferences & {}
  /** Preferences accessible in the `stop-timer` command */
  export type StopTimer = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `timer` command */
  export type Timer = {}
  /** Arguments passed to the `custom-time-form` command */
  export type CustomTimeForm = {}
  /** Arguments passed to the `start-timer` command */
  export type StartTimer = {}
  /** Arguments passed to the `stop-timer` command */
  export type StopTimer = {}
}

