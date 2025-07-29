import * as vscode from 'vscode';
import { AudioManager, NotificationType } from './audioManager';
import { ConfigurationManager } from './configurationManager';

let randomChatTimer: NodeJS.Timeout | undefined;
let midnightTimer: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('VoiceVox Companion is now active!');
    
    try {
        // Initialize managers
        const configManager = new ConfigurationManager();
        const audioManager = new AudioManager(context.extensionPath, configManager);

        // Initialize audio manager
        audioManager.initialize().then(async () => {
            console.log('VoiceVox Companion initialized successfully');
            
            // Play startup greeting if enabled
            const config = configManager.getConfiguration();
            if (config.enableStartupGreeting) {
                try {
                    console.log('🎵 Playing startup greeting...');
                    await audioManager.playCompletionSound(NotificationType.EXTENSION_ACTIVATED);
                    console.log('Startup greeting played successfully');
                } catch (error) {
                    console.error('Failed to play startup greeting:', error);
                }
            }

            // Start random chat timer if enabled
            startRandomChatTimer(configManager, audioManager);
            
            // Start midnight timer
            startMidnightTimer(audioManager);
            
        }).catch(error => {
            console.error('Failed to initialize VoiceVox Companion:', error);
            vscode.window.showErrorMessage(`VoiceVox Companion initialization failed: ${error.message}`);
        });

        // Register random chat command
        const randomChatCommand = vscode.commands.registerCommand(
            'voicevoxCompanion.randomChat',
            async () => {
                try {
                    console.log('🎵 Playing random chat...');
                    await audioManager.playRandomSound();
                    
                } catch (error) {
                    console.error('Failed to play random chat:', error);
                    vscode.window.showErrorMessage('Failed to play random chat');
                }
            }
        );

        // Listen for configuration changes
        const configChangeListener = vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('voicevoxCompanion')) {
                console.log('Configuration changed, restarting timer...');
                configManager.refresh();
                
                // Restart random chat timer with new settings
                stopRandomChatTimer();
                startRandomChatTimer(configManager, audioManager);
            }
        });

        // Register for disposal
        context.subscriptions.push(
            randomChatCommand,
            configChangeListener,
            audioManager,
            { dispose: () => {
                stopRandomChatTimer();
                stopMidnightTimer();
            }}
        );

    } catch (error) {
        console.error('Failed to activate VoiceVox Companion:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`VoiceVox Companion activation failed: ${errorMessage}`);
    }
}

function startRandomChatTimer(configManager: ConfigurationManager, audioManager: AudioManager) {
    const config = configManager.getConfiguration();
    const intervalMinutes = config.randomChatInterval;
    
    if (intervalMinutes <= 0) {
        console.log('Random chat timer disabled');
        return;
    }

    const intervalMs = intervalMinutes * 60 * 1000;
    console.log(`Starting random chat timer: ${intervalMinutes} minutes`);
    
    randomChatTimer = setInterval(async () => {
        try {
            console.log('🎵 Timer triggered random chat...');
            await vscode.commands.executeCommand('voicevoxCompanion.randomChat');
        } catch (error) {
            console.error('Timer random chat failed:', error);
        }
    }, intervalMs);
}

function startMidnightTimer(audioManager: AudioManager) {
    // Calculate time until next midnight
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Next midnight
    
    const timeUntilMidnight = midnight.getTime() - now.getTime();
    console.log(`Time until midnight: ${Math.round(timeUntilMidnight / 1000 / 60)} minutes`);
    
    // Set initial timer for midnight
    setTimeout(async () => {
        try {
            console.log('🌙 Midnight! Playing night sound...');
            await audioManager.playNightSound();
            
            // Set up recurring daily timer
            midnightTimer = setInterval(async () => {
                try {
                    console.log('🌙 Daily midnight sound...');
                    await audioManager.playNightSound();
                } catch (error) {
                    console.error('Midnight sound failed:', error);
                }
            }, 24 * 60 * 60 * 1000); // 24 hours
            
        } catch (error) {
            console.error('Initial midnight sound failed:', error);
        }
    }, timeUntilMidnight);
}

function stopRandomChatTimer() {
    if (randomChatTimer) {
        clearInterval(randomChatTimer);
        randomChatTimer = undefined;
        console.log('Random chat timer stopped');
    }
}

function stopMidnightTimer() {
    if (midnightTimer) {
        clearInterval(midnightTimer);
        midnightTimer = undefined;
        console.log('Midnight timer stopped');
    }
}

export function deactivate() {
    console.log('VoiceVox Companion deactivated');
    stopRandomChatTimer();
    stopMidnightTimer();
}
