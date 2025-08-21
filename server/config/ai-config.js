import { GoogleGenAI } from '@google/genai';
import env from './environment.js';

// Configuración para la API de Gemini
const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });

// Fix: Remove extra quote from model name
export const DEFAULT_MODEL = 'gemini-2.5-flash-lite'; // Keep working model as default

// Available models with compatibility info - Only Gemini 2.5+ models
export const AVAILABLE_MODELS = {
  'gemini-2.5-flash-lite': {
    name: 'gemini-2.5-flash-lite',
    isStable: true,
    supportsStreaming: true,
    maxTokens: 8192,
    isPreview: false,
    isDefault: true
  }
};

// Function to validate and get model info
export function getModelInfo(modelName) {
  return AVAILABLE_MODELS[modelName] || null;
}

// Function to get safe model (fallback to working model)
export function getSafeModel(requestedModel) {
  const modelInfo = getModelInfo(requestedModel);
  
  // If model exists and is stable, use it
  if (modelInfo && modelInfo.isStable) {
    return requestedModel;
  }
  
  // If it's a preview model, warn but allow
  if (modelInfo && modelInfo.isPreview) {
    console.warn(`Using preview model: ${requestedModel}. This may be unstable.`);
    return requestedModel;
  }
  
  // Fallback to default working model
  console.warn(`Model ${requestedModel} not found or unstable. Falling back to ${DEFAULT_MODEL}`);
  return DEFAULT_MODEL;
}

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
