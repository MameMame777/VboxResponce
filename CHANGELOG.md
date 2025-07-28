# Changelog

All notable changes to the VoiceVox Companion extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-07-29

### Added

- **🎵 Startup Greeting System**: Welcome message with `activated-zundamon.wav` when VS Code launches
- **🎲 Random Chat Features**: Timer-based random voice messages from 4 different characters
  - `random_yukari1.wav` - 結月ゆかりのランダムチャット1
  - `random_yukari2.wav` - 結月ゆかりのランダムチャット2  
  - `random_zundamon.wav` - ずんだもんのランダムチャット
  - `random_kiritan.wav` - 東北きりたんのランダムチャット
- **🌙 Midnight Notifications**: Special late-night companion sounds with `atnight_yukari3.wav`
- **⌨️ Manual Control**: `Ctrl+Alt+V` keyboard shortcut for instant random chat
- **Memory-based Audio Caching**: Pre-loaded audio files for instant playback
- **PowerShell Audio Engine**: Windows MediaPlayer integration for reliable audio playback
- **Timer Management System**: Sophisticated scheduling for random chat and midnight notifications
- **Configuration Management**: VS Code settings integration with real-time updates

### Features

- **Voice Companion System**: 3 distinct companion functions (startup, random, midnight)
- **Character Variety**: 4 different voice characters with unique personalities
- **Flexible Timing**: Configurable random chat intervals (5-120 minutes)
- **Performance Optimized**: Memory-based caching with <100ms response times
- **User Friendly**: Simple configuration through VS Code settings
- **Resource Efficient**: Automatic cleanup of temporary files and timers

### Configuration Options

- `voiceCharacter`: Character selection (zundamon, metan, tsumugi, kiritan)
- `volume`: Audio volume control (0.0 - 1.0)
- `enableStartupGreeting`: Toggle startup greeting on/off
- `randomChatInterval`: Configure chat timing (5-120 minutes)

### Technical Implementation

- **TypeScript**: Full TypeScript implementation with strict typing
- **Modular Architecture**: Separated AudioManager, ConfigurationManager, Extension modules
- **Windows Compatibility**: PowerShell-based audio playback for Windows
- **Error Handling**: Comprehensive error handling with fallback mechanisms
- **Resource Management**: Proper disposal of timers and temporary files

### Technical Details

- Built with TypeScript for VS Code 1.70.0+
- Uses PowerShell for cross-platform audio playback
- Implements sophisticated DOM monitoring for Copilot detection
- Memory-efficient audio caching with automatic cleanup
- Comprehensive error handling and logging
