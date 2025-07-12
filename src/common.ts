import { LocalStorage, getPreferenceValues, showHUD } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";
import { promises as fs } from "fs";
import { join } from "path";
import { homedir } from "os";

// Shared interfaces
export interface TimerState {
  startTime: number;
  duration: number;
  isActive: boolean;
  isFinished: boolean;
  isOverdue: boolean;
  lastNegativeMinuteAlert: number;
  soundsPlayed: number;
  name: string;
}

export interface Preferences {
  defaultTime: string;
}

// Shared constants
export const TIMER_FILE_PATH = join(homedir(), ".raycast-quave-timer.json");
export const LAST_TIME_KEY = "lastUsedTime";

// Shared functions
export async function loadTimerState(): Promise<TimerState | null> {
  try {
    const data = await fs.readFile(TIMER_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function saveTimerState(state: TimerState) {
  await fs.writeFile(TIMER_FILE_PATH, JSON.stringify(state, null, 2));
}

export async function deleteTimerState() {
  try {
    await fs.unlink(TIMER_FILE_PATH);
  } catch {
    // File doesn't exist, that's ok
  }
}

export async function playSound() {
  try {
    // First try to play the system sound
    await runAppleScript(`
      do shell script "afplay /System/Library/Sounds/Glass.aiff"
    `);
  } catch {
    try {
      // Fallback to AppleScript beep
      await runAppleScript("beep 3");
    } catch {
      // If all else fails, show a HUD
      await showHUD("Timer finished!");
    }
  }
}

export async function getMinutes(): Promise<number> {
  const preferences = getPreferenceValues<Preferences>();
  const lastTime = await LocalStorage.getItem(LAST_TIME_KEY);
  console.log("Last time", lastTime);
  const minutes =
    lastTime != "0" && !isNaN(+lastTime)
      ? parseFloat(lastTime as string)
      : parseInt(preferences.defaultTime);
  console.log("Starting timer with", minutes, "minutes");
  console.log("Preferences", preferences);
  return minutes;
}

export async function createTimer(minutesParam?: number): Promise<TimerState> {
  const minutes =
    minutesParam && typeof minutesParam === "number" && !isNaN(minutesParam)
      ? minutesParam
      : await getMinutes();

  const timerName = `${minutes} min Timer`;
  const newTimer: TimerState = {
    startTime: Date.now(),
    duration: minutes * 60,
    isActive: true,
    isFinished: false,
    isOverdue: false,
    lastNegativeMinuteAlert: 0,
    soundsPlayed: 0,
    name: timerName,
  };

  await saveTimerState(newTimer);
  await LocalStorage.setItem(LAST_TIME_KEY, minutes.toString());

  return newTimer;
}

export function formatTime(seconds: number): string {
  const isNegative = seconds < 0;
  const absSeconds = Math.abs(seconds);
  const minutes = Math.floor(absSeconds / 60);
  const remainingSeconds = absSeconds % 60;

  const sign = isNegative ? "-" : "";

  if (minutes >= 1) {
    return `${sign}${minutes}m ${remainingSeconds}s`;
  } else {
    return `${sign}${remainingSeconds}s`;
  }
}

export function getRemainingTime(timer: TimerState): number {
  const now = Date.now();
  const elapsed = Math.floor((now - timer.startTime) / 1000);
  const remaining = timer.duration - elapsed;
  return remaining; // Allow negative values
}
