require('dotenv').config();
const axios = require("axios");

async function handleChatResponse(response) {
    try {
        console.log('Validation Service received response:', {
            assistantId: response.assistantId,
            threadId: response.threadId,
            content: response.content
        });

        return {
            assistantId: response.assistantId,
            threadId: response.threadId,
            content: response.content
        };
    } catch (err) {
        console.error('Error in Validation Service:', err.message);
        throw err;
    }
}

async function subscribeToChat() {
    try {
        const response = await axios.post(`${process.env.API_BASE_URL}/api/chat/subscribe`);
        return handleChatResponse(response.data);
    } catch (err) {
        console.error('Error subscribing to chat:', err.message);
        throw err;
    }
}

module.exports = {
    handleChatResponse,
    subscribeToChat
};