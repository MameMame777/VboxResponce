# Extension Testing Guide

## How to Test the VoiceVox Copilot Notifier Extension

### Launch Extension Development Host

1. **Using F5 Key (Recommended)**
   - Open the project in VS Code
   - Press F5 key
   - A new VS Code window will open with the extension loaded

2. **Using Command Palette**
   - Press Ctrl+Shift+P
   - Type "Debug: Start Debugging"
   - Select the option

3. **Using Command Line**
   ```bash
   code --extensionDevelopmentPath=. --new-window
   ```

### Testing Checklist

#### ✅ Visual Elements
- [ ] Status bar shows "$(unmute) VoiceVox" or "$(mute) VoiceVox"
- [ ] Status bar item is clickable
- [ ] Status bar tooltip shows current state

#### ✅ Commands Testing
Open Command Palette (Ctrl+Shift+P) and test:
- [ ] `VoiceVox Copilot: Toggle Voice Notifications`
- [ ] `VoiceVox Copilot: Play Test Sound`
- [ ] `VoiceVox Copilot: Replay Last Notification`

#### ✅ Settings Integration
Open Settings (Ctrl+,) and search for "voicevox":
- [ ] "Enable voice notifications" checkbox
- [ ] "Voice character" dropdown (zundamon, metan, tsumugi)
- [ ] "Volume" slider (0.0 - 1.0)
- [ ] "Notification delay" number input
- [ ] "Enable for errors" checkbox

#### ✅ Keyboard Shortcuts
- [ ] Ctrl+Alt+V toggles notifications

#### ✅ Functionality Testing
- [ ] Toggle functionality works
- [ ] Settings changes are applied immediately
- [ ] Test sound command shows notification message
- [ ] Extension activates on startup

### Debug Console Output

To see debug output:
1. In Extension Development Host: Help > Toggle Developer Tools
2. Check Console tab for extension logs
3. Look for messages starting with "VoiceVox Copilot"

### Expected Behavior

#### When Extension Loads
- Console message: "VoiceVox Copilot Notifier is now active!"
- Status bar item appears
- All commands registered

#### When Toggle is Pressed
- Status bar icon changes (mute/unmute)
- Status bar background color changes
- Tooltip text updates
- Notification message shown

#### When Test Sound is Played
- Console message with placeholder audio info
- VS Code notification: "🔊 VoiceVox: [phrase] ([character])"

### Troubleshooting

#### Extension Not Loading
- Check Terminal for TypeScript compilation errors
- Verify package.json syntax
- Ensure all dependencies installed (`npm install`)

#### Commands Not Appearing
- Check package.json `contributes.commands` section
- Verify extension is activated (`onStartupFinished`)

#### Settings Not Visible
- Check package.json `contributes.configuration` section
- Restart Extension Development Host

#### Audio Not Working
- This is expected in current version (placeholder implementation)
- Check console for debug messages
- VoiceVox assets are generated but not yet played

### Development Workflow

1. **Make Changes** to source files
2. **Compile** with `npm run compile` or `npm run watch`
3. **Reload Extension** in Development Host:
   - Ctrl+Shift+P → "Developer: Reload Window"
4. **Test Changes**

### Next Development Steps

Once basic testing confirms the extension works:
1. Implement real audio playback
2. Add actual Copilot DOM monitoring
3. Enhance error handling
4. Add comprehensive logging
