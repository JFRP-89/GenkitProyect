import dotenv from 'dotenv';
import chalk from 'chalk';
import { tavily } from '@tavily/core';
import { genkit } from 'genkit/beta';
import googleAI from '@genkit-ai/googleai';
import redline from 'readline';
import ora from 'ora';
import { createChatAgent } from './src/agent.js';
//import { createSearchTool } from './src/search.js';

// Cargamos las variables de entorno desde un archivo .env
dotenv.config();

async function startInteractive() {
    try{

        const TavilyApiKey = process.env.TAVILY_API_KEY;
        if (!TavilyApiKey) {
          throw new Error('TAVILY_API_KEY is not set in environment variables');
        }

        const GeminiApiKey = process.env.GOOGLE_API_KEY;
        if (!GeminiApiKey) {
          throw new Error('GOOGLE_API_KEY is not set in environment variables');
        }

        const client = tavily({ apiKey: TavilyApiKey });

        const ai = genkit({
          plugins: [googleAI({ apiKey: GeminiApiKey })],
        });

        // Crear agente
        const chat = createChatAgent(ai, client, googleAI.model('gemini-2.5-flash'));

        const rl = redline.createInterface({
          input: process.stdin,
          output: process.stdout,
          prompt: chalk.green.bold('\n💬 Ask a question (or type "exit" to quit): '),
          terminal: true
        });

        console.log(chalk.cyan.bold('\n╔════════════════════════════════════════════════════╗'));
        console.log(chalk.cyan.bold('║   Welcome to Perplexity CLI - Interactive Mode     ║'));
        console.log(chalk.cyan.bold('╚════════════════════════════════════════════════════╝'));
        console.log(chalk.gray('Type your questions and get AI-powered answers with sources!'));
        console.log(chalk.gray('Chat history is maintained during this session.'));
        console.log(chalk.gray('Commands: exit, quit, or press Ctrl+C to leave\n'));

        rl.prompt();

        rl.on('line', async (line) => {
          const query = line.trim();
            
            // El usuario no ha introducido nada
            if (!query) {
                rl.prompt();
                return;
            }
            // Comandos para salir
            if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit') {
                rl.close();
                return;
            }

            rl.pause(); // Pausar la entrada mientras se procesa la consulta

            let spinner; 
            
            try
            {
                spinner = ora('🤖 Thinking...').start()
                // Llamaríamos al chat
                const {text} = await chat.send(query);
                spinner.succeed('💡 Got it!');
                // Mostrar la respuesta simulada
                console.log(chalk.blue.bold('Answer:'));
                console.log(chalk.white(text));
            }
            catch (error)
            {
                if (spinner) spinner.fail('❌ Error occurred while processing your request.');
                    console.error(chalk.red('\n❌ Error:'), error.message);
            } finally {
                rl.resume();    // Reanudar la entrada
                rl.prompt();    // Mostrar el prompt de nuevo
            }
            
        });


    }
    
    catch (error) {
        console.error(chalk.red('\n❌ Error:'), error.message);
        
        if (error.message.includes('TAVILY_API_KEY')) {
          console.log(chalk.yellow('\n💡 Tip: Make sure to set your TAVILY_API_KEY in the .env file'));
        }
        if (error.message.includes('GOOGLE_API_KEY')) {
          console.log(chalk.yellow('\n💡 Tip: Make sure to set your GOOGLE_API_KEY in the .env file'));
        }

        
        
        process.exit(1);
      }
}

startInteractive();