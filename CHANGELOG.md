# Changelog

All notable changes to the VoiceVox Copilot Notifier extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-27

### Added

- Initial release of VoiceVox Copilot Notifier
- Random voice selection from 6 VoiceVox characters
- Audio caching system for improved performance
- Multi-layered Copilot Chat activity detection
- Configurable notification settings
- Status bar integration for easy toggle
- Keyboard shortcuts for quick access
- Comprehensive debug logging system
- Support for different notification types

### Features

- **Voice Characters**: Supports 6 different VoiceVox character voices
- **Random Selection**: Automatically selects random voice files for variety
- **Smart Detection**: Advanced Copilot Chat completion detection
- **Performance Optimized**: Memory-based audio caching system
- **User Friendly**: Simple configuration through VS Code settings
- **Reliable**: Intelligent cooldown system prevents duplicate notifications

### Technical Details

- Built with TypeScript for VS Code 1.70.0+
- Uses PowerShell for cross-platform audio playback
- Implements sophisticated DOM monitoring for Copilot detection
- Memory-efficient audio caching with automatic cleanup
- Comprehensive error handling and logging
