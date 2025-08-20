export const initialChatState = {
  messages: [],
  status: 'idle', // idle, loading_history, waiting_for_response, streaming, error
  error: null,
  conversationId: null,
  isOnline: true,
  urlProcessing: {
    urls: [],
    status: 'idle', // idle, processing, completed, failed
    content: [],
    error: null
  },
};

export const chatReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      // Detectar si el mensaje contiene URLs
      const messageText = action.payload.text || '';
      const urlRegex = /https?:\/\/[^\s<>"'`\)\]\}]+/gi;
      const hasUrls = urlRegex.test(messageText);
      
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            ...action.payload,
            timestamp: new Date().toISOString(),
            id: `msg_${Date.now()}`,
          },
        ],
        status: 'waiting_for_response',
        error: null,
        // Resetear urlProcessing si el nuevo mensaje no contiene URLs
        urlProcessing: hasUrls ? state.urlProcessing : {
          urls: [],
          status: 'idle',
          content: [],
          error: null
        }
      };

    case 'START_STREAMING':
      return {
        ...state,
        status: 'streaming',
        messages: [...state.messages, { text: '', sender: 'bot', isStreaming: true, timestamp: new Date().toISOString(), id: `msg_${Date.now()}` }],
      };

    case 'UPDATE_STREAM':
      const updatedMessages = [...state.messages];
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      if (lastMessage?.isStreaming) {
        lastMessage.text = action.payload;
      }
      return { ...state, messages: updatedMessages };

    case 'FINISH_STREAM':
        return {
            ...state,
            status: 'idle',
            messages: state.messages.map((msg) => 
                msg.isStreaming ? { ...msg, isStreaming: false } : msg
            ),
        };


    case 'SET_ERROR':
        const { error, messageId } = action.payload;
        const messagesWithError = state.messages.map(msg => 
            msg.id === messageId ? { ...msg, error: error } : msg
        );
        // Si el último mensaje es el de streaming, lo eliminamos
        const lastMsg = messagesWithError[messagesWithError.length - 1];
        const finalMessages = (lastMsg?.isStreaming) 
            ? messagesWithError.slice(0, -1) 
            : messagesWithError;

        return {
            ...state,
            error: error,
            status: 'error',
            messages: finalMessages,
        };

    case 'RESET_CONVERSATION':
      return {
        ...initialChatState,
        isOnline: state.isOnline,
        urlProcessing: {
          urls: [],
          status: 'idle',
          content: [],
          error: null
        }
       };

    case 'LOAD_CONVERSATION':
      if (!action.payload || !action.payload.messages) return state;
      return {
        ...state,
        messages: action.payload.messages,
        conversationId: action.payload.id,
        status: 'idle',
        error: null,
      };

    case 'SET_STATUS':
      return { ...state, status: action.payload };

    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };

    case 'REMOVE_LAST_MESSAGE': // Para el reintento
      return {
        ...state,
        messages: state.messages.slice(0, -1),
        status: 'waiting_for_response',
      };

    case 'SET_URL_PROCESSING':
      return {
        ...state,
        urlProcessing: {
          urls: action.payload.urls || [],
          status: action.payload.status || 'idle',
          content: action.payload.content || [],
          error: action.payload.error || null
        }
      };
      
    default:
      return state;
  }
};
