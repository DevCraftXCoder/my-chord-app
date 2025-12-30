# 🔊 Audio Troubleshooting Guide

Your app now has Web Audio with enhanced debugging. Follow these steps to test and fix audio.

---

## ✅ Quick Test Steps:

### **1. Test Audio Test Page First**
Open: `frontend/audio-test.html` (double-click it)

Click each button:
- ✅ **Test Simple Beep** - Should hear 0.5 sec beep
- ✅ **Test Single Note** - Should hear piano note (C)
- ✅ **Test C Major Chord** - Should hear 3 notes together
- ✅ **Test Progression** - Should hear C-G-Am-F quickly

**If test page works**: Audio system is fine, issue is in main app
**If test page doesn't work**: Check browser/system audio

---

### **2. Test Main App with Console Open**

1. **Open the app**: http://localhost
2. **Open browser console**:
   - Press `F12` or `Ctrl+Shift+I`
   - Click "Console" tab
3. **Load sample progression**: Click button
4. **Click Play** and watch console

**You should see**:
```
[App] Checking audio initialization...
[App] Initializing audio for first time...
[Audio] ✅ Web Audio synthesizer initialized successfully
[Audio] Sample rate: 48000
[Audio] State: running
[App] ✅ Audio initialized
[App] Playing CMajor: notes [60,64,67], duration 2s
[Audio] 🎵 Playing chord: 60,64,67 for 2s at volume 0.5
[App] Playing GMajor: notes [67,71,74], duration 2s
...
```

---

## 🔍 Common Issues & Fixes:

### **Issue 1: No Console Messages**
**Problem**: JavaScript not loading
**Fix**:
- Hard refresh: `Ctrl+F5`
- Clear cache: `Ctrl+Shift+Delete`
- Check browser console for errors

---

### **Issue 2: "Failed to initialize audio"**
**Problem**: Browser blocked audio (autoplay policy)
**Fix**:
- Audio MUST be initialized by user click (already done)
- Check if browser audio is muted
- Try different browser (Chrome works best)

---

### **Issue 3: Console shows audio playing but no sound**
**Possible causes**:

**A. System volume is muted**
- Check Windows volume mixer
- Check browser tab isn't muted (right-click tab)

**B. Wrong audio output device**
- Open Windows Sound settings
- Check default playback device
- Make sure headphones/speakers are selected

**C. Browser audio settings**
- Chrome: `chrome://settings/content/sound`
- Make sure site isn't blocked

---

### **Issue 4: Crackling or distorted audio**
**Fix**: Volume too high
- The app uses 50% volume (0.5)
- If too loud/distorted, edit `audio-synth.js` line 22:
  ```javascript
  this.masterGain.gain.value = 0.3; // Lower to 30%
  ```

---

### **Issue 5: Audio cuts off early**
**Problem**: Duration calculation wrong
**Check**: Console should show correct duration
- At 120 BPM, 4 beats = 2 seconds
- At 60 BPM, 4 beats = 4 seconds

---

## 🎵 Volume Too Quiet?

### **Option 1: Increase in code**
Edit `frontend/audio-synth.js`:

**Line 22** (master volume):
```javascript
this.masterGain.gain.value = 0.7; // 70% volume
```

**Line 48** (note volume):
```javascript
const volume = (velocity / 127) * 0.8; // 80% volume
```

### **Option 2: System volume**
- Increase Windows volume
- Increase browser volume (right-click speaker icon)

---

## 🛠️ Advanced Debugging:

### **Check AudioContext State**
Open console and type:
```javascript
audioSynth.audioContext.state
```

Should show: `"running"`

If shows `"suspended"`:
```javascript
audioSynth.audioContext.resume()
```

### **Manual Test in Console**
```javascript
// Test if synth exists
audioSynth

// Initialize manually
await audioSynth.initialize()

// Play single note
audioSynth.playNote(60, 127, 1.0)  // C4 for 1 second

// Play chord
audioSynth.playChord([60, 64, 67], 2.0)  // C Major for 2 seconds
```

---

## 📊 Expected Console Output:

### **On First Play Click:**
```
[App] Checking audio initialization...
[App] Initializing audio for first time...
[Audio] ✅ Web Audio synthesizer initialized successfully
[Audio] Sample rate: 48000
[Audio] State: running
[App] ✅ Audio initialized
```

### **For Each Chord:**
```
[App] Playing CMajor: notes [60,64,67], duration 2s
[Audio] 🎵 Playing chord: 60,64,67 for 2s at volume 0.5
```

---

## ✅ What's Working:

- ✅ Web Audio API integration
- ✅ Piano-like synthesis with 3 oscillators
- ✅ ADSR envelope for natural sound
- ✅ Increased volume (50% master, 60% per-note)
- ✅ Full velocity (127) for chords
- ✅ Detailed console logging
- ✅ Audio test page for isolated testing

---

## 🔧 Quick Fixes Summary:

| Problem | Quick Fix |
|---------|-----------|
| No sound at all | Test `audio-test.html` first |
| Browser blocked | Already fixed (user click required) |
| Too quiet | Increase volumes in `audio-synth.js` |
| Can't hear in Docker | Using browser audio (fixed!) |
| Console errors | Check F12 console for details |

---

## 📝 Test Checklist:

- [ ] Test `audio-test.html` - all 4 buttons work
- [ ] Main app console shows audio init messages
- [ ] Console shows "Playing chord" for each chord
- [ ] System volume is up
- [ ] Browser tab isn't muted
- [ ] Using headphones/speakers (not muted monitor)

---

## 🎯 If Still No Sound:

1. **Try different browser**: Chrome > Firefox > Edge
2. **Check system audio**: Play YouTube video to verify
3. **Restart browser**: Close all tabs, reopen
4. **Check console**: Share console errors for debugging
5. **Test on different device**: Try phone browser

---

**Current Audio Settings:**
- Master Volume: 50% (0.5)
- Note Volume: 60% (0.6 max)
- Velocity: 127 (maximum)
- Sample Rate: 48000 Hz (typical)
- Oscillators: 3 per note (rich sound)

Your audio should work! Check console logs to see what's happening.
