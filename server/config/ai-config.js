import { GoogleGenAI } from '@google/genai';
import env from './environment.js';

// Configuración para la API de Gemini
const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });

// Fix: Remove extra quote from model name
export const DEFAULT_MODEL = 'gemini-2.5-flash-preview-04-17'; // Keep working model as default

// Available models with compatibility info
export const AVAILABLE_MODELS = {
  'gemini-2.0-flash': {
    name: 'gemini-2.0-flash',
    isStable: true,
    supportsStreaming: true,
    maxTokens: 8192
  },
  'gemini-1.5-pro': {
    name: 'gemini-1.5-pro', 
    isStable: true,
    supportsStreaming: true,
    maxTokens: 2048000
  },
  'gemini-1.5-flash': {
    name: 'gemini-1.5-flash',
    isStable: true,
    supportsStreaming: true,
    maxTokens: 1048576
  },
  'gemini-2.5-flash-preview-04-17': {
    name: 'gemini-2.5-flash-preview-04-17',
    isStable: false,
    supportsStreaming: true,
    maxTokens: 8192,
    isPreview: true
  },

  'gemma-3n-e4b-it': {
    name: 'gemma-3n-e4b-it',
    isStable: true,
    supportsStreaming: true,
    maxTokens: 8192
  },
  'gemma-3n-e4b-it': {
    name: 'gemma-3n-e2b-it',
    isStable: true,
    supportsStreaming: true,
    maxTokens: 8192
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
