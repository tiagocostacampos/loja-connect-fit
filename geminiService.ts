
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Sale, Expense } from "./types";

// Helper function to get the AI client
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialInsights = async (sales: Sale[], expenses: Expense[]) => {
  const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalSales - totalExpenses;

  const prompt = `Analise os seguintes dados financeiros da loja de roupas fitness Connect Fit:
  - Vendas Totais: R$ ${totalSales.toFixed(2)}
  - Despesas Totais: R$ ${totalExpenses.toFixed(2)}
  - Lucro: R$ ${profit.toFixed(2)}
  - Número de vendas: ${sales.length}
  - Número de registros de despesas: ${expenses.length}

  Forneça 3 insights curtos e práticos sobre a saúde financeira do negócio e uma sugestão para aumentar a margem de lucro.`;

  try {
    // Always initialize GoogleGenAI with the current process.env.API_KEY before generating content
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Extract text from the response using the .text property
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível gerar insights no momento. Verifique suas vendas e despesas manualmente.";
  }
};

export const generateProductDescription = async (name: string, category: string) => {
  const prompt = `Gere uma descrição curta e vendedora para um produto de moda fitness chamado "${name}" da categoria "${category}". Destaque conforto e tecnologia do tecido.`;
  
  try {
    // Always initialize GoogleGenAI with the current process.env.API_KEY before generating content
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Extract text from the response using the .text property
    return response.text;
  } catch (error) {
    return `Incrível ${name} para o seu treino!`;
  }
};
