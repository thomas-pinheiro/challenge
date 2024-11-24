import { HttpError } from "./error.js";  // Importe a classe HttpError

export const validateQueryParams = (params) => {
    const paramConfigs = [
        { name: 'user', type: 'string', required: true },
        { name: 'language', type: 'string', required: false },
        { name: 'per_page', type: 'integer', required: false, maxValue: 10 },
        { name: 'page', type: 'integer', required: false },
        { name: 'archived', type: 'boolean', required: false },
    ];

    paramConfigs.forEach(paramConfig => {
        const param = params[paramConfig.name];
        if (paramConfig.required && !param) {
            throw new HttpError(`${paramConfig.name} is required.`, 400);
        }

        if (param) {
            if (paramConfig.type === 'string' && typeof param !== 'string') {
                throw new HttpError(`${paramConfig.name} must be a string.`, 400);
            }
            if (paramConfig.type === 'integer') {
                const integerValue = Number(param);
                if (!Number.isInteger(integerValue) || integerValue <= 0) {
                    throw new HttpError(`${paramConfig.name} must be a positive integer.`, 400);
                }
                params[paramConfig.name] = integerValue;
                if (paramConfig.maxValue && integerValue > paramConfig.maxValue) {
                    throw new HttpError(`${paramConfig.name} cannot exceed ${paramConfig.maxValue}.`, 400);
                }
            }
            if (paramConfig.type === 'boolean') {
                if (param !== 'true' && param !== 'false') {
                    throw new HttpError(`${paramConfig.name} must be 'true' or 'false'.`, 400);
                }
                params[paramConfig.name] = param === 'true';
            }
        }
    });
};
