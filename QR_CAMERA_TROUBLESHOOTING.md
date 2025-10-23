# QR Scanner Camera Detection Troubleshooting

## Problem
QR Scanner shows "Scans: 0" - camera tidak mendeteksi QR code meskipun Quick Test berjalan.

## Debugging Steps

### 1. Check Camera Permissions
```javascript
// Di Console browser (F12):
navigator.permissions.query({name: 'camera'}).then(result => {
  console.log('Camera permission:', result.state);
});
```

### 2. Check Video Element Status
```javascript
// Di Console saat scanner aktif:
const video = document.querySelector('video');
console.log('Video ready state:', video.readyState);
console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
console.log('Video playing:', !video.paused);
```

### 3. Manual QR Detection Test
```javascript
// Test jsQR langsung di browser:
import jsQR from 'jsqr';
const video = document.querySelector('video');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
ctx.drawImage(video, 0, 0);
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const result = jsQR(imageData.data, imageData.width, imageData.height);
console.log('Manual QR test result:', result);
```

## Common Issues & Solutions

### Issue 1: Video Not Ready
**Symptoms**: Scans: 0, video shows but no detection
**Solution**: Video readyState < 2
```javascript
// Fixed with video.onloadedmetadata callback
video.onloadedmetadata = () => {
  setTimeout(startScanning, 1000); // Wait 1s after metadata loaded
};
```

### Issue 2: Canvas Drawing Failed
**Symptoms**: Error in console during drawImage
**Solution**: Check video dimensions and canvas setup
```javascript
if (video.videoWidth === 0 || video.videoHeight === 0) {
  console.log('Video dimensions not ready');
  return;
}
```

### Issue 3: jsQR Configuration
**Symptoms**: Real QR not detected but should be visible
**Solution**: Try different inversion attempts
```javascript
// Try multiple detection settings
const settings = [
  { inversionAttempts: "attemptBoth" },
  { inversionAttempts: "dontInvert" },
  { inversionAttempts: "invertFirst" }
];
```

### Issue 4: QR Code Quality
**Symptoms**: QR visible to eye but not detected
**Solutions**:
- Improve lighting
- Move QR closer to camera
- Ensure QR code contrast is good
- Try different angles
- Clean camera lens

## Enhanced Debugging Features

### 1. Debug Button
Click "Debug" button untuk info lengkap:
- Video element status
- Stream status
- Scanning status
- Video dimensions

### 2. Console Logs
Scanner menampilkan log dengan emoji:
- 📹 Camera access
- 🎬 Scanning start
- 🔍 Detection attempts
- 📱 QR detected
- ❌ Errors

### 3. Auto-Simulation Fallback
Setelah 50+ scan attempts gagal, akan auto-trigger simulasi setiap 100 attempts.

## Testing Methods

### Method 1: Use Debug Tools
1. Buka Admin → Scan QR Code
2. Klik "Mulai Scan"
3. Klik "Debug" untuk info status
4. Check console logs
5. Coba "Quick Test" sebagai pembanding

### Method 2: Manual Browser Test
1. F12 → Console
2. Jalankan manual detection code di atas
3. Lihat hasil jsQR langsung

### Method 3: QR Code Testing
1. Test dengan QR code buatan online (qr-code-generator.com)
2. Test dengan QR dari payment success page
3. Coba berbagai ukuran dan jarak

## Expected Behavior

### Normal Flow:
1. Klik "Mulai Scan" → Camera permission
2. Video starts → "Video metadata loaded"
3. Scanning starts → "Starting QR scanning loop"
4. Scan counter increases → "Scans: 1, 2, 3..."
5. QR detected → "Real QR Code detected!"
6. Scanner stops → Show order details

### If Still Not Working:
1. Use Quick Test untuk verifikasi parsing logic ✅
2. Use manual jsQR test untuk isolasi masalah
3. Check camera hardware di aplikasi lain
4. Try different browser (Chrome recommended)
5. Check HTTPS requirement untuk camera access

## Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+  
- ✅ Safari 14+
- ❌ Internet Explorer (not supported)

Camera access requires HTTPS in production!