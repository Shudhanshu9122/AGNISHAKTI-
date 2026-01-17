# AgniShakti AI Assistant - Implementation Guide

## Overview
The AgniShakti AI Assistant is an intelligent chatbot that helps users understand the AgniShakti fire safety system. It uses Google's Gemini AI with automatic API key fallback to ensure continuous availability.

## Features

### 1. **Intelligent Responses**
- Explains AgniShakti features in simple language
- Answers fire safety questions
- Guides users about use cases (societies, offices, industries, public places)
- Professional and helpful tone

### 2. **Automatic API Key Fallback**
- Uses multiple Gemini API keys from environment variables
- Automatically switches to the next key when quota is exceeded
- Ensures 24/7 availability even with free-tier API limits

### 3. **Premium UI/UX**
- Beautiful gradient design with smooth animations
- Floating chat button with online indicator
- Real-time message updates
- Mobile-responsive design
- Dark theme optimized for the AgniShakti dashboard

## Architecture

### Components

#### 1. **API Route** (`/api/chat/route.js`)
- Handles chat requests from the frontend
- Manages Gemini API calls with fallback logic
- Implements system prompt for AgniShakti Assistant persona
- Returns formatted responses or fallback messages on error

#### 2. **Chat Component** (`AgniShaktiChat.jsx`)
- Floating chat button in bottom-right corner
- Expandable chat window with message history
- Real-time typing indicators
- Auto-scroll to latest messages
- Keyboard shortcuts (Enter to send)

#### 3. **Integration** (`OwnerDashboard.jsx`)
- Chat component integrated into the main dashboard
- Available on all dashboard pages
- Non-intrusive floating design

## API Key Configuration

### Environment Variables
The system uses the `GEMINI_API_KEYS` environment variable from `.env.local`:

```env
GEMINI_API_KEYS=AIzaSyDLkPI0fCrs4hk40Ad59__0d766Nux3XZg,AIzaSyBzOnfrn6Zy2jIAkqep690gPCPQA-TaEy4
```

### How Fallback Works

1. **Initial Request**: Uses the first API key
2. **Quota Exceeded**: Automatically switches to the next key
3. **Rotation**: Cycles through all available keys
4. **Error Handling**: Shows fallback message if all keys fail

### Adding More API Keys

To add more API keys, simply append them to the `GEMINI_API_KEYS` variable:

```env
GEMINI_API_KEYS=key1,key2,key3,key4,key5
```

The system will automatically detect and use all available keys.

## System Prompt

The assistant is configured with a detailed system prompt that defines:

- **Identity**: "AgniShakti Assistant" - official virtual support assistant
- **Knowledge**: Information about AgniShakti's features and capabilities
- **Behavior**: Professional, helpful, concise responses
- **Limitations**: Redirects out-of-scope questions to the AgniShakti team
- **Security**: Never reveals internal details, API keys, or model names

## Usage

### For Users

1. **Open Chat**: Click the floating orange chat button in the bottom-right corner
2. **Ask Questions**: Type your question about fire safety or AgniShakti
3. **Get Instant Answers**: Receive AI-powered responses in seconds
4. **Continue Conversation**: Chat maintains context throughout the session

### Example Questions

- "How does AgniShakti work?"
- "What are the benefits of using AgniShakti?"
- "Can AgniShakti work with existing CCTV cameras?"
- "What industries can use AgniShakti?"
- "How fast are the fire alerts?"
- "Does AgniShakti require additional hardware?"

## Technical Details

### API Endpoint
**POST** `/api/chat`

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "How does AgniShakti work?",
      "timestamp": "2026-01-17T21:00:00Z"
    }
  ]
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "AgniShakti uses AI to analyze your existing CCTV camera feeds...",
  "timestamp": "2026-01-17T21:00:01Z"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message",
  "fallbackMessage": "I apologize, but I am experiencing technical difficulties..."
}
```

### Gemini API Configuration

- **Model**: `gemini-1.5-flash` (fast, cost-effective)
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 1024 (concise responses)
- **Safety Settings**: Medium and above blocking for all categories

## Monitoring & Debugging

### Console Logs

The system logs important events:

```
[CHAT_API] Attempting with API key index 0 (attempt 1/2)
[CHAT_API] Successfully got response using API key index 0
[CHAT_API] API key 0 quota exceeded. Trying next key...
```

### Error Handling

- **Network Errors**: Shows fallback message to user
- **API Quota Exceeded**: Automatically switches to next key
- **Invalid Responses**: Gracefully handles and shows error message
- **All Keys Exhausted**: Shows professional fallback message

## Best Practices

### For Administrators

1. **Monitor API Usage**: Check Google Cloud Console for quota usage
2. **Rotate Keys**: Use multiple API keys to distribute load
3. **Update Prompts**: Modify system prompt as AgniShakti features evolve
4. **Test Regularly**: Ensure all API keys are valid and working

### For Developers

1. **Keep System Prompt Updated**: Reflect latest AgniShakti features
2. **Add More Keys**: Scale by adding more API keys as needed
3. **Monitor Logs**: Watch for quota exhaustion patterns
4. **Optimize Responses**: Adjust temperature and max tokens as needed

## Future Enhancements

Potential improvements:

- **Conversation History**: Save chat history to database
- **Analytics**: Track common questions and user satisfaction
- **Multi-language Support**: Support Hindi, Tamil, and other languages
- **Voice Input**: Add speech-to-text for voice queries
- **Rich Media**: Send images, videos, or documents in chat
- **Proactive Suggestions**: Suggest common questions
- **Integration**: Link to specific dashboard features from chat

## Troubleshooting

### Chat Not Opening
- Check browser console for errors
- Ensure component is imported correctly
- Verify no CSS conflicts with z-index

### No Responses
- Check API keys in `.env.local`
- Verify Gemini API is enabled in Google Cloud
- Check network tab for API errors
- Review server logs for detailed error messages

### Slow Responses
- Check internet connection
- Verify Gemini API status
- Consider using faster model (already using flash)

### Quota Exceeded
- Add more API keys to `.env.local`
- Upgrade to paid Gemini API tier
- Implement rate limiting on frontend

## Security Considerations

1. **API Keys**: Never expose in client-side code (kept in server-side route)
2. **Input Validation**: Sanitize user inputs before sending to API
3. **Rate Limiting**: Consider implementing to prevent abuse
4. **Content Filtering**: Gemini safety settings prevent harmful content
5. **Data Privacy**: Chat messages not stored (can be added if needed)

## Support

For issues or questions about the AI Assistant:
- Contact: AgniShakti Development Team
- Email: frostyanand@gmail.com
- Documentation: This file

---

**Last Updated**: January 17, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
