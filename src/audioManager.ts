import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { spawn } from 'child_process';
import { ConfigurationManager, NotificationConfig } from './configurationManager';

export enum NotificationType {
    TASK_COMPLETE = 'task-complete',
    EXTENSION_ACTIVATED = 'activated'
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
            
            // Load all task-complete files
            const taskCompleteFiles = this.getAllTaskCompleteFiles(assetsPath);
            console.log(`Preloading ${taskCompleteFiles.length} task-complete files`);
            
            // Also preload activation sounds for all characters
            const characters = ['zundamon', 'metan', 'tsumugi', 'kiritan'];
            const activationFiles = characters.map(char => `activated-${char}.wav`);
            
            const allFilesToPreload = [...taskCompleteFiles, ...activationFiles];
            
            let loadedCount = 0;
            for (const filename of allFilesToPreload) {
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
        // Return all possible character files
        const characters = ['zundamon', 'metan', 'tsumugi', 'kiritan'];
        return characters.map(char => `task-complete_${char}.wav`);
    }

    async playCompletionSound(type: NotificationType = NotificationType.TASK_COMPLETE): Promise<void> {
        const config = this.configManager.getConfiguration();
        
        console.log(`🎵 playCompletionSound called with type: ${type}`);
        console.log(`🎵 Voice character: ${config.voiceCharacter}, Volume: ${config.volume}`);

        try {
            // Play the actual audio file
            await this.playAudioFile(type, config);
        } catch (error) {
            console.error('Failed to play completion sound:', error);
            // Fallback to placeholder
            await this.playAudioPlaceholder(type, config);
        }
    }

    async playRandomSound(): Promise<void> {
        try {
            console.log('🎵 Playing random sound...');
            const randomFiles = ['random_yukari1.wav', 'random_yukari2.wav', 'random_zundamon.wav', 'random_kiritan.wav'];
            const selectedFile = randomFiles[Math.floor(Math.random() * randomFiles.length)];
            console.log(`🎲 Selected random file: ${selectedFile}`);
            
            await this.playSpecificFile(selectedFile);
        } catch (error) {
            console.error('Failed to play random sound:', error);
            throw error;
        }
    }

    async playNightSound(): Promise<void> {
        try {
            console.log('🌙 Playing night sound...');
            const nightFiles = ['atnight_yukari3.wav'];
            const selectedFile = nightFiles[Math.floor(Math.random() * nightFiles.length)];
            console.log(`🌙 Selected night file: ${selectedFile}`);
            
            await this.playSpecificFile(selectedFile);
        } catch (error) {
            console.error('Failed to play night sound:', error);
            throw error;
        }
    }

    private async playSpecificFile(filename: string): Promise<void> {
        const config = this.configManager.getConfiguration();
        
        // Check if already playing to prevent concurrent playback
        if (this.isPlaying) {
            console.log('Audio already playing, skipping...');
            return;
        }

        console.log(`🎵 Playing specific file: ${filename}`);

        const audioData = this.audioCache.get(filename);

        if (!audioData) {
            console.log(`Audio file not in cache, loading from disk: ${filename}`);
            return this.playSpecificFileFromDisk(filename, config);
        }

        try {
            this.isPlaying = true;
            const tempFilePath = path.join(this.tempDir, filename);
            
            // Write cached data to temp file
            fs.writeFileSync(tempFilePath, audioData);
            
            // Play the audio file using PowerShell
            await this.playAudioWithPowerShell(tempFilePath, config.volume);
            
            console.log(`🎵 Successfully played audio file: ${filename}`);
            
        } catch (error) {
            console.error(`Failed to play audio file ${filename}:`, error);
            throw error;
        } finally {
            this.isPlaying = false;
        }
    }

    private async playSpecificFileFromDisk(filename: string, config: NotificationConfig): Promise<void> {
        const assetsPath = path.join(this.extensionPath, 'assets');
        const audioPath = path.join(assetsPath, filename);

        if (!fs.existsSync(audioPath)) {
            throw new Error(`Audio file not found: ${audioPath}`);
        }

        try {
            this.isPlaying = true;
            await this.playAudioWithPowerShell(audioPath, config.volume);
            console.log(`🎵 Successfully played audio file from disk: ${filename}`);
        } catch (error) {
            console.error(`Failed to play audio file from disk ${filename}:`, error);
            throw error;
        } finally {
            this.isPlaying = false;
        }
    }

    private async playAudioWithPowerShell(audioPath: string, volume: number): Promise<void> {
        // Use PowerShell to play audio on Windows
        // Volume should be between 0.0 and 1.0, so use volume directly
        const command = `Add-Type -AssemblyName presentationCore; $player = New-Object System.Windows.Media.MediaPlayer; $player.Open([uri]"${audioPath}"); $player.Volume = ${volume}; $player.Play(); Start-Sleep -Seconds 3`;
        
        console.log(`Playing audio with PowerShell: ${audioPath}, Volume: ${volume}`);
        
        const powershell = spawn('powershell.exe', ['-Command', command], {
            windowsHide: true
        });

        return new Promise<void>((resolve, reject) => {
            let resolved = false;

            powershell.on('close', (code: number) => {
                if (resolved) return;
                resolved = true;

                if (code === 0) {
                    console.log(`Audio played successfully: ${audioPath}`);
                    resolve();
                } else {
                    reject(new Error(`PowerShell process exited with code ${code}`));
                }
            });

            powershell.on('error', (error: Error) => {
                if (resolved) return;
                resolved = true;
                reject(error);
            });

            // Timeout after 10 seconds
            setTimeout(() => {
                if (resolved) return;
                resolved = true;
                powershell.kill();
                reject(new Error('Audio playback timeout'));
            }, 10000);
        });
    }

    private async playAudioFile(type: NotificationType, config: NotificationConfig): Promise<void> {
        // Check if already playing to prevent concurrent playback
        if (this.isPlaying) {
            console.log('Audio already playing, skipping...');
            return;
        }

        console.log(`🎵 playAudioFile called with type: ${type}`);

        // Get filename based on type and character
        let filename: string;
        if (type === NotificationType.EXTENSION_ACTIVATED) {
            filename = `activated-${config.voiceCharacter}.wav`;
            console.log(`🚀 Using extension activation sound: ${filename}`);
        } else {
            filename = `${type}_${config.voiceCharacter}.wav`;
            console.log(`🎶 Using standard format: ${filename}`);
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
            const command = `Add-Type -AssemblyName presentationCore; $player = New-Object System.Windows.Media.MediaPlayer; $player.Open([uri]"${tempFilePath}"); $player.Volume = ${config.volume}; $player.Play(); Start-Sleep -Seconds 3`;
            
            console.log(`Playing audio from cache: ${filename}, Volume: ${config.volume}`);
            
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
        
        console.log(`🎵 playAudioFileFromDisk called with type: ${type}`);
        
        // Get filename based on type and character
        let filename: string;
        if (type === NotificationType.EXTENSION_ACTIVATED) {
            filename = `activated-${config.voiceCharacter}.wav`;
            console.log(`🚀 Using extension activation sound (disk fallback): ${filename}`);
        } else {
            filename = `${type}_${config.voiceCharacter}.wav`;
            console.log(`🎶 Using standard format (disk fallback): ${filename}`);
        }
        
        const audioPath = path.join(assetsPath, filename);

        if (!fs.existsSync(audioPath)) {
            throw new Error(`Audio file not found: ${audioPath}`);
        }

        this.isPlaying = true;
        this.lastPlayedFile = audioPath;

        // Use PowerShell to play audio on Windows
        const command = `Add-Type -AssemblyName presentationCore; $player = New-Object System.Windows.Media.MediaPlayer; $player.Open([uri]"${audioPath}"); $player.Volume = ${config.volume}; $player.Play(); Start-Sleep -Seconds 3`;
        
        console.log(`Playing audio from disk: ${filename}, Volume: ${config.volume}`);
        
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
            [NotificationType.TASK_COMPLETE]: 'タスクが完了しました',
            [NotificationType.EXTENSION_ACTIVATED]: '拡張機能が起動しました'
        };

        const phrase = phrases[type];
        console.log(`[Audio Placeholder] Playing: "${phrase}" with ${config.voiceCharacter} at volume ${config.volume}`);
        
        // Audio feedback only - no visual notification
    }

    async playLastNotification(): Promise<void> {
        if (this.lastPlayedFile && fs.existsSync(this.lastPlayedFile)) {
            console.log('Replaying last notification');
            
            const config = this.configManager.getConfiguration();
            const filename = path.basename(this.lastPlayedFile);
            const type = this.getNotificationTypeFromFilename(filename);
            
            await this.playAudioFile(type, config);
        } else {
            console.log('No previous notification to replay');
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
