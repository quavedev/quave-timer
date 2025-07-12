import React, { useState } from "react";
import { 
  Form, 
  ActionPanel, 
  Action, 
  showHUD, 
  popToRoot 
} from "@raycast/api";

interface CustomTimeFormProps {
  onSubmit: (minutes: number) => void;
}

export default function CustomTimeForm({ onSubmit }: CustomTimeFormProps) {
  const [minutes, setMinutes] = useState("20");

  const handleSubmit = () => {
    const minutesNumber = parseInt(minutes);
    if (minutesNumber > 0 && minutesNumber <= 999) {
      onSubmit(minutesNumber);
      showHUD(`Timer set to ${minutesNumber} minutes`);
      popToRoot();
    } else {
      showHUD("Please enter a valid number between 1 and 999");
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Set Timer" onAction={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="minutes"
        title="Minutes"
        placeholder="Enter minutes (1-999)"
        value={minutes}
        onChange={setMinutes}
        onBlur={(event) => {
          const value = event.target?.value;
          if (value && !isNaN(Number(value))) {
            setMinutes(value);
          }
        }}
      />
    </Form>
  );
} 