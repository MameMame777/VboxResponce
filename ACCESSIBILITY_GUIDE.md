# Custom Audio Signals for VS Code - Accessibility Extension

## Overview

This extension provides custom VoiceVox audio signals for VS Code's built-in accessibility features. Instead of the default system sounds, you can use cute Japanese VoiceVox characters to provide audio feedback for various editing and chat events.

## Features

### Supported Accessibility Signals

1. **Chat Edit Modified File** - Plays when a file is modified by chat editing
2. **Edits Kept** - Plays when edits are accepted/kept
3. **Edits Undone** - Plays when edits are undone/rejected
4. **Chat Request Sent** - Plays when a chat request is sent (optional)
5. **Chat Response Received** - Plays when a chat response is received (optional)

### Voice Characters

- **ずんだもん (Zundamon)** - Friendly and energetic
- **四国めたん (Metan)** - Cheerful and bright
- **春日部つむぎ (Tsumugi)** - Calm and soothing
- **東北きりたん (Kiritan)** - Natural and clear

## Configuration

The extension can be configured through VS Code settings:

```json
{
  "customAudioSignals.enabled": true,
  "customAudioSignals.voiceCharacter": "zundamon",
  "customAudioSignals.volume": 0.7,
  "customAudioSignals.chatEditModifiedFile": true,
  "customAudioSignals.editsKept": true,
  "customAudioSignals.editsUndone": true,
  "customAudioSignals.chatRequestSent": false,
  "customAudioSignals.chatResponseReceived": false
}
```

## Commands

- `Custom Audio Signals: Toggle Custom Audio Signals` - Enable/disable the extension
- `Custom Audio Signals: Play Test Sound` - Test the current voice character
- `Custom Audio Signals: Configure Audio Settings` - Interactive configuration

## Keyboard Shortcuts

- `Ctrl+Alt+A` (Windows/Linux) or `Cmd+Alt+A` (Mac) - Toggle extension

## Usage

1. Install the extension
2. Configure your preferred voice character in settings
3. Enable the specific accessibility signals you want to hear
4. The extension will automatically play custom sounds when VS Code's accessibility events occur

## Integration with VS Code Accessibility

This extension integrates with VS Code's built-in accessibility signals system, specifically targeting:

- `accessibility.signals.chatEditModifiedFile`
- `accessibility.signals.editsKept`
- `accessibility.signals.editsUndone`
- `accessibility.signals.chatRequestSent`
- `accessibility.signals.chatResponseReceived`

## Development

The extension is built with TypeScript and uses VoiceVox audio assets for character voices.

### Key Components

- `AccessibilitySignalsIntegration` - Main integration with VS Code accessibility system
- `AudioManager` - Handles audio playback and caching
- `ConfigurationManager` - Manages extension settings

## License

MIT License - see LICENSE file for details.
