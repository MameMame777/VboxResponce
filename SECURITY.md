# Security Policy

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by emailing <security@nautilus-dev.com>.

Please do not report security vulnerabilities through public GitHub issues.

## Security Considerations

### Data Collection

- This extension does not collect any personal data
- No telemetry is sent to external servers
- All audio processing happens locally

### Audio Files

- Pre-generated audio files are included in the extension
- No network requests are made for audio generation
- Audio files are cached locally in system temp directory

### Permissions

- Extension only requires VS Code API access
- No network permissions needed
- No file system access outside of extension directory

### Dependencies

- Minimal dependencies to reduce attack surface
- Regular dependency updates for security patches
