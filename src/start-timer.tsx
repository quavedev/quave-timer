import React, { useEffect, useState } from "react";
import { showHUD, popToRoot, List, ActionPanel, Action } from "@raycast/api";
import { createTimer } from "./common";

// Type assertion for Raycast components
const ListComponent = List as any;
const ActionPanelComponent = ActionPanel as any;
const ActionComponent = Action as any;

export default function StartTimer() {
  const [isStarting, setIsStarting] = useState(false);

  const startTimer = async () => {
    if (isStarting) return;

    setIsStarting(true);

    try {
      const newTimer = await createTimer();
      const minutes = newTimer.duration / 60;
      showHUD(`Timer started: ${minutes} minutes`);
      popToRoot();
    } catch (error) {
      console.error("Error starting timer:", error);
      showHUD("Error starting timer");
    } finally {
      setIsStarting(false);
    }
  };

  // Auto-start the timer when the command is opened
  useEffect(() => {
    startTimer();
  }, []);

  // Show a simple loading state while starting
  return (
    <ListComponent isLoading={isStarting}>
      <ListComponent.Item
        title="Starting Timer..."
        subtitle="Please wait while the timer is being started"
        actions={
          <ActionPanelComponent>
            <ActionComponent
              title="Start Timer"
              onAction={startTimer}
              disabled={isStarting}
            />
          </ActionPanelComponent>
        }
      />
    </ListComponent>
  );
}
