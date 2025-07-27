# Release Notes - v1.0.0

## 🎉 Initial Release

VoiceVox Copilot Notifier v1.0.0 is now ready for public use! This VS Code extension provides delightful voice notifications when GitHub Copilot Chat completes tasks.

## ✨ Key Features

### 🎭 **Multiple Voice Characters**

- 6 unique VoiceVox character voices included
- Random voice selection for variety
- All voices pre-generated for optimal performance

### 🚀 **Smart Detection System**

- Advanced Copilot Chat completion detection
- Multi-layered monitoring for reliability
- Intelligent cooldown system prevents spam

### ⚡ **Performance Optimized**

- Memory-based audio caching
- Instant playback after first load
- Minimal resource usage

### 🎛️ **User-Friendly Configuration**

- Easy settings through VS Code preferences
- Status bar toggle for quick control
- Keyboard shortcuts for convenience

## 📦 Installation

### From Release

1. Download `VboxResponce-1.0.0.vsix` from GitHub Releases
2. In VS Code: `Ctrl+Shift+P` → "Extensions: Install from VSIX..."
3. Select the downloaded `.vsix` file

### Command Line

```bash
code --install-extension VboxResponce-1.0.0.vsix
```

## ⚙️ Configuration

Access settings via `Ctrl+,` and search for "voicevox-copilot":

- **Enable/Disable**: `voicevox-copilot.enabled`
- **Voice Character**: `voicevox-copilot.voiceCharacter`
- **Volume**: `voicevox-copilot.volume` (0.0-1.0)
- **Random Selection**: `voicevox-copilot.randomTaskComplete`

## 🎮 Usage

1. **Automatic**: Voice plays when Copilot Chat completes tasks
2. **Manual Test**: `Ctrl+Alt+V` to toggle, or use Command Palette
3. **Status Bar**: Click the speaker icon to enable/disable

## 🐛 Known Issues

- None reported at release time

## 🔧 Technical Details

- **Package Size**: 1.75 MB
- **VS Code Version**: 1.70.0+
- **Platform**: Cross-platform (Windows, macOS, Linux)
- **Audio System**: PowerShell-based playback

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed changes.

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Enjoy your enhanced Copilot experience with VoiceVox notifications! 🎵
