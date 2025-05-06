import { GoogleGenAI } from '@google/genai';
import env from './environment.js';

// Configuración para la API de Gemini
const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });

export const DEFAULT_MODEL = 'gemini-2.0-flash';

export const defaultFunctionDeclaration = {
  name: 'controlLight',
  parameters: {
    type: 'object',
    description: 'Set the brightness and color temperature of a room light.',
    properties: {
      brightness: {
        type: 'number',
        description: 'Light level from 0 to 100. Zero is off and 100 is full brightness.'
      },
      colorTemperature: {
        type: 'string',
        description: 'Color temperature: daylight, cool, or warm.'
      }
    },
    required: ['brightness', 'colorTemperature']
  }
};

export default ai;
