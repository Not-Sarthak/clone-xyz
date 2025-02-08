// Create a function that will send a POST request with body:
// {
//   threadId: string;
//   assistantId: string;
// }
// to the execution service

import axios from 'axios';

const EXECUTION_SERVICE_URL = 'https://6873-2401-4900-883d-5007-acde-f493-4596-6ebf.ngrok-free.app';

export async function sendTaskToExecutionService(threadId: string, assistantId: string): Promise<string> {
    // generate a random number of upto 16 bytes
    const taskDefinitionId = Math.floor(Math.random() * 1000);
    const response = await axios.post(`${EXECUTION_SERVICE_URL}/task/execute`, {
        threadId,
        assistantId,
        taskDefinitionId
    });

    if (response.data.error === false) {
        return response.data.data.proofOfTask;
    } else {
        throw new Error(response.data.message);
    }
}
