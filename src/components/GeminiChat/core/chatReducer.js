export const initialChatState = {
  messages: [],
  isLoading: false,
  error: null,
  conversationId: null
};

export const chatReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            ...action.payload,
            // Si el mensaje tiene imagen, se incluye
            image: action.payload.image || undefined
          }
        ],
        isLoading: true,
        error: null
      };
      
    case 'START_STREAMING':
      return {
        ...state,
        messages: [...state.messages, { text: '', sender: 'bot', isStreaming: true }]
      };
      
    case 'UPDATE_STREAM':
      const updatedMessages = [...state.messages];
      const lastIndex = updatedMessages.length - 1;
      if (updatedMessages[lastIndex]?.isStreaming) {
        updatedMessages[lastIndex] = {
          ...updatedMessages[lastIndex],
          text: action.payload
        };
      }
      return { ...state, messages: updatedMessages };
      
    case 'FINISH_STREAM':
      return {
        ...state,
        isLoading: false,
        messages: state.messages.map((msg, idx) => 
          idx === state.messages.length - 1 
            ? { ...msg, isStreaming: false }
            : msg
        )
      };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
      
    case 'RESET_CONVERSATION':
      return { ...state, messages: [], error: null, isLoading: false, conversationId: null };
      
    case 'LOAD_CONVERSATION':
      return { 
        ...state, 
        messages: action.payload.messages, 
        conversationId: action.payload.id, 
        error: null 
      };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'REMOVE_FAILED_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter((_, index) => index !== action.payload),
        isLoading: false
      };
      
    default:
      return state;
  }
};
