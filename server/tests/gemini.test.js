import { describe, test, expect } from 'vitest';
import { processGeminiRequest, clearCache, getManagedResponseCache } from '../services/gemini-service.js';
import env from '../config/environment.js';

describe('Gemini Service', () => {
  test.concurrent('should process simple request and return valid response', async () => {
    const response = await processGeminiRequest('Hello Gemini');
    expect(response).toBeDefined();
    expect(typeof response.text).toBe('string');
    expect(response.text.length).toBeGreaterThan(0);
    expect(response.text.toLowerCase()).toContain('gemini');
  }, 15000);

  test('should handle missing API key gracefully', async () => {
    // Simula la ausencia de la API key
    const originalEnv = env.geminiApiKey;
    env.geminiApiKey = '';
    let errorCaught = false;
    try {
      await processGeminiRequest('Test without API key');
    } catch (error) {
      errorCaught = true;
      expect(error.message).toMatch(/API key/i);
    }
    env.geminiApiKey = originalEnv;
    expect(errorCaught).toBe(true);
  }, 3000);

  test.concurrent('should fallback to default model if model is invalid', async () => {
    const response = await processGeminiRequest('Test fallback model', 'invalid-model');
    expect(response).toBeDefined();
    expect(typeof response.text).toBe('string');
    expect(response.text.length).toBeGreaterThan(0);
  }, 15000);

  test.concurrent(
    'should handle cache correctly',
    async () => {
      clearCache();
      const cache = getManagedResponseCache();
      const key = cache.size();
      expect(key).toBe(0);

      const prompt = 'Cache test prompt';
      const response1 = await processGeminiRequest(prompt);
      expect(response1).toBeDefined();
      expect(typeof response1.text).toBe('string');

      // Debe estar en caché ahora
      const response2 = await processGeminiRequest(prompt);
      expect(response2).toBeDefined();
      expect(response2.text).toBe(response1.text);

      // Limpia caché y verifica
      clearCache();
      expect(cache.size()).toBe(0);
    },
    40000
  );

  test.concurrent('should analyze text and return structured analysis', async () => {
    const prompt = 'El clima hoy es excelente y estoy muy feliz.';
    const response = await processGeminiRequest(
      `Analiza exhaustivamente el sentimiento del siguiente texto: "${prompt}"`
    );
    expect(response).toBeDefined();
    expect(typeof response.text).toBe('string');
    expect(response.text).toMatch(/sentimiento|puntaje|emociones/i);
  }, 15000);

  test.concurrent('should compare two texts and return comparison', async () => {
    const text1 = 'Hoy es un gran día para aprender.';
    const text2 = 'El aprendizaje puede ser desafiante pero gratificante.';
    const response = await processGeminiRequest(
      `Compara estos dos textos y analiza:\nTexto 1: "${text1}"\nTexto 2: "${text2}"`
    );
    expect(response).toBeDefined();
    expect(typeof response.text).toBe('string');
    expect(response.text).toMatch(/similitud|diferencias|temas/i);
  }, 15000);

  test.concurrent('should get available models', async () => {
    // Simula la obtención de modelos (mock o llamada directa si tienes endpoint)
    // Aquí solo verifica la función de config
    const { getModelInfo } = await import('../config/ai-config.js');
    const model = getModelInfo('gemini-2.5-flash-lite');
    expect(model).toBeDefined();
    expect(model.name).toBe('gemini-2.5-flash-lite');
    expect(model.isPreview).toBe(false);
    expect(model.isStable).toBe(true);
  });

  // Opcional: test de streaming (mock/fake, solo si tienes función de stream)
  // test.concurrent('should stream response', async () => {
  //   // Implementa si tienes función de streaming en tests
  // }, 20000);
});
