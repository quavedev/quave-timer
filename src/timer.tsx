import React from "react";
import { MenuBarExtra, LocalStorage, Icon, getPreferenceValues, showHUD, environment } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";
import { useEffect, useState } from "react";
import { promises as fs } from "fs";
import { join } from "path";
import { homedir } from "os";

interface TimerState {
  startTime: number;
  duration: number;
  isActive: boolean;
  isFinished: boolean;
  name: string;
}

interface Preferences {
  defaultTime: string;
}

const TIMER_FILE_PATH = join(homedir(), ".raycast-quave-timer.json");
const LAST_TIME_KEY = "lastUsedTime";

const PRESET_TIMES = [
  { label: "1 minute", value: 1 },
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
  { label: "15 minutes", value: 15 },
  { label: "20 minutes", value: 20 },
  { label: "25 minutes", value: 25 },
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "60 minutes", value: 60 },
  { label: "Custom...", value: 0 },
];

const CUSTOM_TIMES = [
  { label: "1.5 hours", value: 90 },
  { label: "2 hours", value: 120 },
  { label: "3 hours", value: 180 },
  { label: "4 hours", value: 240 },
];

async function loadTimerState(): Promise<TimerState | null> {
  try {
    const data = await fs.readFile(TIMER_FILE_PATH, "utf8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function saveTimerState(state: TimerState) {
  await fs.writeFile(TIMER_FILE_PATH, JSON.stringify(state, null, 2));
}

async function deleteTimerState() {
  try {
    await fs.unlink(TIMER_FILE_PATH);
  } catch {
    // File doesn't exist, that's fine
  }
}

async function playSound() {
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

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes >= 1) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

function getRemainingTime(timer: TimerState): number {
  const now = Date.now();
  const elapsed = Math.floor((now - timer.startTime) / 1000);
  const remaining = timer.duration - elapsed;
  return Math.max(0, remaining);
}

export default function Timer() {
  const [timer, setTimer] = useState<TimerState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const preferences = getPreferenceValues<Preferences>();

  useEffect(() => {
    loadTimerState().then(setTimer).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!timer || !timer.isActive) return;

    const interval = setInterval(async () => {
      const currentTimer = await loadTimerState();
      if (!currentTimer || !currentTimer.isActive) {
        setTimer(null);
        return;
      }

      const remaining = getRemainingTime(currentTimer);
      
      if (remaining <= 0 && !currentTimer.isFinished) {
        const finishedTimer = { ...currentTimer, isFinished: true, isActive: false };
        await saveTimerState(finishedTimer);
        setTimer(finishedTimer);
        await playSound();
      } else {
        setTimer(currentTimer);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer?.isActive]);

  async function startTimer(minutes: number, isCustom = false) {
    const timerName = isCustom ? "Custom Timer" : `${minutes} min Timer`;
    const newTimer: TimerState = {
      startTime: Date.now(),
      duration: minutes * 60,
      isActive: true,
      isFinished: false,
      name: timerName,
    };

    await saveTimerState(newTimer);
    await LocalStorage.setItem(LAST_TIME_KEY, minutes.toString());
    setTimer(newTimer);
  }

  async function stopTimer() {
    await deleteTimerState();
    setTimer(null);
  }

  async function restartTimer() {
    if (!timer) return;
    
    const newTimer: TimerState = {
      startTime: Date.now(),
      duration: timer.duration,
      isActive: true,
      isFinished: false,
      name: timer.name,
    };

    await saveTimerState(newTimer);
    setTimer(newTimer);
  }

  if (isLoading) {
    return <MenuBarExtra icon={Icon.Clock} isLoading={true} />;
  }

  // Calculate display values
  let menuBarTitle = "";
  let menuBarIcon = Icon.Clock;
  let tooltipText = "Quave Timer";

  if (timer?.isActive) {
    const remaining = getRemainingTime(timer);
    menuBarTitle = formatTime(remaining);
    menuBarIcon = Icon.Clock;
    tooltipText = `${timer.name} - ${formatTime(remaining)} remaining`;
  } else if (timer?.isFinished) {
    menuBarTitle = "DONE!";
    menuBarIcon = Icon.CheckCircle;
    tooltipText = "Timer finished - Click to restart";
  }

  // @ts-ignore - Suppress TypeScript JSX compatibility errors
  return (
    <MenuBarExtra 
      icon={menuBarIcon} 
      title={menuBarTitle} 
      tooltip={tooltipText}
      isLoading={isLoading}
    >
      <MenuBarExtra.Item title="--- Timer Control ---" />
      
      {timer?.isActive && (
        <MenuBarExtra.Item
          title="Stop Timer"
          icon={Icon.Stop}
          onAction={stopTimer}
        />
      )}
      
      {timer?.isFinished && (
        <MenuBarExtra.Item
          title="Timer Finished - Click to Restart"
          icon={Icon.RotateClockwise}
          onAction={restartTimer}
        />
      )}
      
      {!timer?.isActive && !timer?.isFinished && (
        <MenuBarExtra.Item
          title="Start Timer"
          icon={Icon.Play}
          onAction={async () => {
            const defaultTime = parseInt(preferences.defaultTime) || 20;
            await startTimer(defaultTime);
          }}
        />
      )}

      <MenuBarExtra.Item
        title="Reset Timer"
        icon={Icon.RotateClockwise}
        onAction={async () => {
          if (timer) {
            await restartTimer();
          } else {
            const defaultTime = parseInt(preferences.defaultTime) || 20;
            await startTimer(defaultTime);
          }
        }}
      />

      <MenuBarExtra.Submenu title="Change Time" icon={Icon.Clock}>
        {PRESET_TIMES.map((preset) => (
          <MenuBarExtra.Item
            key={preset.value}
            title={preset.label}
            onAction={async () => {
              if (preset.value === 0) {
                // Custom submenu
                return;
              }
              await startTimer(preset.value);
            }}
          />
        ))}
        
        <MenuBarExtra.Submenu title="Custom..." icon={Icon.Plus}>
          {CUSTOM_TIMES.map((custom) => (
            <MenuBarExtra.Item
              key={custom.value}
              title={custom.label}
              onAction={() => startTimer(custom.value, true)}
            />
          ))}
        </MenuBarExtra.Submenu>
      </MenuBarExtra.Submenu>

      <MenuBarExtra.Separator />
      
      <MenuBarExtra.Item
        title="Quit"
        icon={Icon.XMarkCircle}
        onAction={stopTimer}
      />
    </MenuBarExtra>
  );
}
