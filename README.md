# VoiceVox Copilot Notifier

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.70%2B-blue.svg)](https://code.visualstudio.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.7%2B-blue.svg)](https://www.typescriptlang.org/)

A VS Code extension that provides voice notifications for GitHub Copilot Chat completion using VoiceVox text-to-speech engine.

## 🚀 Quick Start

### Installation

1. **Download**: Download the latest `.vsix` file from the [dist folder](https://github.com/MameMame777/VboxResponce/tree/master/dist)
2. **Install**: In VS Code, press `Ctrl+Shift+P` → "Extensions: Install from VSIX..." → Select the downloaded file
3. **Enjoy**: The extension will automatically notify you when Copilot Chat completes!

### Alternative Installation Methods

```bash
# Command line installation
code --install-extension VboxResponce-1.0.0.vsix

# Or use the provided installer (Windows)
./install.bat
```

## Project Purpose

This extension enhances the GitHub Copilot experience by providing audio feedback when Copilot Chat completes its responses. Instead of visual notifications, users receive personalized voice notifications from various Japanese voice characters.

### Main Objectives

- Provide audio notifications when GitHub Copilot Chat completes responses
- Offer multiple Japanese voice characters with distinct personalities
- Create a seamless integration between VS Code, GitHub Copilot, and VoiceVox
- Enhance accessibility for users who prefer audio feedback
- Improve development workflow with customizable voice settings

### Success Criteria

- ✅ Successful VS Code extension integration
- ✅ Audio caching system with <100ms response times
- ✅ Voice notification system with 4 characters (ずんだもん, 四国めたん, 春日部つむぎ, 東北きりたん)
- ✅ Configurable voice settings and character selection
- ✅ Status bar integration for easy toggle
- ✅ Pre-generated audio assets for fast playback
- ✅ Real-time Copilot completion detection with duplicate prevention
- ✅ Multi-layered detection system using VS Code APIs

## Features

- **Audio Notifications**: Audio notifications when Copilot Chat completes responses
- **High Performance**: Memory-based audio caching for <100ms response times
- **Smart Detection**: Multi-layered Copilot activity detection system
- **Duplicate Prevention**: Sophisticated debouncing ensures one notification per response
- **Random Voice Selection**: Task completion notifications randomly select from multiple voice characters
- **Multiple Characters**: Choose from 4 different voice characters with unique personalities
- **Customizable Settings**: Adjust voice character, volume, and notification delays
- **Status Bar Integration**: Toggle notifications on/off with a status bar button
- **Pre-generated Audio**: Uses pre-generated WAV files for fast playback without runtime VoiceVox dependency
- **Character-specific Speech**: Each character has unique phrases and voice settings

## Supported Voice Characters

| Character | ID | Description | Voice Style |
|-----------|----|--------------|-----------| 
| 🟡 ずんだもん | 3 | Friendly and energetic | "なのだ" speech pattern, slightly faster speech |
| 🔵 四国めたん | 2 | Cheerful and polite | Gentle tone with "♪" expressions |
| 🟢 春日部つむぎ | 8 | Calm and relaxed | Slow speech with "〜" endings |
| 🟠 東北きりたん | 108 | Natural and balanced | Standard speech patterns |

## Notification Types

- **completion-success**: Task completed successfully
- **completion-error**: Error occurred during processing
- **long-process**: Long-running process notification
- **task-complete**: Task finished notification

## Installation & Setup

### Prerequisites

1. **VoiceVox**: Download and install VoiceVox from [official website](https://voicevox.hiroshiba.jp/)
2. **VS Code**: Visual Studio Code with GitHub Copilot extension installed
3. **Node.js**: For development and audio asset generation

### Development Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Start VoiceVox application (it will run on localhost:50021)
4. Generate audio assets: `node scripts/generateAudioAssets.js`
5. Compile TypeScript: `npm run compile`
6. Press F5 to launch Extension Development Host

## Usage

1. **Enable/Disable**: Click the 🔊/🔇 icon in VS Code status bar
2. **Change Voice Character**: Go to VS Code Settings → Extensions → VboxResponce
3. **Test Audio**: Use Command Palette → "VboxResponce: Play Test Sound"
4. **Adjust Settings**: Configure volume, delays, and error notifications in settings

## Configuration Options

```json
{
  "VboxResponce.enabled": true,
  "VboxResponce.voiceCharacter": "zundamon",
  "VboxResponce.volume": 0.7,
  "VboxResponce.notificationDelay": 500,
  "VboxResponce.enableForErrors": true,
  "VboxResponce.randomTaskComplete": true
}
```

### Settings Explanation

- `enabled`: Enable/disable audio notifications
- `voiceCharacter`: Default voice character (zundamon, metan, tsumugi, kiritan)
- `volume`: Audio volume (0.0 - 1.0)
- `notificationDelay`: Delay before playing notification (milliseconds)
- `enableForErrors`: Play notifications for error states
- `randomTaskComplete`: Use random voice characters for task completion (from all available task-complete_* files)

## Technical Architecture

### Components

- **AudioManager**: Handles audio file playback using PowerShell
- **CopilotMonitor**: Monitors GitHub Copilot Chat for completion events
- **ConfigurationManager**: Manages VS Code settings and voice character mappings
- **StatusBarManager**: Provides UI controls in VS Code status bar
- **generateAudioAssets.js**: Script to generate voice audio files from VoiceVox

### Audio Generation

Audio files are pre-generated using VoiceVox REST API with character-specific settings:

- Speech speed adjustments
- Pitch modifications
- Intonation scaling
- Volume normalization

## Development Log

### 2025-07-27: Initial Development

- ✅ Project structure created
- ✅ VoiceVox integration implemented
- ✅ Audio asset generation (16 files for 4 characters)
- ✅ VS Code extension scaffold completed
- ✅ Status bar integration working
- ✅ Configuration management implemented
- ✅ Character-specific voice settings added
- ✅ Eastern Japan character voices added (きりたん)

### Current Status

- **Basic functionality**: Complete
- **Voice character selection**: Working (4 characters)
- **Audio playback**: Functional via PowerShell
- **Settings UI**: Implemented
- **Copilot integration**: Simulation mode (needs real integration)

## Future Roadmap

- [ ] Real-time Copilot Chat DOM monitoring
- [ ] Additional voice characters
- [ ] Custom audio generation UI
- [ ] Extension marketplace publishing
- [ ] Multi-language support
- [ ] Advanced notification filtering

## Contributing

1. Ensure VoiceVox is running on localhost:50021
2. Generate audio assets when adding new characters
3. Update configuration schemas in package.json
4. Follow TypeScript coding standards
5. Test with Extension Development Host

## Acknowledgments

- VoiceVox team for the excellent TTS engine
- GitHub for Copilot integration capabilities
- Voice character creators (ずんだもん, 四国めたん, 春日部つむぎ, 東北きりたん)

## Technology Stack

- **Target Platform**: VS Code Extension
- **TTS Engine**: VoiceVox
- **Programming Language**: TypeScript/JavaScript (for VS Code extension)
- **Integration Target**: GitHub Copilot Chat

## Project Structure

```text
VboxResponce/
├── docs/                   # Documentation
├── src/                    # Source code
├── tests/                  # Test files
├── .github/               # GitHub specific files
└── README.md              # This file
```

## Development Phases

1. **Requirements Analysis** - Define detailed functional and non-functional requirements
2. **System Design** - Architecture and integration design
3. **Implementation** - Core functionality development
4. **Testing** - Unit tests and integration tests
5. **Documentation** - User guides and technical documentation
6. **Deployment** - VS Code Marketplace preparation

## Next Steps

- Complete requirements definition
- System architecture design
- VoiceVox API integration research
- VS Code extension development setup
