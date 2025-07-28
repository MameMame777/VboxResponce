# VoiceVox Companion

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.70%2B-blue.svg)](https://code.visualstudio.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.7%2B-blue.svg)](https://www.typescriptlang.org/)

A VS Code extension that provides voice companion features with VoiceVox character voices for enhanced development experience.

## 🚀 Quick Start

### Installation

1. **Download**: Download the latest `.vsix` file from the releases
2. **Install**: In VS Code, press `Ctrl+Shift+P` → "Extensions: Install from VSIX..." → Select the downloaded file
3. **Enjoy**: The extension will automatically start with startup greeting!

### Alternative Installation Methods

```bash
# Command line installation
code --install-extension vscode-voicevox-companion-1.0.0.vsix
```

## Project Purpose

This extension provides a voice companion experience for VS Code users with Japanese VoiceVox characters. It offers startup greetings, random chat messages, and midnight notifications to create a more engaging development environment.

### Main Objectives

- Provide startup greeting when VS Code launches
- Offer random chat messages at configurable intervals
- Send midnight notifications for late-night coding sessions
- Support multiple Japanese voice characters with distinct personalities
- Create seamless audio integration with PowerShell-based playback
- Enhance development workflow with customizable voice settings

### Success Criteria

- ✅ Successful VS Code extension integration
- ✅ Audio caching system with fast response times
- ✅ Voice system with 4 random characters (yukari, zundamon, kiritan)
- ✅ Configurable voice settings and timing controls
- ✅ Pre-generated audio assets for instant playback
- ✅ Timer-based random chat and midnight notification system
- ✅ Manual chat trigger with keyboard shortcut

## Features

- **Audio Notifications**: Audio notifications when Copilot Chat completes responses
### Core Features

- **🎵 Startup Greeting**: Welcome message when VS Code launches
- **🎲 Random Chat**: Configurable interval chat messages (5-120 minutes)
- **🌙 Midnight Notifications**: Special late-night development companion sounds
- **⚡ High Performance**: Memory-based audio caching for instant playback
- **🎛️ Manual Control**: Trigger random chat manually with `Ctrl+Alt+V`
- **🔧 Customizable Settings**: Adjust voice character, volume, and chat intervals
- **📁 Pre-generated Audio**: Uses pre-generated WAV files for fast playback
- **🎯 Character Variety**: Multiple voice characters for diverse experience

## Audio Files & Characters

### Startup Greeting
- **activated-zundamon.wav**: ずんだもんの起動メッセージ

### Random Chat (4 voices)
- **random_yukari1.wav**: 結月ゆかりのランダムチャット1
- **random_yukari2.wav**: 結月ゆかりのランダムチャット2  
- **random_zundamon.wav**: ずんだもんのランダムチャット
- **random_kiritan.wav**: 東北きりたんのランダムチャット

### Midnight Notifications
- **atnight_yukari3.wav**: 結月ゆかりの深夜メッセージ

## Voice Character Settings

| Character | Description | Voice Style |
|-----------|-------------|-------------|
| 🟡 zundamon | ずんだもん - Friendly and energetic | "なのだ" speech pattern |
| 🔵 metan | 四国めたん - Cheerful and polite | Gentle tone with cheerful expressions |
| 🟢 tsumugi | 春日部つむぎ - Calm and relaxed | Slow speech with gentle endings |
| 🟠 kiritan | 東北きりたん - Natural and balanced | Standard speech patterns |

## Functions

### 🚀 Startup Greeting
- Automatically plays when VS Code starts
- Uses `activated-zundamon.wav`
- Can be enabled/disabled in settings

### 🎲 Random Chat
- Timer-based random voice messages
- Configurable interval (5-120 minutes, default: 30 minutes)
- Randomly selects from 4 different voice files
- Manual trigger: `Ctrl+Alt+V`

### 🌙 Midnight Notifications
- Plays at exactly 00:00 daily
- Special late-night development companion message
- Uses `atnight_yukari3.wav`

## Installation & Setup

### Prerequisites

1. **VS Code**: Visual Studio Code 1.70+
2. **Windows**: PowerShell-based audio playback (Windows only)
3. **Audio System**: Working audio output device

### Installation Steps

1. Download the `.vsix` file
2. Install via VS Code: `Ctrl+Shift+P` → "Extensions: Install from VSIX..."
3. Or use command line: `code --install-extension vscode-voicevox-companion-1.0.0.vsix`
4. Restart VS Code to enable the extension

## Usage

### Basic Operation
1. **Startup**: Extension automatically starts with VS Code
2. **Manual Chat**: Press `Ctrl+Alt+V` to trigger random chat
3. **Settings**: Configure via VS Code Settings → Extensions → VoiceVox Companion

### Commands
- **Random VoiceVox Chat** (`voicevoxCompanion.randomChat`): Manual random chat trigger

## Configuration Options

```json
{
  "voicevoxCompanion.voiceCharacter": "zundamon",
  "voicevoxCompanion.volume": 0.7,
  "voicevoxCompanion.enableStartupGreeting": true,
  "voicevoxCompanion.randomChatInterval": 30
}
```

### Settings Explanation

- `voiceCharacter`: Voice character for startup greeting (zundamon, metan, tsumugi, kiritan)
- `volume`: Audio volume (0.0 - 1.0)
- `enableStartupGreeting`: Enable/disable startup greeting when VS Code starts
- `randomChatInterval`: Random chat interval in minutes (5-120, 0 to disable)

### Available Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Voice Character | string | "zundamon" | Character for startup greeting |
| Volume | number | 0.7 | Audio volume (0.0 to 1.0) |
| Enable Startup Greeting | boolean | true | Play greeting when VS Code starts |
| Random Chat Interval | number | 30 | Minutes between random chats (5-120) |

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
