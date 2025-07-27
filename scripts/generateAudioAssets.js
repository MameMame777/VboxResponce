const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const VOICEVOX_URL = 'http://localhost:50021';
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

const PHRASES = {
    'completion-success': {
        'zundamon': 'お疲れさまなのだ！',
        'metan': 'お疲れさまでした♪',
        'tsumugi': 'お疲れさまです〜',
        'kiritan': 'お疲れさまでした〜'
    },
    'completion-error': {
        'zundamon': 'エラーが発生したのだ！',
        'metan': 'あらあら、エラーですね',
        'tsumugi': 'エラーが出ちゃいました〜',
        'kiritan': 'エラーが起きてしまいました'
    },
    'long-process': {
        'zundamon': 'もう少し待つのだ〜',
        'metan': 'もう少しお待ちくださいね',
        'tsumugi': 'もうちょっと待ってください〜',
        'kiritan': 'もう少しお待ちください〜'
    },
    'task-complete': {
        'zundamon': 'タスク完了なのだ！',
        'metan': 'タスクが完了しましたよ♪',
        'tsumugi': 'タスク完了です〜！',
        'kiritan': 'タスクが完了しました〜'
    }
};

const SPEAKERS = {
    'zundamon': 3,   // ずんだもん ノーマル
    'metan': 2,      // 四国めたん ノーマル
    'tsumugi': 8,    // 春日部つむぎ ノーマル
    'kiritan': 108   // 東北きりたん ノーマル
};

// 抑揚設定（各キャラクターの個性に合わせて調整）
const VOICE_SETTINGS = {
    'zundamon': {
        speedScale: 1.1,      // 少し早めに話す（元気なキャラクター）
        pitchScale: 0,     // 少し高めに調整
        intonationScale: 1.2, // 抑揚を強めに（感情豊か）
        volumeScale: 1.0      // 標準音量
    },
    'metan': {
        speedScale: 0.9,      // ゆっくり丁寧に話す
        pitchScale: 0.0,      // 標準ピッチ
        intonationScale: 0.8, // 抑揚を控えめに（上品な感じ）
        volumeScale: 1.0      // 標準音量
    },
    'tsumugi': {
        speedScale: 0.8,      // のんびりゆっくり話す
        pitchScale: -0.1,     // 少し低めのピッチ
        intonationScale: 0.6, // 抑揚を小さく（落ち着いた感じ）
        volumeScale: 1.0      // 標準音量
    },
    'kiritan': {
        speedScale: 1.0,      // 標準的な話速
        pitchScale: 0.0,      // 標準ピッチ
        intonationScale: 1.2, // 標準的な抑揚（自然な感じ）
        volumeScale: 1.0      // 標準音量
    }
};

async function checkVoiceVoxAvailable() {
    try {
        const response = await fetch(`${VOICEVOX_URL}/version`);
        if (response.ok) {
            const version = await response.text();
            console.log(`VoiceVox is available - Version: ${version}`);
            return true;
        }
    } catch (error) {
        console.error('VoiceVox is not available:', error.message);
        console.log('Please make sure VoiceVox is running on http://localhost:50021');
        return false;
    }
    return false;
}

async function generateAudioAssets() {
    console.log('🎵 Starting VoiceVox audio asset generation...');
    
    // Check if VoiceVox is available
    if (!(await checkVoiceVoxAvailable())) {
        console.error('❌ Cannot proceed without VoiceVox running');
        process.exit(1);
    }

    // Create assets directory if it doesn't exist
    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR, { recursive: true });
        console.log(`📁 Created assets directory: ${ASSETS_DIR}`);
    }

    let successCount = 0;
    let totalCount = 0;

    for (const [phraseId, phraseTexts] of Object.entries(PHRASES)) {
        for (const [voiceName, speakerId] of Object.entries(SPEAKERS)) {
            totalCount++;
            try {
                const text = phraseTexts[voiceName];
                const voiceSettings = VOICE_SETTINGS[voiceName];
                console.log(`🎙️  Generating: ${phraseId}_${voiceName}.wav - "${text}"`);
                console.log(`   Settings: speed=${voiceSettings.speedScale}, pitch=${voiceSettings.pitchScale}, intonation=${voiceSettings.intonationScale}`);
                
                // Step 1: Generate audio query
                const queryResponse = await fetch(
                    `${VOICEVOX_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
                    { method: 'POST' }
                );
                
                if (!queryResponse.ok) {
                    throw new Error(`Audio query failed: ${queryResponse.status} ${queryResponse.statusText}`);
                }
                
                const audioQuery = await queryResponse.json();
                
                // Step 2: Apply voice settings to audio query
                audioQuery.speedScale = voiceSettings.speedScale;
                audioQuery.pitchScale = voiceSettings.pitchScale;
                audioQuery.intonationScale = voiceSettings.intonationScale;
                audioQuery.volumeScale = voiceSettings.volumeScale;
                
                // Step 3: Generate audio with modified query
                const audioResponse = await fetch(
                    `${VOICEVOX_URL}/synthesis?speaker=${speakerId}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(audioQuery)
                    }
                );
                
                if (!audioResponse.ok) {
                    throw new Error(`Audio synthesis failed: ${audioResponse.status} ${audioResponse.statusText}`);
                }
                
                const audioBuffer = await audioResponse.buffer();
                const filename = `${phraseId}_${voiceName}.wav`;
                const filePath = path.join(ASSETS_DIR, filename);
                
                fs.writeFileSync(filePath, audioBuffer);
                
                console.log(`✅ Generated: ${filename} (${audioBuffer.length} bytes)`);
                successCount++;
                
                // Small delay to avoid overwhelming VoiceVox
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`❌ Failed to generate ${phraseId}_${voiceName}:`, error.message);
            }
        }
    }
    
    console.log(`\n🎉 Audio asset generation complete!`);
    console.log(`📊 Success: ${successCount}/${totalCount} files generated`);
    
    if (successCount === 0) {
        console.error('❌ No audio files were generated successfully');
        process.exit(1);
    } else if (successCount < totalCount) {
        console.warn(`⚠️  ${totalCount - successCount} files failed to generate`);
    }
    
    // List generated files
    console.log('\n📋 Generated audio files:');
    const files = fs.readdirSync(ASSETS_DIR).filter(f => f.endsWith('.wav'));
    files.forEach(file => {
        const filePath = path.join(ASSETS_DIR, file);
        const stats = fs.statSync(filePath);
        console.log(`   ${file} (${stats.size} bytes)`);
    });
}

// Run if called directly
if (require.main === module) {
    generateAudioAssets().catch(error => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
}

module.exports = { generateAudioAssets };
