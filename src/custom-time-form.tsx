import React, { useState } from "react";
import { 
  Form, 
  ActionPanel, 
  Action, 
  showHUD, 
  popToRoot,
  LocalStorage
} from "@raycast/api";
import { promises as fs } from "fs";
import { join } from "path";
import { homedir } from "os";

interface TimerState {
  startTime: number;
  duration: number;
  isActive: boolean;
  isFinished: boolean;
  isOverdue: boolean;
  lastNegativeMinuteAlert: number;
  soundsPlayed: number;
  name: string;
}

const TIMER_FILE_PATH = join(homedir(), ".raycast-quave-timer.json");
const LAST_TIME_KEY = "lastUsedTime";

async function saveTimerState(state: TimerState) {
  await fs.writeFile(TIMER_FILE_PATH, JSON.stringify(state, null, 2));
}

export default function CustomTimeForm() {
  const [minutes, setMinutes] = useState("20");

  const handleSubmit = async () => {
    const minutesNumber = parseInt(minutes);
    if (minutesNumber > 0 && minutesNumber <= 999) {
      // Create new timer
      const newTimer: TimerState = {
        startTime: Date.now(),
        duration: minutesNumber * 60,
        isActive: true,
        isFinished: false,
        isOverdue: false,
        lastNegativeMinuteAlert: 0,
        soundsPlayed: 0,
        name: `${minutesNumber} min Timer`,
      };

      await saveTimerState(newTimer);
      await LocalStorage.setItem(LAST_TIME_KEY, minutes);
      
      showHUD(`Timer started: ${minutesNumber} minutes`);
      popToRoot();
    } else {
      showHUD("Please enter a valid number between 1 and 999");
    }
  };

  return (
    // @ts-ignore - Suppress TypeScript JSX compatibility errors
    <Form
      actions={
        // @ts-ignore - Suppress TypeScript JSX compatibility errors
        <ActionPanel>
          {/* @ts-ignore - Suppress TypeScript JSX compatibility errors */}
          <Action title="Start Timer" onAction={handleSubmit} />
        </ActionPanel>
      }
    >
      {/* @ts-ignore - Suppress TypeScript JSX compatibility errors */}
      <Form.TextField
        id="minutes"
        title="Minutes"
        placeholder="Enter minutes (1-999)"
        value={minutes}
        onChange={setMinutes}
      />
      {/* @ts-ignore - Suppress TypeScript JSX compatibility errors */}
      <Form.Description text="Enter any number of minutes from 1 to 999 to start a custom timer." />
    </Form>
  );
} 