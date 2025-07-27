# Contributing to VoiceVox Copilot Notifier

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Open in VS Code
4. Press F5 to run the extension in debug mode

## Code Structure

- `src/audioManager.ts` - Audio playback and caching system
- `src/copilotMonitor.ts` - Copilot activity detection
- `src/configurationManager.ts` - VS Code settings management
- `src/statusBarManager.ts` - Status bar integration
- `src/extension.ts` - Main extension entry point

## Adding New Voice Characters

1. Generate audio files using `npm run generate-assets`
2. Add character to `package.json` configuration
3. Update character descriptions in README

## Testing

Run tests with: `npm test`

## Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Code Style

- Use TypeScript
- Follow existing code patterns
- Add comments for complex logic
- Use descriptive variable names
