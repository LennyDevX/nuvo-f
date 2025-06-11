import { describe, test, expect } from 'vitest';
import { processGeminiRequest } from '../services/gemini-service.js';

describe('Gemini Service', () => {
  test('should process simple request', async () => {
    const response = await processGeminiRequest('Hello');
    expect(response.text).toBeDefined();
  });
  
  test('should handle cache correctly', async () => {
    // Test cache functionality
  });
});
