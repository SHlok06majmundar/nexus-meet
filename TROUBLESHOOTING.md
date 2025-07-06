# 🔧 Nexus Meet - Production Troubleshooting Guide

## 🌐 Socket.IO Connection Issues

### Problem: "websocket error" in production
**Solution:**
1. Vercel doesn't support persistent WebSocket connections
2. The app now forces polling transport for production
3. Update your environment variables:

```bash
# In Vercel dashboard, set these environment variables:
NEXT_PUBLIC_SOCKET_URL=https://your-app-name.vercel.app
SOCKET_IO_CORS_ORIGIN=https://your-app-name.vercel.app
NODE_ENV=production
```

### Vercel Deployment Steps:
1. Go to Vercel dashboard
2. Import your GitHub repository
3. Set environment variables from `.env.production` file
4. Deploy

### Alternative: Use a Socket.IO hosting service
For better real-time performance, consider:
- Railway.app
- Render.com
- Heroku (with WebSocket support)

## 🎤 AI Transcription Issues

### Problem: Transcription not starting/refreshing
**Solutions:**

1. **Browser Compatibility:**
   - Use Chrome, Edge, or Safari
   - Firefox doesn't support Web Speech API well

2. **HTTPS Required:**
   - Speech recognition only works on HTTPS or localhost
   - Ensure your production site uses HTTPS

3. **Microphone Permissions:**
   - Click the microphone icon in browser address bar
   - Allow microphone access
   - Refresh the page if needed

4. **Clear Browser Data:**
   ```
   - Clear cache and cookies
   - Disable browser extensions
   - Try incognito/private mode
   ```

### Testing Checklist:
- [ ] Using Chrome/Edge/Safari
- [ ] Site is HTTPS
- [ ] Microphone permission granted
- [ ] No ad blockers interfering
- [ ] Network connection stable

## 🚀 Production Deployment Checklist

### 1. Environment Variables (Vercel)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_STREAM_API_KEY=your_stream_key
STREAM_SECRET_KEY=your_stream_secret
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
NEXT_PUBLIC_SOCKET_URL=https://your-app.vercel.app
SOCKET_IO_CORS_ORIGIN=https://your-app.vercel.app
NODE_ENV=production
```

### 2. Real-time Features Testing
1. Open 2+ browser tabs with same meeting
2. Send chat messages - should appear instantly
3. Test typing indicators
4. Try transcription with microphone

### 3. Debug Console Errors
Check browser console for:
- Socket.IO connection status
- Speech recognition errors
- Permission issues

## 🔍 Common Error Messages & Fixes

### "Speech Recognition Not Supported"
- **Fix:** Use Chrome, Edge, or Safari
- **Alternative:** Use a supported browser

### "Microphone Permission Required"
- **Fix:** Click microphone icon in address bar → Allow
- **Alternative:** Go to browser settings → Privacy → Microphone

### "Secure Connection Required"
- **Fix:** Ensure site uses HTTPS
- **Alternative:** Deploy to Vercel/Netlify (auto-HTTPS)

### "Socket.IO connection error"
- **Fix:** Environment variables set correctly
- **Check:** CORS origins match your domain
- **Fallback:** Polling transport enabled for Vercel

## 📱 Mobile Testing
- Test on iOS Safari and Android Chrome
- Check microphone permissions on mobile
- Verify chat works on touch devices

## 🛠️ Alternative Deployment Options

### For Better Real-time Performance:
1. **Railway.app** - Full WebSocket support
2. **Render.com** - Persistent connections
3. **DigitalOcean App Platform** - WebSocket support

### Quick Deploy Commands:
```bash
# Build and test locally first
npm run build
npm start

# Then deploy to your chosen platform
vercel --prod
# or
railway up
# or
render deploy
```

## 🎯 Success Indicators
- ✅ Socket.IO connects without errors
- ✅ Chat messages appear instantly across tabs
- ✅ AI transcription starts without browser refresh
- ✅ Microphone permission granted
- ✅ No console errors
- ✅ Works on mobile devices

Need help? Check the browser console and compare with these solutions!
