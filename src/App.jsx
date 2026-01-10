import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Mic, Sparkles, Settings as SettingsIcon, Save, Camera, Users, Play, ArrowRight, Loader2 } from 'lucide-react'
import { initializeGemini, analyzeMeetingNotes, analyzeBusinessCard } from './services/gemini'

function App() {
    const [step, setStep] = useState('onboarding') // 'onboarding' | 'meeting'
    const [meetingData, setMeetingData] = useState({
        supplier: '',
        attendees: '',
        notes: ''
    })

    const [isRecording, setIsRecording] = useState(false)
    const [apiKey, setApiKey] = useState('')
    const [analysis, setAnalysis] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const fileInputRef = useRef(null)

    // Load API Key
    useEffect(() => {
        const savedKey = localStorage.getItem('gemini_api_key')
        if (savedKey) {
            setApiKey(savedKey)
            initializeGemini(savedKey)
        } else {
            setIsSettingsOpen(true)
        }
    }, [])

    const handleSaveKey = () => {
        localStorage.setItem('gemini_api_key', apiKey)
        initializeGemini(apiKey)
        setIsSettingsOpen(false)
    }



    const recognitionRef = useRef(null)
    const isRecordingRef = useRef(false) // Track intended state

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'it-IT';

            recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setMeetingData(prev => ({
                        ...prev,
                        notes: (prev.notes + ' ' + finalTranscript).trim()
                    }));
                }
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    setError("Errore microfono: " + event.error);
                    setIsRecording(false);
                    isRecordingRef.current = false;
                }
                // For other errors (network, no-speech), we let it restart via onend
            };

            recognition.onend = () => {
                // If intended state is still recording, restart!
                if (isRecordingRef.current) {
                    // Safety delay to prevent infinite loops (browser freeze)
                    setTimeout(() => {
                        if (isRecordingRef.current) {
                            try {
                                recognition.start();
                            } catch (e) {
                                console.error("Restart failed", e);
                                setIsRecording(false);
                                isRecordingRef.current = false;
                            }
                        }
                    }, 500);
                } else {
                    setIsRecording(false);
                }
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert("Il tuo browser non supporta la dettatura.");
            return;
        }

        if (isRecording) {
            // User requested stop
            isRecordingRef.current = false;
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            // User requested start
            setError(null);
            isRecordingRef.current = true;
            try {
                recognitionRef.current.start();
                setIsRecording(true);
            } catch (e) {
                console.error(e);
                isRecordingRef.current = false;
                setIsRecording(false);
            }
        }
    };

    // --- Gemini Actions ---

    const handleAnalyzeNotes = async () => {
        if (!apiKey) { setIsSettingsOpen(true); return; }
        setIsLoading(true); setError(null); setAnalysis(null);
        try {
            // Combine manual data with notes for better context
            const contextNotes = `Fornitore: ${meetingData.supplier}\nPartecipanti: ${meetingData.attendees}\n\nAppunti:\n${meetingData.notes}`;
            const result = await analyzeMeetingNotes(contextNotes);
            setAnalysis(result);
        } catch (err) { setError(err.message || "Errore analisi"); }
        finally { setIsLoading(false); }
    }

    const handleBusinessCardUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!apiKey) {
            alert("Inserisci prima la API Key nelle impostazioni!");
            setIsSettingsOpen(true);
            return;
        }

        setIsLoading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const base64String = reader.result;
                const result = await analyzeBusinessCard(base64String);
                setMeetingData(prev => ({
                    ...prev,
                    supplier: result.supplier || '',
                    attendees: result.attendees ? result.attendees.join(', ') : '',
                }));
                setStep('meeting'); // Auto-advance on success
            } catch (err) {
                setError("Impossibile leggere il biglietto da visita. Inserisci i dati manualmente.");
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsDataURL(file);
    }

    // --- PWA Install ---
    const [installPrompt, setInstallPrompt] = useState(null);
    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); setInstallPrompt(e); });
    }, []);
    const handleInstall = () => { if (installPrompt) { installPrompt.prompt(); setInstallPrompt(null); } };


    // --- Render Steps ---

    const renderOnboarding = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Nuovo Appuntamento</h2>
                <p className="text-slate-500">Come vuoi iniziare?</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <Card
                    className="group cursor-pointer hover:border-blue-500 hover:shadow-md transition-all relative overflow-hidden"
                    onClick={() => fileInputRef.current.click()}
                >
                    <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-50 transition-opacity" />
                    <CardContent className="p-6 flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Camera className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-lg">Scansiona Biglietto</h3>
                            <p className="text-sm text-slate-500">Foto al biglietto da visita per auto-compilare</p>
                        </div>
                        {isLoading && <Loader2 className="ml-auto w-5 h-5 animate-spin text-blue-600" />}
                    </CardContent>
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleBusinessCardUpload}
                    />
                </Card>

                <Card
                    className="group cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all relative overflow-hidden"
                    onClick={() => setStep('manual_setup')}
                >
                    <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-50 transition-opacity" />
                    <CardContent className="p-6 flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-lg">Inserimento Manuale</h3>
                            <p className="text-sm text-slate-500">Inserisci fornitore e partecipanti</p>
                        </div>
                        <ArrowRight className="ml-auto w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )

    const renderManualSetup = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-6">
                <Button variant="ghost" size="sm" onClick={() => setStep('onboarding')}>← Indietro</Button>
                <h2 className="text-xl font-bold">Dettagli Fornitore</h2>
            </div>

            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                        <Label>Nome Fornitore / Azienda</Label>
                        <Input
                            placeholder="Es. Tenuta San Guido"
                            value={meetingData.supplier}
                            onChange={(e) => setMeetingData({ ...meetingData, supplier: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Partecipanti (separati da virgola)</Label>
                        <Input
                            placeholder="Es. Mario Rossi, Luca Bianchi"
                            value={meetingData.attendees}
                            onChange={(e) => setMeetingData({ ...meetingData, attendees: e.target.value })}
                        />
                    </div>
                    <Button className="w-full mt-4" onClick={() => setStep('meeting')}>
                        Inizia Meeting <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    )

    const renderMeeting = () => (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" size="sm" onClick={() => setStep('onboarding')}>← Fine Meeting</Button>
                <div className="text-right">
                    <p className="font-bold text-sm">{meetingData.supplier || 'Fornitore sconosciuto'}</p>
                    <p className="text-xs text-slate-500">{meetingData.attendees || 'Nessun partecipante segnato'}</p>
                </div>
            </div>

            <Card className="shadow-sm border-slate-200 h-[calc(100vh-180px)] flex flex-col">
                <CardHeader className="pb-2 flex-none">
                    <CardTitle className="text-lg">Appunti Meeting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                    <Textarea
                        className="flex-1 text-base p-4 resize-none bg-slate-50/50 focus:bg-white transition-colors"
                        placeholder="Inizia a scrivere o detta gli appunti..."
                        value={meetingData.notes}
                        onChange={(e) => setMeetingData({ ...meetingData, notes: e.target.value })}
                    />

                    <div className="flex gap-2 flex-none py-2">
                        <Button
                            variant="outline"
                            className={`flex-1 border-slate-300 ${isRecording ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
                            onClick={toggleRecording}
                        >
                            <Mic className={`w-4 h-4 mr-2 ${isRecording ? 'animate-pulse' : ''}`} />
                            {isRecording ? 'Stop Dettatura' : 'Dettatura'}
                        </Button>

                        <Button
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
                            onClick={handleAnalyzeNotes}
                            disabled={isLoading || !meetingData.notes.trim()}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            {isLoading ? 'Analisi...' : 'Analizza con AI'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Analysis Result Overlay or Section */}
            {analysis && (
                <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
                    <Card className="w-full max-w-lg shadow-xl border-t-4 border-t-indigo-500 animate-in slide-in-from-bottom-10">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Analisi AI Completa</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setAnalysis(null)}>Chiudi</Button>
                        </CardHeader>
                        <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                <h4 className="font-semibold text-indigo-900 text-sm mb-1">Riassunto</h4>
                                <p className="text-sm text-slate-800">{analysis.summary}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white rounded-lg border border-slate-200">
                                    <h4 className="font-semibold text-slate-900 text-sm mb-2">Azioni</h4>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {analysis.action_items?.map((item, i) => (
                                            <li key={i} className="text-xs text-slate-600">{item}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-slate-200">
                                    <h4 className="font-semibold text-slate-900 text-sm mb-2">Sentiment</h4>
                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${analysis.sentiment === 'Positivo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                        }`}>
                                        {analysis.sentiment}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {analysis.tags?.map(tag => (
                                            <span key={tag} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <div className="max-w-md mx-auto p-4 h-full min-h-screen flex flex-col">

                {/* Header */}
                <header className="flex justify-between items-center py-4 mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold transition-transform ${isLoading ? 'scale-110' : ''}`}>
                            BA
                        </div>
                        <div>
                            <h1 className="leading-none font-bold text-slate-900">Buyer Assistant</h1>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">AI Powered</p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        {installPrompt && (
                            <Button variant="ghost" size="icon" onClick={handleInstall} className="text-blue-600 hover:bg-blue-50">
                                <Save className="w-5 h-5" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
                            <SettingsIcon className="w-5 h-5 text-slate-400 hover:text-slate-900" />
                        </Button>
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className="flex-1 flex flex-col">
                    {step === 'onboarding' && renderOnboarding()}
                    {step === 'manual_setup' && renderManualSetup()}
                    {step === 'meeting' && renderMeeting()}
                </main>

                {/* Modal Settings */}
                {isSettingsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                        <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl scale-100 animate-in zoom-in-95">
                            <h2 className="mb-4 text-xl font-bold text-slate-900">Impostazioni AI</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="apiKey">Gemini API Key</Label>
                                    <Input
                                        id="apiKey"
                                        type="password"
                                        placeholder="Incolla qui la tua API Key..."
                                        className="font-mono text-sm"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500">
                                        Necessaria per l'analisi del biglietto da visita e degli appunti.
                                    </p>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button variant="ghost" onClick={() => setIsSettingsOpen(false)}>Annulla</Button>
                                    <Button onClick={handleSaveKey} className="bg-slate-900 text-white hover:bg-slate-800">Salva Chiave</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

export default App
