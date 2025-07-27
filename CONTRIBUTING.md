# Contributing to VoiceVox Copilot Notifier

We welcome contributions to the VoiceVox Copilot Notifier project!

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- VS Code 1.70.0 or higher
- Git

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/MameMame777/voicevox-copilot-notifier.git
   cd voicevox-copilot-notifier
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Open in VS Code**

   ```bash
   code .
   ```

4. **Start development**
   - Press `F5` to open a new Extension Development Host window
   - Your extension is now running in debug mode

## 🔧 Development

### Building

```bash
npm run compile
```

### Packaging

```bash
# Install VSCE if not already installed
npm install -g vsce

# Package the extension
vsce package --allow-missing-repository --out build/
```

### Project Structure

- `src/` - TypeScript source code
- `assets/` - Audio files for voice notifications
- `out/` - Compiled JavaScript files
- `build/` - Generated .vsix packages
- `dist/` - Distribution files for end users

## 🎯 How to Contribute

### Reporting Issues

- Check existing issues first
- Use the issue templates when available
- Provide detailed reproduction steps
- Include VS Code version and extension version

### Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use TypeScript for all source code
- Follow existing code patterns and conventions
- Add JSDoc comments for public APIs
- Use descriptive variable and function names

## 📝 License

By contributing, you agree that your contributions will be licensed under the MIT License.
