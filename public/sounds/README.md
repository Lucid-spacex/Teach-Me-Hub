# Notification Sounds

Place a royalty-free notification sound file named `notification.mp3` in this directory.

The NotificationProvider will attempt to play this file when a new notification arrives via SSE.
If the file is missing or fails to load, the Web Audio API fallback will generate a simple beep sound.

Recommended: A short, pleasant notification sound under 1 second in length.
