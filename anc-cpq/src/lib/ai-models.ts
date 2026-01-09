export interface AIModel {
    id: string;
    name: string;
    provider: 'zhipu' | 'mimo' | 'nvidia';
    endpoint: string;
    apiKey: string;
    supportsThinking?: boolean;
}

export const AI_MODELS: Record<string, AIModel> = {
    'glm-4.7': {
        id: 'glm-4.7',
        name: 'GLM-4.7 (ZhipuAI)',
        provider: 'zhipu',
        endpoint: 'https://api.z.ai/api/coding/paas/v4/chat/completions',
        apiKey: '8c313c111b47423aa91781479cf0af6e.LfWV1laJpyWEHH1z',
        supportsThinking: true
    },
    'mimo-v2-flash': {
        id: 'mimo-v2-flash',
        name: 'MIMO-v2-Flash',
        provider: 'mimo',
        endpoint: 'https://api.xiaomimimo.com/v1/chat/completions',
        apiKey: 'sk-sihvfmjhi5z3m72rh8qiw1niudfbrr6h1qto46su9sad5jto',
        supportsThinking: false
    }
};

export const NVIDIA_CONFIG = {
    endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
    apiKey: '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',
    modelsEndpoint: 'https://integrate.api.nvidia.com/v1/models'
};

export const DEFAULT_MODEL = 'glm-4.7';
