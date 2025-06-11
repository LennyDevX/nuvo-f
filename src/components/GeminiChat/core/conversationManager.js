import { debounce } from '../../../utils/debounce';

const STORAGE_KEY = 'nuvos_chat_conversations';
const MAX_STORED_CONVERSATIONS = 10;

export class ConversationManager {
  constructor() {
    this.saveConversationToStorage = debounce(this._saveConversation.bind(this), 2000);
  }

  _saveConversation(messages) {
    if (messages.length === 0) return;
    
    const saveOperation = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const newConversation = {
          id: Date.now(),
          timestamp: Date.now(),
          messages: messages.slice(),
          preview: messages[0]?.text?.substring(0, 100) || 'New conversation'
        };
        
        const updated = [newConversation, ...stored.slice(0, MAX_STORED_CONVERSATIONS - 1)];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to save conversation:', error);
        this._saveFallback(messages);
      }
    };

    if (window.requestIdleCallback) {
      window.requestIdleCallback(saveOperation, { timeout: 2000 });
    } else {
      setTimeout(saveOperation, 100);
    }
  }

  _saveFallback(messages) {
    try {
      const minimalData = {
        id: Date.now(),
        timestamp: Date.now(),
        messageCount: messages.length,
        preview: messages[0]?.text?.substring(0, 50) || 'Conversation'
      };
      localStorage.setItem(`${STORAGE_KEY}_minimal`, JSON.stringify(minimalData));
    } catch (fallbackError) {
      console.error('Critical storage error:', fallbackError);
    }
  }

  loadConversationsFromStorage() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (error) {
      console.warn('Failed to load conversations:', error);
      return [];
    }
  }

  deleteConversation(conversationId) {
    try {
      const stored = this.loadConversationsFromStorage();
      const filtered = stored.filter(conv => conv.id !== conversationId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      return false;
    }
  }

  clearAllConversations() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(`${STORAGE_KEY}_minimal`);
      return true;
    } catch (error) {
      console.error('Failed to clear conversations:', error);
      return false;
    }
  }

  getConversationStats() {
    const conversations = this.loadConversationsFromStorage();
    return {
      total: conversations.length,
      totalMessages: conversations.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0),
      oldestTimestamp: conversations.length > 0 ? Math.min(...conversations.map(c => c.timestamp)) : null,
      newestTimestamp: conversations.length > 0 ? Math.max(...conversations.map(c => c.timestamp)) : null
    };
  }
}

// Singleton instance
export const conversationManager = new ConversationManager();
