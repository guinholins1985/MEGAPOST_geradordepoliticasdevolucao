
import { GoogleGenAI } from "@google/genai";
import { PolicyFormData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const buildPrompt = (data: PolicyFormData): string => {
    return `
    Aja como um especialista em redação de documentos legais e comerciais para e-commerce no Brasil.
    Sua tarefa é criar uma "Política de Trocas e Devoluções" clara, profissional, completa e em conformidade com o Código de Defesa do Consumidor brasileiro.

    Utilize as seguintes informações fornecidas pelo lojista para personalizar a política:
    - Nome da Loja: ${data.storeName}
    - Prazo para devolução por arrependimento: ${data.returnWindow} dias corridos, a contar da data de recebimento.
    - Prazo para troca (por defeito ou outro produto): ${data.exchangeWindow} dias corridos, a contar da data de recebimento.
    - E-mail para contato e solicitações: ${data.contactEmail}
    - Condições essenciais que o produto deve apresentar para a troca/devolução: ${data.conditions.join(', ')}.
    - Opções disponíveis para o cliente em caso de devolução/troca aprovada: ${data.refundOptions.join(', ')}.

    Estruture a política da seguinte forma, utilizando títulos claros e numeração para cada seção principal:

    1. Direito de Arrependimento (Devolução)
       - Explique o prazo de ${data.returnWindow} dias conforme o Código de Defesa do Consumidor.
       - Detalhe como o cliente deve proceder para solicitar a devolução.

    2. Trocas
       - Diferencie a troca por defeito da troca por outro produto (se aplicável).
       - Informe o prazo de ${data.exchangeWindow} dias.
       - Descreva o procedimento para a solicitação de troca.

    3. Condições para Troca e Devolução
       - Liste de forma clara e objetiva as condições que o produto deve atender, baseando-se em: ${data.conditions.join(', ')}.
       - Mencione que produtos que não atenderem a essas condições não serão aceitos e serão devolvidos ao remetente.

    4. Procedimento para Solicitação
       - Crie um passo a passo simples para o cliente.
       - Ex: 1. Entrar em contato pelo e-mail ${data.contactEmail}. 2. Informar número do pedido e motivo. 3. Aguardar instruções de envio.

    5. Análise e Opções de Restituição
       - Explique que o produto passará por uma análise ao chegar no centro de distribuição da ${data.storeName}.
       - Se a análise for aprovada, liste as opções que o cliente terá, com base em: ${data.refundOptions.join(', ')}. Seja claro sobre como cada opção funciona (ex: como o estorno é feito, como o crédito é liberado, etc.).

    6. Custos de Frete
       - Especifique que na primeira troca ou devolução por arrependimento, o custo do frete de devolução é por conta da ${data.storeName}. Para trocas subsequentes do mesmo pedido, o custo é do cliente.

    7. Contato
       - Finalize reforçando o canal de atendimento principal: ${data.contactEmail}.

    O tom do texto deve ser formal, mas acessível e tranquilizador para o cliente, demonstrando o compromisso da ${data.storeName} com a satisfação do consumidor. Não inclua introduções como "Aqui está a política" ou despedidas. Gere apenas o texto da política completo, começando pelo título.
    `;
};


export const generatePolicyText = async (data: PolicyFormData): Promise<string> => {
    try {
        const prompt = buildPrompt(data);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate policy text from Gemini API.");
    }
};
