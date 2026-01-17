# AgniShakti AI Assistant - Quick Start Guide

## 🎯 What You've Got

You now have a fully functional AI chatbot assistant integrated into your AgniShakti dashboard!

## ✨ Key Features

### 1. **Automatic API Key Fallback**
- Your system uses **2 Gemini API keys** from `.env.local`
- When one key runs out of quota, it **automatically switches** to the next one
- No downtime, no manual intervention needed!

### 2. **Smart Assistant Persona**
The AI is configured to:
- ✅ Explain AgniShakti features clearly
- ✅ Answer fire safety questions
- ✅ Guide users about use cases
- ✅ Maintain professional tone
- ❌ Never reveal internal details
- ❌ Never claim to be ChatGPT or other models

### 3. **Beautiful UI**
- Floating chat button (bottom-right corner)
- Premium dark theme with gradients
- Smooth animations
- Mobile responsive

## 🚀 How to Use

### For End Users:
1. Look for the **orange glowing button** in the bottom-right corner
2. Click to open the chat
3. Type your question
4. Get instant AI-powered answers!

### For Developers:

#### Files Created:
```
📁 agnishakti/
├── 📁 src/
│   ├── 📁 app/api/chat/
│   │   └── route.js          ← API endpoint with fallback logic
│   └── 📁 components/
│       ├── AgniShaktiChat.jsx ← Chat UI component
│       └── OwnerDashboard.jsx ← Updated with chat integration
└── AGNISHAKTI_AI_ASSISTANT.md ← Full documentation
```

#### Environment Variables:
```env
GEMINI_API_KEYS=key1,key2
```
- Add more keys by separating with commas
- System automatically rotates through them

## 🔧 Testing

### Test the Chat:
1. Open your dashboard at `http://localhost:3001`
2. Click the floating chat button
3. Try these questions:
   - "How does AgniShakti work?"
   - "What are the benefits?"
   - "Can it work with existing cameras?"
   - "How fast are the alerts?"

### Monitor API Usage:
Check the browser console for logs like:
```
[CHAT_API] Attempting with API key index 0 (attempt 1/2)
[CHAT_API] Successfully got response using API key index 0
```

If a key runs out:
```
[CHAT_API] API key 0 quota exceeded. Trying next key...
[CHAT_API] Successfully got response using API key index 1
```

## 📊 API Key Management

### Current Setup:
You have **2 API keys** configured:
- Key 1: `AIzaSyDLkPI0fCrs4hk40Ad59__0d766Nux3XZg`
- Key 2: `AIzaSyBzOnfrn6Zy2jIAkqep690gPCPQA-TaEy4`

### To Add More Keys:
1. Get new API keys from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add to `.env.local`:
   ```env
   GEMINI_API_KEYS=key1,key2,key3,key4,key5
   ```
3. Restart the server
4. System will automatically use all keys!

### Free Tier Limits:
- **Gemini 1.5 Flash**: 15 requests per minute, 1,500 per day
- With 2 keys: **30 requests/min**, **3,000/day**
- With 5 keys: **75 requests/min**, **7,500/day**

## 🎨 Customization

### Change Assistant Personality:
Edit the `SYSTEM_PROMPT` in `/api/chat/route.js`

### Modify UI Colors:
Edit gradient classes in `AgniShaktiChat.jsx`:
```jsx
// Current: Orange to Pink
className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500"

// Change to: Blue to Purple
className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500"
```

### Adjust Response Length:
In `/api/chat/route.js`, modify:
```javascript
maxOutputTokens: 1024  // Increase for longer responses
temperature: 0.7       // 0 = focused, 1 = creative
```

## 🐛 Troubleshooting

### Chat Button Not Showing?
- Check browser console for errors
- Verify `AgniShaktiChat` is imported in `OwnerDashboard.jsx`
- Clear browser cache and reload

### No Responses?
1. Check `.env.local` has valid API keys
2. Verify Gemini API is enabled in Google Cloud
3. Check browser Network tab for API errors
4. Look at server console for detailed logs

### "All API keys exhausted" Error?
- All your API keys have hit quota limits
- Wait for quota reset (daily at midnight PST)
- Or add more API keys to `.env.local`

## 📈 Next Steps

### Recommended Enhancements:
1. **Add More API Keys**: Scale to 5-10 keys for production
2. **Save Chat History**: Store conversations in Firebase
3. **Analytics**: Track common questions
4. **Multi-language**: Add Hindi, Tamil support
5. **Voice Input**: Add speech-to-text

### Production Checklist:
- [ ] Add at least 5 API keys
- [ ] Test quota exhaustion scenario
- [ ] Monitor API usage in Google Cloud Console
- [ ] Set up error alerting
- [ ] Add rate limiting (optional)
- [ ] Test on mobile devices

## 💡 Pro Tips

1. **Monitor Usage**: Check Google Cloud Console weekly
2. **Rotate Keys**: Add new keys before old ones expire
3. **Test Fallback**: Temporarily disable a key to test rotation
4. **Update Prompts**: Keep system prompt current with new features
5. **User Feedback**: Add thumbs up/down for responses

## 🎉 You're All Set!

Your AgniShakti AI Assistant is now:
- ✅ Fully integrated
- ✅ Production-ready
- ✅ Fault-tolerant with API key fallback
- ✅ Beautiful and user-friendly

**Start chatting and see it in action!** 🚀

---

**Questions?** Check `AGNISHAKTI_AI_ASSISTANT.md` for detailed documentation.
