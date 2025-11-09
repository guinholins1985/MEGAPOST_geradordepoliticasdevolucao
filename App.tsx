import React, { useState, useCallback } from 'react';
import { PolicyFormData } from './types';
import { generatePolicyText } from './services/geminiService';
import { PRODUCT_CONDITIONS, REFUND_OPTIONS } from './constants';
import FormInput from './components/FormInput';
import CheckboxGroup from './components/CheckboxGroup';

const App: React.FC = () => {
    const [formData, setFormData] = useState<PolicyFormData>({
        storeName: '',
        returnWindow: 7,
        exchangeWindow: 30,
        conditions: ['Produto na embalagem original', 'Sem sinais de uso ou danos', 'Acompanhado da nota fiscal'],
        refundOptions: ['Reembolso total do valor pago', 'Crédito na loja para futuras compras'],
        contactEmail: '',
    });
    const [generatedPolicy, setGeneratedPolicy] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState<boolean>(false);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleCheckboxChange = useCallback((group: keyof PolicyFormData, value: string) => {
        setFormData(prev => {
            const currentValues = prev[group] as string[];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(item => item !== value)
                : [...currentValues, value];
            return { ...prev, [group]: newValues };
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setGeneratedPolicy('');
        setCopySuccess(false);

        try {
            const policyText = await generatePolicyText(formData);
            setGeneratedPolicy(policyText);
        } catch (err) {
            setError('Falha ao gerar a política. Verifique sua chave de API e tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedPolicy).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const handleSaveAsTxt = () => {
        if (!generatedPolicy) return;

        // Sanitize store name for filename
        const fileName = `politica-de-trocas-${formData.storeName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'sua-loja'}.txt`;

        const blob = new Blob([generatedPolicy], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
            <header className="bg-slate-800/50 backdrop-blur-sm p-4 border-b border-slate-700">
                <div className="container mx-auto max-w-7xl">
                    <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
                        Gerador de Política de Trocas e Devoluções
                    </h1>
                    <p className="text-center text-slate-400 mt-1">Crie uma política profissional para sua loja em segundos com o poder da IA do Gemini.</p>
                </div>
            </header>

            <main className="container mx-auto max-w-7xl p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Formulário */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h2 className="text-2xl font-semibold mb-4 text-sky-400 border-b border-slate-600 pb-2">Informações da Loja</h2>
                            <FormInput
                                label="Nome da Loja"
                                name="storeName"
                                value={formData.storeName}
                                onChange={handleInputChange}
                                placeholder="Ex: Moda Rápida"
                                required
                            />
                            <FormInput
                                label="E-mail de Contato"
                                name="contactEmail"
                                type="email"
                                value={formData.contactEmail}
                                onChange={handleInputChange}
                                placeholder="contato@sua-loja.com"
                                required
                            />
                            
                            <h2 className="text-2xl font-semibold mb-4 text-sky-400 border-b border-slate-600 pb-2 pt-4">Prazos</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormInput
                                    label="Devolução por Arrependimento (dias)"
                                    name="returnWindow"
                                    type="number"
                                    value={formData.returnWindow.toString()}
                                    onChange={handleInputChange}
                                    required
                                />
                                <FormInput
                                    label="Troca por Defeito ou Outro Produto (dias)"
                                    name="exchangeWindow"
                                    type="number"
                                    value={formData.exchangeWindow.toString()}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                             <CheckboxGroup 
                                title="Condições do Produto"
                                options={PRODUCT_CONDITIONS}
                                selectedOptions={formData.conditions}
                                onChange={(value) => handleCheckboxChange('conditions', value)}
                             />

                             <CheckboxGroup 
                                title="Opções de Reembolso/Troca"
                                options={REFUND_OPTIONS}
                                selectedOptions={formData.refundOptions}
                                onChange={(value) => handleCheckboxChange('refundOptions', value)}
                             />
                            
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Gerando...
                                    </>
                                ) : 'Gerar Política'}
                            </button>
                        </form>
                    </div>

                    {/* Resultado */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg relative min-h-[400px] flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-600 pb-2">
                            <h2 className="text-2xl font-semibold text-sky-400">Política Gerada</h2>
                            {generatedPolicy && (
                                <div className="flex items-center gap-2">
                                    <button onClick={handleSaveAsTxt} className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors bg-slate-700 hover:bg-slate-600 text-slate-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Salvar .txt
                                    </button>
                                    <button onClick={handleCopy} className={`flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${copySuccess ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}>
                                        {copySuccess ? (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Copiado!
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                Copiar
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="prose prose-invert max-w-none flex-grow text-slate-300 overflow-y-auto pr-2">
                           {isLoading && (
                               <div className="flex items-center justify-center h-full">
                                   <div className="text-center">
                                       <svg className="animate-spin mx-auto h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                       <p className="mt-4 text-slate-400">Aguarde, a mágica está acontecendo...</p>
                                   </div>
                               </div>
                           )}
                           {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
                           {!isLoading && !error && !generatedPolicy && (
                               <div className="flex items-center justify-center h-full">
                                   <p className="text-slate-500 text-center">Preencha o formulário ao lado e clique em "Gerar Política" para ver o resultado aqui.</p>
                               </div>
                           )}
                           <pre className="whitespace-pre-wrap font-sans text-base">{generatedPolicy}</pre>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;