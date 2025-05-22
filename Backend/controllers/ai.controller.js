import * as ai from '../services/ai.service.js';
import catchAsync from '../utils/catchAsync.js';

export const getResult = catchAsync(async (req, res) => {
    const { prompt } = req.query;
    if (!prompt) {
        const error = new Error('Prompt is required');
        error.statusCode = 400;
        throw error;
    }
    const result = await ai.generateResult(prompt);
    res.send(result);
});
