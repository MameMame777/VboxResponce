# Development Setup Guide

## Prerequisites and Setup Requirements

Based on our decision to use the VS Code Extension approach, here are the necessary preparations for development.

## Required Software and Tools

### 1. Development Environment

#### Node.js and npm
```bash
# Check if already installed
node --version  # Should be v16+ (recommended v18+)
npm --version   # Should be v8+

# If not installed, download from https://nodejs.org/
# Recommended: Install via nvm for version management
```

#### VS Code Extension Development Tools
```bash
# Install Yeoman and VS Code Extension generator
npm install -g yo generator-code

# Install VS Code Extension CLI (optional but helpful)
npm install -g @vscode/vsce
```

#### TypeScript Development
```bash
# TypeScript compiler (if not globally installed)
npm install -g typescript

# Check TypeScript version
tsc --version  # Should be v4.5+
```

### 2. VoiceVox Setup

#### VoiceVox Installation
- **Download**: https://voicevox.hiroshiba.jp/
- **Platform**: Windows (primary), Mac/Linux (check compatibility)
- **Version**: Latest stable release
- **Installation Path**: Default recommended
- **Port Configuration**: Default port 50021

#### VoiceVox API Testing
```bash
# Test VoiceVox API availability (after installation)
curl -X POST "http://localhost:50021/audio_query?text=テスト&speaker=0"

# Alternative: Test in browser
# Open http://localhost:50021/docs for API documentation
```

### 3. Development Tools

#### Code Editor Extensions (VS Code)
```json
// Recommended VS Code extensions for development
{
    "recommendations": [
        "ms-vscode.vscode-typescript-next",
        "ms-vscode.extension-test-runner",
        "ms-vscode.vscode-json",
        "bradlc.vscode-tailwindcss",
        "esbenp.prettier-vscode"
    ]
}
```

#### Git Configuration
```bash
# Configure Git for version control
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Initialize repository (if not already done)
cd /path/to/VboxResponce
git init
git add .
git commit -m "Initial project setup"
```

## Project Structure Preparation

### Directory Structure
```
VboxResponce/
├── .vscode/                    # VS Code workspace settings
│   ├── launch.json            # Debug configuration
│   ├── tasks.json             # Build tasks
│   └── settings.json          # Workspace settings
├── src/                       # Source code
│   ├── extension.ts           # Main extension entry point
│   ├── copilotMonitor.ts      # Copilot detection logic
│   ├── audioManager.ts        # Audio playback management
│   ├── voicevoxClient.ts      # VoiceVox API client
│   └── types.ts               # Type definitions
├── assets/                    # Audio assets
│   ├── completion-success.wav
│   ├── completion-error.wav
│   └── long-process.wav
├── test/                      # Test files
│   └── suite/
├── package.json               # Extension manifest
├── tsconfig.json              # TypeScript configuration
├── webpack.config.js          # Bundling configuration
└── README.md                  # Extension documentation
```

### Initial File Templates

#### package.json Template
```json
{
    "name": "voicevox-copilot-notifier",
    "displayName": "VoiceVox Copilot Notifier",
    "description": "Voice notifications for GitHub Copilot Chat completion",
    "version": "0.1.0",
    "engines": {
        "vscode": "^1.70.0"
    },
    "categories": ["Other"],
    "activationEvents": [
        "onStartupFinished"
    ],
    "main": "./out/extension.js",
    "contributes": {
        "commands": [
            {
                "command": "voicevox-copilot.toggle",
                "title": "Toggle Voice Notifications"
            },
            {
                "command": "voicevox-copilot.playTest",
                "title": "Play Test Sound"
            }
        ],
        "configuration": {
            "title": "VoiceVox Copilot Notifier",
            "properties": {
                "voicevox-copilot.enabled": {
                    "type": "boolean",
                    "default": true,
                    "description": "Enable voice notifications"
                },
                "voicevox-copilot.voiceCharacter": {
                    "type": "string",
                    "enum": ["zundamon", "metan", "tsumugi"],
                    "default": "zundamon",
                    "description": "Voice character selection"
                },
                "voicevox-copilot.volume": {
                    "type": "number",
                    "default": 0.7,
                    "minimum": 0.0,
                    "maximum": 1.0,
                    "description": "Audio volume (0.0 - 1.0)"
                }
            }
        }
    },
    "scripts": {
        "vscode:prepublish": "npm run compile",
        "compile": "tsc -p ./",
        "watch": "tsc -watch -p ./",
        "pretest": "npm run compile && npm run lint",
        "lint": "eslint src --ext ts",
        "test": "node ./out/test/runTest.js"
    },
    "devDependencies": {
        "@types/vscode": "^1.70.0",
        "@types/node": "16.x",
        "@typescript-eslint/eslint-plugin": "^5.31.0",
        "@typescript-eslint/parser": "^5.31.0",
        "eslint": "^8.20.0",
        "typescript": "^4.7.4"
    }
}
```

#### tsconfig.json Template
```json
{
    "compilerOptions": {
        "module": "commonjs",
        "target": "ES2020",
        "outDir": "out",
        "lib": [
            "ES2020",
            "DOM"
        ],
        "sourceMap": true,
        "rootDir": "src",
        "strict": true
    },
    "exclude": [
        "node_modules",
        ".vscode-test"
    ]
}
```

## Development Workflow Setup

### VS Code Debug Configuration

#### .vscode/launch.json
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Run Extension",
            "type": "extensionHost",
            "request": "launch",
            "args": [
                "--extensionDevelopmentPath=${workspaceFolder}"
            ],
            "outFiles": [
                "${workspaceFolder}/out/**/*.js"
            ],
            "preLaunchTask": "${workspaceFolder}/npm: compile"
        },
        {
            "name": "Extension Tests",
            "type": "extensionHost",
            "request": "launch",
            "args": [
                "--extensionDevelopmentPath=${workspaceFolder}",
                "--extensionTestsPath=${workspaceFolder}/out/test/suite/index"
            ],
            "outFiles": [
                "${workspaceFolder}/out/test/**/*.js"
            ],
            "preLaunchTask": "${workspaceFolder}/npm: compile"
        }
    ]
}
```

### Build Tasks Configuration

#### .vscode/tasks.json
```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "type": "npm",
            "script": "compile",
            "group": "build",
            "presentation": {
                "reveal": "silent"
            },
            "problemMatcher": [
                "$tsc"
            ]
        },
        {
            "type": "npm",
            "script": "watch",
            "isBackground": true,
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "presentation": {
                "reveal": "never"
            },
            "problemMatcher": [
                "$tsc-watch"
            ]
        }
    ]
}
```

## Audio Assets Preparation

### VoiceVox Audio Generation Script

#### scripts/generateAudioAssets.js
```javascript
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const VOICEVOX_URL = 'http://localhost:50021';
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

const PHRASES = {
    'completion-success': 'お疲れさまでした！',
    'completion-error': 'エラーが発生しました',
    'long-process': 'もう少しお待ちください',
    'task-complete': 'タスクが完了しました！'
};

const SPEAKERS = {
    'zundamon': 0,
    'metan': 2,
    'tsumugi': 8
};

async function generateAudioAssets() {
    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }

    for (const [phraseId, text] of Object.entries(PHRASES)) {
        for (const [voiceName, speakerId] of Object.entries(SPEAKERS)) {
            try {
                console.log(`Generating: ${phraseId}_${voiceName}.wav`);
                
                // Step 1: Generate audio query
                const queryResponse = await fetch(
                    `${VOICEVOX_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
                    { method: 'POST' }
                );
                const audioQuery = await queryResponse.json();
                
                // Step 2: Generate audio
                const audioResponse = await fetch(
                    `${VOICEVOX_URL}/synthesis?speaker=${speakerId}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(audioQuery)
                    }
                );
                
                const audioBuffer = await audioResponse.buffer();
                const filename = `${phraseId}_${voiceName}.wav`;
                fs.writeFileSync(path.join(ASSETS_DIR, filename), audioBuffer);
                
                console.log(`✓ Generated: ${filename}`);
            } catch (error) {
                console.error(`✗ Failed to generate ${phraseId}_${voiceName}:`, error.message);
            }
        }
    }
    
    console.log('Audio asset generation complete!');
}

// Run if called directly
if (require.main === module) {
    generateAudioAssets().catch(console.error);
}

module.exports = { generateAudioAssets };
```

## Testing Environment Setup

### Manual Testing Checklist
```markdown
# Testing Checklist

## Environment Verification
- [ ] VS Code version 1.70+
- [ ] Node.js v16+
- [ ] VoiceVox running on localhost:50021
- [ ] GitHub Copilot extension active

## Extension Development Testing
- [ ] Extension loads without errors
- [ ] Commands appear in Command Palette
- [ ] Settings appear in VS Code preferences
- [ ] Debug configuration works

## Integration Testing with Copilot
- [ ] Copilot Chat panel detection
- [ ] Completion event detection
- [ ] Audio playback functionality
- [ ] Error handling when VoiceVox unavailable

## Audio Assets Testing
- [ ] All audio files generated successfully
- [ ] Audio files play correctly
- [ ] Volume control works
- [ ] Voice character selection works
```

## Next Steps Checklist

### Immediate Setup (Today)
- [ ] Install Node.js and npm
- [ ] Install VoiceVox and verify API
- [ ] Install VS Code extension development tools
- [ ] Set up project directory structure

### Development Environment (This Week)
- [ ] Generate extension scaffold using Yeoman
- [ ] Configure TypeScript and build system
- [ ] Set up debugging configuration
- [ ] Create initial audio assets

### Development Start (Next Week)
- [ ] Implement basic extension structure
- [ ] Create VoiceVox client integration
- [ ] Begin Copilot detection prototype
- [ ] Set up testing framework

## Potential Issues and Solutions

### Common Setup Problems

1. **VoiceVox Port Conflicts**
   ```bash
   # Check if port 50021 is available
   netstat -an | findstr :50021
   
   # Kill process if needed (Windows)
   taskkill /F /PID <process_id>
   ```

2. **Node.js Version Issues**
   ```bash
   # Use nvm to switch Node.js versions
   nvm install 18
   nvm use 18
   ```

3. **Extension Development Path Issues**
   - Ensure no spaces in project path
   - Use forward slashes in configuration files
   - Verify VS Code workspace settings

Would you like me to help you with any specific part of this setup, or would you prefer to start with generating the extension scaffold right away?
