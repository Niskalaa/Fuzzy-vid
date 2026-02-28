const WORKER_URL = 'http://127.0.0.1:8787'; // Replace with your worker URL in production

async function fetchApi(path: string, options: RequestInit = {}) {
    const url = `${WORKER_URL}${path}`;
    const response = await fetch(url, options);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
    }

    return response.json();
}

export const api = {
    get: (path: string) => fetchApi(path),
    post: (path: string, data: any) => fetchApi(path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }),
    // Add other methods like put, delete as needed
};
