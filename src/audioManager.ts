import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { spawn } from 'child_process';
import { ConfigurationManager, NotificationConfig } from './configurationManager';

export enum NotificationType {
    TASK_COMPLETE = 'task-complete'
}

export class AudioManager implements vscode.Disposable {
    private extensionPath: string;
    private configManager: ConfigurationManager;
    private lastPlayedFile: string | null = null;
    
    // 🆕 Audio caching properties
    private audioCache: Map<string, Buffer> = new Map();
    private tempDir: string;
    private isPlaying: boolean = false; // Prevent concurrent playback

    constructor(extensionPath: string, configManager: ConfigurationManager) {
        this.extensionPath = extensionPath;
        this.configManager = configManager;
        this.tempDir = path.join(os.tmpdir(), 'voicevox-copilot');
    }

    async initialize(): Promise<void> {
        try {
            // Setup temporary directory for cached audio files
            await this.setupTempDirectory();
            
            // Verify audio assets exist
            await this.verifyAudioAssets();
            
            // Preload audio files into memory
            await this.preloadAudioFiles();
            
            console.log('AudioManager initialized successfully with audio caching');
        } catch (error) {
            console.error('Failed to initialize AudioManager:', error);
            throw new Error(`Audio initialization failed: ${error}`);
        }
    }

    private async verifyAudioAssets(): Promise<void> {
        const assetsPath = path.join(this.extensionPath, 'assets');
        
        if (!fs.existsSync(assetsPath)) {
            throw new Error(`Assets directory not found: ${assetsPath}`);
        }

        const config = this.configManager.getConfiguration();
        
        // task-complete_*** ファイルを動的にスキャン
        const taskCompleteFiles = this.getAllTaskCompleteFiles(assetsPath);
        console.log(`Found ${taskCompleteFiles.length} task-complete files for preloading`);

        for (const file of taskCompleteFiles) {
            const filePath = path.join(assetsPath, file);
            if (!fs.existsSync(filePath)) {
                console.warn(`Audio file not found: ${filePath}`);
            }
        }

        console.log(`Audio assets verified for voice character: ${config.voiceCharacter}`);
    }

    private async setupTempDirectory(): Promise<void> {
        try {
            if (!fs.existsSync(this.tempDir)) {
                fs.mkdirSync(this.tempDir, { recursive: true });
                console.log(`Created temp directory: ${this.tempDir}`);
            } else {
                // Clean up any existing temp files
                const files = fs.readdirSync(this.tempDir);
                for (const file of files) {
                    if (file.endsWith('.wav')) {
                        fs.unlinkSync(path.join(this.tempDir, file));
                    }
                }
                console.log(`Cleaned up temp directory: ${this.tempDir}`);
            }
        } catch (error) {
            console.error('Failed to setup temp directory:', error);
            throw error;
        }
    }

    private async preloadAudioFiles(): Promise<void> {
        try {
            const assetsPath = path.join(this.extensionPath, 'assets');
            
            // Load all task-complete files for random selection
            const taskCompleteFiles = this.getAllTaskCompleteFiles(assetsPath);
            console.log(`Preloading ${taskCompleteFiles.length} task-complete files`);
            
            let loadedCount = 0;
            for (const filename of taskCompleteFiles) {
                const audioPath = path.join(assetsPath, filename);
                if (fs.existsSync(audioPath)) {
                    const audioData = fs.readFileSync(audioPath);
                    this.audioCache.set(filename, audioData);
                    console.log(`Preloaded: ${filename} (${audioData.length} bytes)`);
                    loadedCount++;
                } else {
                    console.warn(`Audio file not found for preloading: ${audioPath}`);
                }
            }

            if (loadedCount === 0) {
                throw new Error('No audio files could be preloaded');
            }

            console.log(`Successfully preloaded ${loadedCount} audio files`);
        } catch (error) {
            console.error('Failed to preload audio files:', error);
            throw error;
        }
    }

    private getAllTaskCompleteFiles(assetsPath: string): string[] {
        try {
            const allFiles = fs.readdirSync(assetsPath);
            const taskCompleteFiles = allFiles.filter(file => {
                return file.startsWith('task-complete_') && (file.endsWith('.wav') || file.endsWith('.mp3'));
            });
            
            console.log(`Found ${taskCompleteFiles.length} task-complete files:`, taskCompleteFiles);
            return taskCompleteFiles;
        } catch (error) {
            console.error('Failed to read assets directory:', error);
            return [];
        }
    }

    private getRandomTaskCompleteFile(): string {
        const assetsPath = path.join(this.extensionPath, 'assets');
        const taskCompleteFiles = this.getAllTaskCompleteFiles(assetsPath);
        
        if (taskCompleteFiles.length === 0) {
            // Fallback to configured voice character
            const config = this.configManager.getConfiguration();
            return `task-complete_${config.voiceCharacter}.wav`;
        }
        
        // Select random file
        const randomIndex = Math.floor(Math.random() * taskCompleteFiles.length);
        const selectedFile = taskCompleteFiles[randomIndex];
        
        console.log(`🎲 Randomly selected task-complete file: ${selectedFile} (${randomIndex + 1}/${taskCompleteFiles.length})`);
        return selectedFile;
    }

    async playCompletionSound(type: NotificationType = NotificationType.TASK_COMPLETE): Promise<void> {
        const config = this.configManager.getConfiguration();
        
        if (!config.enabled) {
            return;
        }

        // Add delay if configured
        if (config.notificationDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, config.notificationDelay));
        }

        try {
            // Play the actual audio file
            await this.playAudioFile(type, config);
        } catch (error) {
            console.error('Failed to play completion sound:', error);
            // Fallback to placeholder
            await this.playAudioPlaceholder(type, config);
        }
    }

    private async playAudioFile(type: NotificationType, config: NotificationConfig): Promise<void> {
        // Check if already playing to prevent concurrent playback
        if (this.isPlaying) {
            console.log('Audio already playing, skipping...');
            return;
        }

        // For TASK_COMPLETE, use random selection if enabled
        let filename: string;
        if (type === NotificationType.TASK_COMPLETE && config.randomTaskComplete) {
            filename = this.getRandomTaskCompleteFile();
            console.log(`🎯 Using random task-complete file: ${filename}`);
        } else {
            filename = `${type}_${config.voiceCharacter}.wav`;
        }

        const audioData = this.audioCache.get(filename);

        if (!audioData) {
            // Fallback to original file-based approach
            console.warn(`Audio not found in cache: ${filename}, falling back to file system`);
            return this.playAudioFileFromDisk(type, config);
        }

        this.isPlaying = true;

        // Create temporary file from cached data
        const tempFilePath = path.join(this.tempDir, `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${filename}`);
        
        try {
            fs.writeFileSync(tempFilePath, audioData);
            console.log(`Created temp audio file: ${tempFilePath}`);

            this.lastPlayedFile = tempFilePath;

            // Use PowerShell to play audio on Windows
            const command = `Add-Type -AssemblyName presentationCore; $player = New-Object System.Windows.Media.MediaPlayer; $player.Open([uri]"${tempFilePath}"); $player.Play(); Start-Sleep -Seconds 3`;
            
            console.log(`Playing audio from cache: ${filename}`);
            
            const powershell = spawn('powershell.exe', ['-Command', command], {
                windowsHide: true
            });

            return new Promise<void>((resolve, reject) => {
                let resolved = false;

                const cleanup = () => {
                    this.isPlaying = false;
                    // Clean up temporary file
                    try {
                        if (fs.existsSync(tempFilePath)) {
                            fs.unlinkSync(tempFilePath);
                            console.log(`Cleaned up temp file: ${tempFilePath}`);
                        }
                    } catch (cleanupError) {
                        console.warn('Failed to cleanup temp file:', cleanupError);
                    }
                };

                powershell.on('close', (code: number) => {
                    if (resolved) return;
                    resolved = true;
                    
                    cleanup();
                    
                    if (code === 0) {
                        console.log(`Audio played successfully from cache: ${filename}`);
                        resolve();
                    } else {
                        reject(new Error(`PowerShell process exited with code ${code}`));
                    }
                });

                powershell.on('error', (error: Error) => {
                    if (resolved) return;
                    resolved = true;
                    
                    cleanup();
                    reject(error);
                });

                // Add timeout to prevent hanging
                setTimeout(() => {
                    if (resolved) return;
                    resolved = true;
                    
                    console.warn('Audio playback timeout, killing process');
                    powershell.kill();
                    cleanup();
                    reject(new Error('Audio playback timeout'));
                }, 10000); // 10 second timeout
            });
        } catch (error) {
            this.isPlaying = false;
            // Clean up on error
            try {
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
            } catch (cleanupError) {
                console.warn('Failed to cleanup temp file after error:', cleanupError);
            }
            throw error;
        }
    }

    // Fallback method for when cache is not available
    private async playAudioFileFromDisk(type: NotificationType, config: NotificationConfig): Promise<void> {
        const assetsPath = path.join(this.extensionPath, 'assets');
        
        // For TASK_COMPLETE, use random selection if enabled
        let filename: string;
        if (type === NotificationType.TASK_COMPLETE && config.randomTaskComplete) {
            filename = this.getRandomTaskCompleteFile();
            console.log(`🎯 Using random task-complete file (disk fallback): ${filename}`);
        } else {
            filename = `${type}_${config.voiceCharacter}.wav`;
        }
        
        const audioPath = path.join(assetsPath, filename);

        if (!fs.existsSync(audioPath)) {
            throw new Error(`Audio file not found: ${audioPath}`);
        }

        this.isPlaying = true;
        this.lastPlayedFile = audioPath;

        // Use PowerShell to play audio on Windows
        const command = `Add-Type -AssemblyName presentationCore; $player = New-Object System.Windows.Media.MediaPlayer; $player.Open([uri]"${audioPath}"); $player.Play(); Start-Sleep -Seconds 3`;
        
        console.log(`Playing audio from disk: ${filename}`);
        
        try {
            const powershell = spawn('powershell.exe', ['-Command', command], {
                windowsHide: true
            });

            return new Promise<void>((resolve, reject) => {
                let resolved = false;

                const cleanup = () => {
                    this.isPlaying = false;
                };

                powershell.on('close', (code: number) => {
                    if (resolved) return;
                    resolved = true;
                    
                    cleanup();
                    if (code === 0) {
                        console.log(`Audio played successfully from disk: ${filename}`);
                        resolve();
                    } else {
                        reject(new Error(`PowerShell process exited with code ${code}`));
                    }
                });

                powershell.on('error', (error: Error) => {
                    if (resolved) return;
                    resolved = true;
                    
                    cleanup();
                    reject(error);
                });

                // Add timeout to prevent hanging
                setTimeout(() => {
                    if (resolved) return;
                    resolved = true;
                    
                    console.warn('Audio playback timeout, killing process');
                    powershell.kill();
                    cleanup();
                    reject(new Error('Audio playback timeout'));
                }, 10000); // 10 second timeout
            });
        } catch (error) {
            this.isPlaying = false;
            throw error;
        }
    }

    private async playAudioPlaceholder(type: NotificationType, config: NotificationConfig): Promise<void> {
        // Fallback placeholder implementation
        const phrases = {
            [NotificationType.TASK_COMPLETE]: 'タスクが完了しました'
        };

        const phrase = phrases[type];
        console.log(`[Audio Placeholder] Playing: "${phrase}" with ${config.voiceCharacter} at volume ${config.volume}`);
        
        // Show notification in VS Code as fallback
        vscode.window.showInformationMessage(
            `🔊 VoiceVox: "${phrase}" (${config.voiceCharacter})`,
            { modal: false }
        );
    }

    async playLastNotification(): Promise<void> {
        if (this.lastPlayedFile && fs.existsSync(this.lastPlayedFile)) {
            console.log('Replaying last notification');
            
            const config = this.configManager.getConfiguration();
            const filename = path.basename(this.lastPlayedFile);
            const type = this.getNotificationTypeFromFilename(filename);
            
            await this.playAudioFile(type, config);
        } else {
            vscode.window.showInformationMessage('No previous notification to replay');
        }
    }

    private getNotificationTypeFromFilename(filename: string): NotificationType {
        // 現在は task-complete ファイルのみを使用
        return NotificationType.TASK_COMPLETE;
    }

    updateConfiguration(): void {
        // Reload audio assets if voice character changed
        const config = this.configManager.getConfiguration();
        console.log('Audio configuration updated:', config);
        
        // Clear last played file since character might have changed
        this.lastPlayedFile = null;
        
        // Clear audio cache to force reload with new voice character
        this.audioCache.clear();
        console.log('Audio cache cleared for voice character change');
        
        // Verify assets for new voice character
        this.verifyAudioAssets().catch(error => {
            console.error('Failed to verify audio assets after configuration update:', error);
        });
        
        // Preload audio files for new voice character
        this.preloadAudioFiles().catch(error => {
            console.error('Failed to preload audio files after configuration update:', error);
        });
        
        console.log(`Voice character changed to: ${config.voiceCharacter}`);
        console.log(`Random task complete enabled: ${config.randomTaskComplete}`);
    }

    dispose(): void {
        // Clear audio cache
        this.audioCache.clear();
        
        // Clean up temporary directory
        try {
            if (fs.existsSync(this.tempDir)) {
                const files = fs.readdirSync(this.tempDir);
                for (const file of files) {
                    if (file.endsWith('.wav')) {
                        fs.unlinkSync(path.join(this.tempDir, file));
                    }
                }
                // Try to remove the directory if it's empty
                try {
                    fs.rmdirSync(this.tempDir);
                    console.log(`Removed temp directory: ${this.tempDir}`);
                } catch (dirError) {
                    // Directory might not be empty, that's OK
                    console.log(`Temp directory not empty, leaving: ${this.tempDir}`);
                }
            }
        } catch (error) {
            console.warn('Failed to cleanup temp directory during disposal:', error);
        }
        
        this.lastPlayedFile = null;
        this.isPlaying = false;
        console.log('AudioManager disposed with cache cleanup');
    }
}
