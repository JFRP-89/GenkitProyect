export async function searchWeb(client, query, numResults = 5) {

    try {
        const response = await client.search(query, {
            searchDepth: 'advanced',
            numResults: numResults,
            includeAnswer: true,
            includeRawContent: false,
            includeImages: false,
        });

        return response;
    }
    catch (error) {
        throw new Error(`Search failed: ${error.message}`);
    }
    // Aquí iría la lógica para realizar una búsqueda web real
    // Por ahora, devolvemos una respuesta simulada
    return `Search results for query: "${query}":\n1. Example Result 1 - https://example.com/1\n2. Example Result 2 - https://example.com/2\n3. Example Result 3 - https://example.com/3\n`;
}