import React, { useState } from "react";
import { Form, ActionPanel, Action, showHUD, popToRoot } from "@raycast/api";
import { createTimer } from "./common";

// Type assertion for Raycast components
const FormComponent = Form as any;
const ActionPanelComponent = ActionPanel as any;
const ActionComponent = Action as any;

export default function CustomTimeForm() {
  const [minutes, setMinutes] = useState("20");

  const handleSubmit = async () => {
    const minutesNumber = parseInt(minutes);
    if (minutesNumber > 0 && minutesNumber <= 999) {
      await createTimer(minutesNumber);
      showHUD(`Timer started: ${minutesNumber} minutes`);
      popToRoot();
    } else {
      showHUD("Please enter a valid number between 1 and 999");
    }
  };

  return (
    <FormComponent
      actions={
        <ActionPanelComponent>
          <ActionComponent title="Start Timer" onAction={handleSubmit} />
        </ActionPanelComponent>
      }
    >
      <FormComponent.TextField
        id="minutes"
        title="Minutes"
        placeholder="Enter minutes (1-999)"
        value={minutes}
        onChange={setMinutes}
      />
      <FormComponent.Description text="Enter any number of minutes from 1 to 999 to start a custom timer." />
    </FormComponent>
  );
}
