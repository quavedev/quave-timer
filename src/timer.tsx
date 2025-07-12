import React, { useMemo } from "react";
import { MenuBarExtra, Icon, Color, open } from "@raycast/api";
import { useEffect, useState } from "react";
import {
  TimerState,
  loadTimerState,
  saveTimerState,
  deleteTimerState,
  playSound,
  createTimer,
  formatTime,
  getRemainingTime,
} from "./common";

// Type assertion for Raycast components
const MenuBarExtraComponent = MenuBarExtra as any;
const MenuBarExtraItem = MenuBarExtra.Item as any;
const MenuBarExtraSubmenu = MenuBarExtra.Submenu as any;

// Move these outside component to prevent recreation on re-renders
const PRESET_TIMES = [
  { label: "1 minute", value: 1 },
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
  { label: "15 minutes", value: 15 },
  { label: "20 minutes", value: 20 },
  { label: "25 minutes", value: 25 },
  { label: "60 minutes", value: 60 },
  { label: "5 seconds (test sound)", value: 5 / 60 }, // Convert to minutes for consistency
];

// Raycast will render each 10s because of "interval": "10s" on the package.json
export default function Timer() {
  const [timer, setTimer] = useState<TimerState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayTime, setDisplayTime] = useState<string>("");

  async function startTimer(minutesParam?: number) {
    const newTimer = await createTimer(minutesParam);
    setTimer(newTimer);
  }

  // Handler for menu actions that don't need parameters
  const handleStartTimer = () => {
    startTimer();
  };

  const handleRestartTimer = () => {
    startTimer();
  };

  // Load timer once on mount
  useEffect(() => {
    loadTimerState()
      .then(setTimer)
      .finally(() => setIsLoading(false));
  }, []);

  // Process timer state when component renders (called by background refresh)
  useEffect(() => {
    if (!timer?.isActive) {
      if (timer === null) {
        setDisplayTime("");
      }
      return;
    }

    // Calculate current state
    const remaining = getRemainingTime(timer);
    const formattedTime = formatTime(remaining);

    // Update display time
    setDisplayTime(formattedTime);

    // Handle sound alerts using counter approach
    if (remaining <= 0) {
      // Calculate how many sounds should have been played by now
      // At 0s: 1 sound, at -60s: 2 sounds, at -120s: 3 sounds, etc.
      const expectedSounds = Math.floor(Math.abs(remaining) / 60) + 1;

      if (expectedSounds > timer.soundsPlayed) {
        console.log(
          `🔊 Sound played! Expected: ${expectedSounds}, Played: ${timer.soundsPlayed}, Time: ${remaining}s`,
        );
        playSound();

        // Update timer state with new sound count
        const updatedTimer = {
          ...timer,
          soundsPlayed: expectedSounds,
          isFinished: true,
          isOverdue: true,
        };
        saveTimerState(updatedTimer);
        setTimer(updatedTimer);
      }
    }
  }, [timer]);

  // Memoize menu items to prevent re-renders
  const presetMenuItems = useMemo(() => {
    return PRESET_TIMES.map((preset) => (
      <MenuBarExtraItem
        key={preset.value}
        title={preset.label}
        onAction={() => startTimer(preset.value)}
      />
    ));
  }, []);

  async function stopTimer() {
    await deleteTimerState();
    setTimer(null);
    setDisplayTime("");
  }

  // Calculate display values
  let menuBarTitle = "";
  let menuBarIcon = Icon.Clock;
  let iconTintColor = Color.SecondaryText;
  const tooltipText = "Quave Timer";

  if (timer?.isActive) {
    const remaining = getRemainingTime(timer);
    menuBarTitle = `${displayTime || formatTime(remaining)}${timer?.soundsPlayed ? ` (${timer.soundsPlayed}x)` : ""}`;

    if (remaining <= 0) {
      // Red when overdue
      menuBarIcon = Icon.ExclamationMark;
      iconTintColor = Color.Red;
    } else {
      // Green when active and positive time
      menuBarIcon = Icon.Clock;
      iconTintColor = Color.Green;
    }
  }

  if (isLoading) {
    return <MenuBarExtraComponent icon={Icon.Clock} isLoading={true} />;
  }
  console.log("Timer component rendered");

  return (
    <MenuBarExtraComponent
      icon={{ source: menuBarIcon, tintColor: iconTintColor }}
      title={menuBarTitle}
      tooltip={tooltipText}
      isLoading={isLoading}
    >
      {timer?.isActive && (
        <>
          <MenuBarExtraItem
            title="Restart Timer"
            icon={Icon.Stop}
            onAction={handleRestartTimer}
          />
          <MenuBarExtraItem
            title="Stop Timer"
            icon={Icon.Stop}
            onAction={stopTimer}
          />
        </>
      )}

      {!timer?.isActive && !timer?.isFinished && !timer?.isOverdue && (
        <>
          <MenuBarExtraItem
            title="Start Timer"
            icon={Icon.Play}
            onAction={handleStartTimer}
          />
          <MenuBarExtraSubmenu title="Change Time" icon={Icon.Clock}>
            {presetMenuItems}
            <MenuBarExtraItem
              title="Custom..."
              icon={Icon.Plus}
              onAction={async () => {
                await open("raycast://extensions/quave-timer/custom-time-form");
              }}
            />
          </MenuBarExtraSubmenu>
        </>
      )}
    </MenuBarExtraComponent>
  );
}
