import axios from 'axios';

const EXECUTION_SERVICE_URL = 'https://6a4c-2401-4900-883d-5007-acde-f493-4596-6ebf.ngrok-free.app';

export async function sendTaskToExecutionService(threadId: string, assistantId: string): Promise<string> {
    const response = await axios.post(`${EXECUTION_SERVICE_URL}/task/execute`, {
        threadId,
        assistantId
    });

    if (response.data.error === false) {
        return response.data.data.proofOfTask;
    } else {
        throw new Error(response.data.message);
    }
}
