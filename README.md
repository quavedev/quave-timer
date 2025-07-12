# Quave Timer

A simple timer extension for Raycast with menu bar integration.

## Features

- **Menu Bar Integration**: Shows timer countdown in the menu bar
- **Visual Feedback**: Different icons and colors for different states
- **Sound Alerts**: Plays system sound when timer finishes
- **Easy Controls**: 
  - Left click to start/restart timer
  - Right click for menu with stop, change time, and restart options
- **Predefined Times**: Quick access to 1, 5, 10, 15, 25, and 30-minute timers
- **Persistent Alert**: Timer continues to alert until dismissed

## Installation

1. **Install Node.js** (required for Raycast extensions):
   ```bash
   # Install Node.js using Homebrew
   brew install node
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install Raycast CLI** (if not already installed):
   ```bash
   npm install -g @raycast/api
   ```

4. **Build the extension**:
   ```bash
   npm run build
   ```

5. **Import into Raycast**:
   - Open Raycast
   - Go to Extensions
   - Click "Import Extension"
   - Select this folder

## Usage

1. **Start Timer**: Click on the timer in the menu bar or search for "Start Timer" in Raycast
2. **Menu Bar Controls**:
   - **Left Click**: Start timer (if stopped) or restart with same time (if finished)
   - **Right Click**: Access full menu with options
3. **When Timer Finishes**:
   - Plays system alert sound
   - Shows "DONE" in menu bar with red bell icon
   - Continues to alert until you click it

## Menu Options

- **Start/Stop Timer**: Toggle timer state
- **Reset Timer**: Reset to original time
- **Change Time**: Select from preset times (1, 5, 10, 15, 25, 30 minutes)
- **Quit**: Exit the extension

## Development

```bash
# Start development mode
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Fix linting issues
npm run fix-lint
```

## Sound Implementation

The extension uses macOS system sounds instead of embedding audio files:
- Primary: `/System/Library/Sounds/Glass.aiff`
- Fallback: System beep via AppleScript

This approach keeps the extension lightweight and uses familiar system sounds. 