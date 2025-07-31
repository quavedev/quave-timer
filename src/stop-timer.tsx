import React, { useEffect, useState } from "react";
import { showHUD, popToRoot, List, ActionPanel, Action } from "@raycast/api";
import { deleteTimerState, loadTimerState } from "./common";

// Type assertion for Raycast components
const ListComponent = List as any;
const ActionPanelComponent = ActionPanel as any;
const ActionComponent = Action as any;

export default function StopTimer() {
  const [isStopping, setIsStopping] = useState(false);
  const [timerExists, setTimerExists] = useState(false);

  const checkTimerExists = async () => {
    const timer = await loadTimerState();
    setTimerExists(timer !== null && timer.isActive);
    return timer !== null && timer.isActive;
  };

  const stopTimer = async () => {
    if (isStopping) return;

    setIsStopping(true);

    try {
      const exists = await checkTimerExists();
      
      if (exists) {
        await deleteTimerState();
        showHUD("Timer stopped");
      } else {
        showHUD("No active timer to stop");
      }
      
      popToRoot();
    } catch (error) {
      console.error("Error stopping timer:", error);
      showHUD("Error stopping timer");
    } finally {
      setIsStopping(false);
    }
  };

  // Auto-check and stop the timer when the command is opened
  useEffect(() => {
    checkTimerExists().then((exists) => {
      if (exists) {
        stopTimer();
      }
    });
  }, []);

  // Show a simple loading state while stopping
  return (
    <ListComponent isLoading={isStopping}>
      <ListComponent.Item
        title={timerExists ? "Stopping Timer..." : "No Active Timer"}
        subtitle={timerExists ? "Please wait while the timer is being stopped" : "There is no active timer to stop"}
        actions={
          <ActionPanelComponent>
            <ActionComponent
              title="Stop Timer"
              onAction={stopTimer}
              disabled={isStopping || !timerExists}
            />
          </ActionPanelComponent>
        }
      />
    </ListComponent>
  );
}