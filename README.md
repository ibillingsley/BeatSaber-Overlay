# Beat Saber Overlay

Simple Beat Saber stream overlay for [twitch.tv/iza_k](https://www.twitch.tv/iza_k)

Requires [BeatSaberPlus](https://github.com/hardcpp/BeatSaberPlus) SongOverlay

### Preview
<img width="606" height="96" alt="Screenshot" src="https://github.com/user-attachments/assets/96b8e7ce-66ed-4327-a915-ee309d2296c3" />

## Usage - OBS Studio
Add Source > Browser > URL: `https://bs-overlay.netlify.app/`

### Configuration - Custom CSS
To change size, set root font size (default 10px)
```css
:root { font-size: 15px; }
```
To right align
```css
body > .row { flex-direction: row-reverse; } .row { justify-content: flex-end; }
```
To change fade duration (default 300ms)
```css
body { transition-duration: 500ms; }
```
To change font
```css
body { font-family: "Comic Sans MS", cursive; }
```
