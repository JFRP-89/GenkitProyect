import {z} from 'zod';
import { searchWeb } from './search.js';

export function createSearchTool(ai, client) {
    return ai.defineTool({
        name: 'searchWeb',
        description: 'Search the web for current information to answer user queries. Use this when you need up-to-date or factual information.',
        inputSchema: z.object({
            query: z.string().describe('The user query to search for.'),
        }),
        outputSchema: z.string().describe('Search results with titles, URLs, and content.'),
    }, async ( input ) => {
        // Realizar la búsqueda web utilizando el cliente de GoggleAI
        const searchResults = await searchWeb(client, input.query, 5);

        // Formatear y devolver los resultados de la búsqueda
        const formattedResults = searchResults.results
          .map((result, index) => {
            return `[${index + 1}] ${result.title}\nURL: ${result.url}\nContent: ${result.content}\n`;
          })
          .join('\n');
        return formattedResults;
    });
}

export function createChatAgent(ai, client, model) {
    // Crear la tool
    const searchTool = createSearchTool(ai, client);

    // Definir el prompt del agente de chat con la tool de búsqueda

    const searchPrompt = ai.definePrompt({
        name: 'searchPrompt',
        description: 'Prompt that searches the web to answer user queries based on current information.',
        model: model,
        input: {
            schema: z.object({
                query: z.string().min(1).max(2000).describe('The user query to search for.'),
            }),
        },
        tools: [searchTool],
        prompt: `You are a helpful AI assistant that provides comprehensive and accurate answers based on web search results.

User Query: {{query}}

Instructions:
1. Provide a comprehensive answer to the user's query based on the search results above
2. Synthesize information from multiple sources when relevant
3. Be factual and cite specific sources using [1], [2], etc. notation
4. If the search results don't contain enough information, acknowledge this
5. Keep the answer clear and well-structured
6. Use markdown formatting for better readability
7. Please use the tool searchWeb always when you need to look up current information
8. Add a section at the end titled "Sources" listing the URLs of the references used

Answer:`
    });

    return ai.chat(searchPrompt);
        
}