# Development Documentation

## 🎯 Project Overview

VoiceVox Companion is a VS Code extension that provides voice companion features with Japanese VoiceVox character voices. This document provides technical details for developers.

## 📁 Project Structure

```
VboxResponce/
├── src/                    # TypeScript source files
│   ├── extension.ts        # Main extension entry point
│   ├── audioManager.ts     # Audio playback management
│   └── configurationManager.ts # Settings management
├── assets/                 # Audio files
│   ├── activated-zundamon.wav
│   ├── random_yukari1.wav
│   ├── random_yukari2.wav
│   ├── random_zundamon.wav
│   ├── random_kiritan.wav
│   └── atnight_yukari3.wav
├── out/                    # Compiled JavaScript files
├── package.json           # Extension manifest
└── readme.md              # User documentation
```

## 🔧 Core Components

### Extension.ts
- **Purpose**: Main extension lifecycle management
- **Key Functions**:
  - `activate()`: Extension initialization
  - `deactivate()`: Cleanup on extension disable
  - Timer management for random chat and midnight notifications

### AudioManager.ts
- **Purpose**: Audio playback and caching system
- **Key Features**:
  - Memory-based audio caching for fast playback
  - PowerShell-based audio playback for Windows
  - Support for three audio types: startup, random, midnight
- **Key Methods**:
  - `playCompletionSound()`: Startup greeting
  - `playRandomSound()`: Random chat messages  
  - `playNightSound()`: Midnight notifications

### ConfigurationManager.ts
- **Purpose**: VS Code settings integration
- **Managed Settings**:
  - Voice character selection
  - Volume control
  - Startup greeting toggle
  - Random chat interval

## 🎵 Audio System Architecture

### Audio Files
1. **Startup Greeting**: `activated-zundamon.wav`
2. **Random Chat** (4 files): `random_yukari1.wav`, `random_yukari2.wav`, `random_zundamon.wav`, `random_kiritan.wav`
3. **Midnight**: `atnight_yukari3.wav`

### Playback Flow
1. **Caching**: Audio files loaded into memory on initialization
2. **Temporary Files**: Cached audio written to temp directory for playback
3. **PowerShell**: Uses Windows MediaPlayer for audio playback
4. **Cleanup**: Temporary files automatically removed after playback

### Audio Caching Strategy
- Pre-load all audio files into memory on extension startup
- Use temporary files only during playback
- Automatic cleanup prevents disk bloat
- Cache invalidation on character changes

## ⏰ Timer System

### Random Chat Timer
- **Interval**: Configurable 5-120 minutes (default: 30)
- **Behavior**: Resets on each execution
- **Manual Trigger**: `Ctrl+Alt+V` keyboard shortcut

### Midnight Timer
- **Schedule**: Daily at 00:00
- **Calculation**: Dynamic time-to-midnight calculation
- **Persistence**: Survives VS Code restarts

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+
- VS Code 1.70+
- TypeScript 4.7+
- Windows OS (for PowerShell audio playback)

### Development Commands
```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode for development
npm run watch

# Lint code
npm run lint

# Package extension
vsce package
```

### Testing
1. Press `F5` to launch Extension Development Host
2. Test startup greeting on VS Code launch
3. Use `Ctrl+Alt+V` to test random chat
4. Check console output for debugging information

## 🔍 Debugging

### Console Logging
All major operations are logged with emoji prefixes:
- 🎵 Audio operations
- 🎲 Random selection
- 🌙 Midnight notifications
- ⚙️ Configuration changes

### Common Issues
1. **No Audio**: Check Windows audio system and PowerShell permissions
2. **Timer Issues**: Verify timer cleanup in `deactivate()` function
3. **Cache Problems**: Check temp directory permissions

## 📝 Configuration Schema

```typescript
interface NotificationConfig {
    voiceCharacter: 'zundamon' | 'metan' | 'tsumugi' | 'kiritan';
    volume: number; // 0.0 - 1.0
    enableStartupGreeting: boolean;
    randomChatInterval: number; // 5-120 minutes
}
```

## 🚀 Build & Deployment

### Packaging
```bash
# Create VSIX package
vsce package

# Install locally
code --install-extension vscode-voicevox-companion-1.0.0.vsix
```

### File Structure in Package
- Source code compiled to `out/` directory
- Audio assets included in `assets/` directory
- Package manifest defines extension capabilities
- Icon and readme included for marketplace

## 🔮 Future Enhancements

### Potential Features
- Multiple language support
- Custom audio file support
- More timer scheduling options
- Integration with other VS Code events
- Audio volume fade effects
- Character-specific greeting messages

### Technical Improvements
- Cross-platform audio playback (macOS, Linux)
- Audio format optimization
- Background audio processing
- Settings UI improvements
- Performance monitoring
