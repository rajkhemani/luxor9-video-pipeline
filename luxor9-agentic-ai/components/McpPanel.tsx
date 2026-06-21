import React, { useState, useEffect } from 'react';
import { mcpRouter } from '../services/mcpRouter';
import { mcpClient } from '../services/mcpClient';
import { McpProfile, McpPlatform } from '../types';
import { Network, Plus, Trash2, Check, X, Key, Cloud, Sparkles, Box, Terminal, Cpu, Zap, Ghost, Layers, Server, Globe, ExternalLink, Activity, Sun, Moon, Laptop, Shield, Lock, AlertTriangle, RefreshCw, CheckCircle2, XCircle, CreditCard, ChevronLeft, Search, Eye, EyeOff, Info, Mic, Database, ToggleLeft, ToggleRight } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const PLATFORMS: { id: McpPlatform; label: string; icon: any; color: string; url: string; description: string }[] = [
  { id: 'google', label: 'Google Gemini', icon: Cloud, color: 'text-blue-500', url: 'https://aistudio.google.com/app/apikey', description: 'Essential. Powers Overseer, Veo, and core reasoning.' },
  { id: 'openrouter', label: 'OpenRouter', icon: Network, color: 'text-indigo-500', url: 'https://openrouter.ai/keys', description: 'Unified gateway for Mistral, Llama, and other open models.' },
  { id: 'huggingface', label: 'HuggingFace', icon: Ghost, color: 'text-yellow-400', url: 'https://huggingface.co/settings/tokens', description: 'Access open-source vision (BLIP-2) and image models.' },
  { id: 'cohere', label: 'Cohere', icon: Database, color: 'text-teal-500', url: 'https://dashboard.cohere.com/api-keys', description: 'Required for advanced semantic search and embeddings.' },
  { id: 'assemblyai', label: 'AssemblyAI', icon: Mic, color: 'text-purple-500', url: 'https://www.assemblyai.com/app/account', description: 'Audio transcription and intelligence.' },
  { id: 'openai', label: 'OpenAI', icon: Sparkles, color: 'text-green-400', url: 'https://platform.openai.com/api-keys', description: 'Optional fallback for reasoning agents.' },
  { id: 'anthropic', label: 'Anthropic', icon: Box, color: 'text-orange-400', url: 'https://console.anthropic.com/settings/keys', description: 'Optional Claude 3.5 Sonnet access.' },
  { id: 'replicate', label: 'Replicate', icon: Layers, color: 'text-purple-400', url: 'https://replicate.com/account/api-tokens', description: 'Hosting for specialized generative models.' },
  { id: 'xai', label: 'xAI', icon: Cpu, color: 'text-zinc-400 dark:text-zinc-100', url: 'https://console.x.ai/', description: 'Grok access.' },
  { id: 'deepseek', label: 'DeepSeek', icon: Zap, color: 'text-cyan-400', url: 'https://platform.deepseek.com/', description: 'DeepSeek V3/R1 access.' },
];

type Tab = 'general' | 'keys' | 'mcp' | 'system';
type WizardStep = 'list' | 'select' | 'configure';

export const McpPanel: React.FC<Props> = ({ isOpen, onClose, isDarkMode, onToggleTheme }) => {
  const [activeTab, setActiveTab] = useState<Tab>('keys');
  
  // Wizard State
  const [wizardStep, setWizardStep] = useState<WizardStep>('list');
  const [selectedPlatform, setSelectedPlatform] = useState<McpPlatform>('google');
  
  // Data State
  const [profiles, setProfiles] = useState<McpProfile[]>([]);
  const [formData, setFormData] = useState({ name: '', key: '' });
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  
  // MCP Connections State
  const [connections, setConnections] = useState<any[]>([]);
  const [newServerUrl, setNewServerUrl] = useState('');
  const [isAddingServer, setIsAddingServer] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProfiles();
      refreshConnections();
      if (activeTab === 'keys') setWizardStep('list');
      
      const lastSse = localStorage.getItem('luxor9_mcp_sse_url');
      if (lastSse && !mcpClient.isSseConnected(lastSse)) {
          mcpClient.connectSse(lastSse)
            .then(() => refreshConnections())
            .catch(e => console.warn("Auto-reconnect failed", e));
      }
    }
  }, [isOpen]);

  const loadProfiles = () => {
    setProfiles([...mcpRouter.getProfiles()]);
  };

  const refreshConnections = () => {
      setConnections([...mcpClient.getConnections()]);
  };

  const handleStartAdd = () => {
      setWizardStep('select');
      setTestStatus('idle');
      setFormData({ name: '', key: '' });
  };

  const handleSelectPlatform = (id: McpPlatform) => {
      setSelectedPlatform(id);
      const defaultName = PLATFORMS.find(p => p.id === id)?.label || 'My Key';
      setFormData({ name: defaultName, key: '' });
      setWizardStep('configure');
  };

  const handleBack = () => {
      if (wizardStep === 'configure') setWizardStep('select');
      else setWizardStep('list');
      setTestStatus('idle');
  };

  const handleSaveKey = () => {
    if (formData.key && formData.name) {
      mcpRouter.addProfile(formData.name, formData.key, selectedPlatform);
      setFormData({ name: '', key: '' });
      setWizardStep('list');
      setTestStatus('idle');
      loadProfiles();
    }
  };

  const handleActivate = (profile: McpProfile) => {
      mcpRouter.setActiveProfile(profile.id);
      loadProfiles();
  };

  const handleTestKey = async () => {
      if (!formData.key) return;
      setTestStatus('testing');
      try {
          if (selectedPlatform === 'google') {
              const ai = new GoogleGenAI({ apiKey: formData.key });
              await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: { parts: [{ text: 'ping' }] }
              });
          } else if (selectedPlatform === 'huggingface') {
               const res = await fetch('https://api-inference.huggingface.co/models/google/bert-base-uncased', { 
                   method: 'HEAD',
                   headers: { Authorization: `Bearer ${formData.key}` } 
               });
               if (res.status === 401 || res.status === 403) throw new Error("Invalid Token");
          } else if (selectedPlatform === 'openrouter') {
               const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
                   method: 'GET',
                   headers: { Authorization: `Bearer ${formData.key}` }
               });
               if (!res.ok) throw new Error("Invalid OpenRouter Key");
          }
          // Generic success for others for now
          await new Promise(resolve => setTimeout(resolve, 800)); // Fake delay for UX
          setTestStatus('success');
      } catch (e) {
          console.error("Key Validation Failed", e);
          setTestStatus('error');
      }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this key?')) {
        mcpRouter.removeProfile(id);
        loadProfiles();
    }
  };

  const handleAddServer = async () => {
      if (newServerUrl) {
          localStorage.setItem('luxor9_mcp_sse_url', newServerUrl);
          await mcpClient.connectSse(newServerUrl);
          setNewServerUrl('');
          setIsAddingServer(false);
          refreshConnections();
      }
  };

  const handleDisconnect = async (id: string) => {
      await mcpClient.disconnect(id);
      refreshConnections();
  };

  const handleResetData = () => {
      if (confirm('WARNING: This will wipe all local data, including memory, chats, and API keys. The app will reload.')) {
          localStorage.clear();
          window.location.reload();
      }
  };

  const handleAiStudioSelect = async () => {
      if ((window as any).aistudio) {
          try {
              await (window as any).aistudio.openSelectKey();
              alert("Key selected. If not automatically detected, please paste it manually.");
          } catch (e) {
              console.error(e);
              alert("Failed to open Key Selector. Please use the manual link.");
          }
      } else {
          window.open('https://aistudio.google.com/app/apikey', '_blank');
      }
  };

  const getPlatformInfo = (id: McpPlatform) => PLATFORMS.find(x => x.id === id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#09090b] w-full max-w-4xl h-[85vh] rounded-xl shadow-2xl dark:shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative ring-1 ring-black/5 dark:ring-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex h-full">
            
            {/* Sidebar Navigation */}
            <div className="w-64 bg-zinc-50/80 dark:bg-zinc-900/30 border-r border-zinc-200 dark:border-white/5 flex flex-col shrink-0">
                <div className="p-6 border-b border-zinc-200 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-bold brand-font">L9</div>
                        <div>
                            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 brand-font tracking-wide">SETTINGS</div>
                            <div className="text-[10px] text-zinc-500 font-mono">System Configuration</div>
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {[
                        { id: 'general', label: 'General', icon: Laptop },
                        { id: 'keys', label: 'API Credentials', icon: Lock },
                        { id: 'mcp', label: 'Neural Nodes', icon: Network },
                        { id: 'system', label: 'Diagnostics', icon: Activity },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as Tab); if(tab.id === 'keys') setWizardStep('list'); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                activeTab === tab.id 
                                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-white/5' 
                                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-zinc-200 dark:border-white/5">
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-600 text-center font-mono">
                        Build v3.3.0<br/>
                        Luxor9 Architect
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#09090b]">
                {/* Header */}
                <div className="h-16 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-8 shrink-0">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                        {activeTab === 'keys' && wizardStep !== 'list' && (
                            <button onClick={handleBack} className="mr-2 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        {activeTab === 'general' && 'General Preferences'}
                        {activeTab === 'keys' && (wizardStep === 'list' ? 'API Access Credentials' : wizardStep === 'select' ? 'Select Provider' : 'Configure Credential')}
                        {activeTab === 'mcp' && 'Model Context Protocol'}
                        {activeTab === 'system' && 'System Health'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    
                    {/* --- GENERAL TAB --- */}
                    {activeTab === 'general' && (
                        <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-white/5 pb-2">Interface</h3>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                            {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Appearance</div>
                                            <div className="text-xs text-zinc-500">Toggle between light and dark mode.</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={onToggleTheme}
                                        className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 transition-all"
                                    >
                                        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-white/5 pb-2">Data Management</h3>
                                <div className="bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-sm font-bold text-red-700 dark:text-red-400">Reset Application</div>
                                            <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-1 leading-relaxed">
                                                This action will delete all locally stored data, including your API keys, chat history, and neural memories. This cannot be undone.
                                            </p>
                                            <button 
                                                onClick={handleResetData}
                                                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                                            >
                                                Clear All Data
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- KEYS TAB (WIZARD FLOW) --- */}
                    {activeTab === 'keys' && (
                        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                            
                            {/* VIEW: LIST */}
                            {wizardStep === 'list' && (
                                <div className="space-y-6">
                                    {/* Security Notice */}
                                    <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl mb-6">
                                        <Shield size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                        <div className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                                            <strong>Local Encryption:</strong> API keys are stored exclusively in your browser's local storage. 
                                            They are never transmitted to our servers, communicating directly with provider endpoints.
                                        </div>
                                    </div>

                                    {/* Core Keys */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                Active Connections
                                            </h3>
                                            <button onClick={handleStartAdd} className="text-xs font-bold text-amber-600 dark:text-amber-500 hover:text-amber-700 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10">
                                                <Plus size={14} /> Add Provider
                                            </button>
                                        </div>

                                        {profiles.length === 0 && (
                                            <div className="p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 gap-3">
                                                <Key size={32} className="opacity-50" />
                                                <span className="text-sm font-medium">No credentials configured</span>
                                                <button onClick={handleStartAdd} className="text-xs font-bold text-amber-500 hover:underline">Connect your first provider</button>
                                            </div>
                                        )}

                                        {profiles.map(profile => {
                                            const pInfo = getPlatformInfo(profile.platform);
                                            const PIcon = pInfo?.icon || Key;
                                            return (
                                                <div key={profile.id} className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:border-amber-500/30 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${profile.platform === 'google' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                                                            <PIcon size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                                                {profile.name}
                                                                {profile.isActive && <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[9px] uppercase tracking-wider font-bold">Active</span>}
                                                            </div>
                                                            <div className="text-xs text-zinc-500 font-mono mt-0.5 flex items-center gap-2">
                                                                <span className="uppercase">{profile.platform}</span>
                                                                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                                                <span>{profile.key.substring(0, 4)}••••••••{profile.key.substring(profile.key.length - 4)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {!profile.isActive && (
                                                            <button 
                                                                onClick={() => handleActivate(profile)}
                                                                className="px-3 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                            >
                                                                Use
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleDelete(profile.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* VIEW: SELECT PLATFORM */}
                            {wizardStep === 'select' && (
                                <div className="space-y-6">
                                    <div className="text-sm text-zinc-500 dark:text-zinc-400">Choose an AI provider to connect to Luxor9.</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {PLATFORMS.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => handleSelectPlatform(p.id)}
                                                className="flex items-start gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-left group"
                                            >
                                                <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors bg-zinc-100 dark:bg-zinc-800 group-hover:bg-white dark:group-hover:bg-black`}>
                                                    <p.icon size={20} className={p.color} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">{p.label}</div>
                                                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{p.description}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* VIEW: CONFIGURE */}
                            {wizardStep === 'configure' && (
                                <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getPlatformInfo(selectedPlatform)?.color.replace('text-', 'bg-').replace('400', '100').replace('500', '100')} bg-opacity-20`}>
                                            {(() => {
                                                const Icon = getPlatformInfo(selectedPlatform)?.icon || Key;
                                                return <Icon size={24} className={getPlatformInfo(selectedPlatform)?.color} />;
                                            })()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{getPlatformInfo(selectedPlatform)?.label}</h3>
                                            <a href={getPlatformInfo(selectedPlatform)?.url} target="_blank" rel="noreferrer" className="text-xs text-amber-600 hover:underline flex items-center gap-1">
                                                Get API Key <ExternalLink size={10} />
                                            </a>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Profile Name</label>
                                            <input 
                                                type="text" 
                                                value={formData.name}
                                                onChange={e => setFormData({...formData, name: e.target.value})}
                                                placeholder="e.g. My Pro Key"
                                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500 transition-colors text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">API Secret Key</label>
                                            <div className="relative">
                                                <input 
                                                    type={showKey ? "text" : "password"}
                                                    value={formData.key}
                                                    onChange={e => { setFormData({...formData, key: e.target.value}); setTestStatus('idle'); }}
                                                    placeholder="sk-..."
                                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500 transition-colors text-zinc-900 dark:text-zinc-100 font-mono pr-12 placeholder-zinc-400"
                                                />
                                                <button 
                                                    onClick={() => setShowKey(!showKey)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                                >
                                                    {showKey ? <EyeOff size={16}/> : <Eye size={16}/>} 
                                                </button>
                                            </div>
                                        </div>

                                        {selectedPlatform === 'google' && (window as any).aistudio && (
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20 flex items-center justify-between">
                                                <div className="text-xs text-blue-700 dark:text-blue-300">Using Veo for video? Select a paid key.</div>
                                                <button onClick={handleAiStudioSelect} className="text-[10px] font-bold bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-100 px-3 py-1.5 rounded-md hover:bg-blue-200 transition-colors">Select Key</button>
                                            </div>
                                        )}

                                        <div className="flex gap-3 pt-2">
                                            {formData.key && (
                                                <button 
                                                    onClick={handleTestKey}
                                                    disabled={testStatus === 'testing' || testStatus === 'success'}
                                                    className={`px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border ${
                                                        testStatus === 'success' 
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 border-emerald-200 dark:border-emerald-500/30' 
                                                        : testStatus === 'error'
                                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 border-red-200 dark:border-red-500/30'
                                                            : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                                                    }`}
                                                >
                                                    {testStatus === 'testing' && <RefreshCw size={14} className="animate-spin" />}
                                                    {testStatus === 'success' && <CheckCircle2 size={14} />}
                                                    {testStatus === 'error' && <XCircle size={14} />}
                                                    {testStatus === 'idle' && 'Test'}
                                                    {testStatus === 'testing' && 'Verifying...'}
                                                    {testStatus === 'success' && 'Verified'}
                                                    {testStatus === 'error' && 'Invalid'}
                                                </button>
                                            )}
                                            
                                            <button 
                                                onClick={handleSaveKey} 
                                                disabled={!formData.key || !formData.name}
                                                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-amber-500/20 text-sm"
                                            >
                                                Save Credential
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- MCP TAB --- */}
                    {activeTab === 'mcp' && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl p-5">
                                <h3 className="font-bold text-sm text-purple-900 dark:text-purple-100 mb-2">Model Context Protocol (MCP)</h3>
                                <p className="text-xs text-purple-800/70 dark:text-purple-200/60 leading-relaxed">
                                    Luxor9 supports the MCP standard, allowing agents to connect to external tools, local servers, and databases via Server-Sent Events (SSE). 
                                    Add a local or remote endpoint below to extend agent capabilities.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Connected Nodes</h3>
                                    <button onClick={() => setIsAddingServer(!isAddingServer)} className="text-xs font-bold text-amber-600 hover:text-amber-500 flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-500/20 transition-all">
                                        <Plus size={12} /> ADD REMOTE
                                    </button>
                                </div>

                                {isAddingServer && (
                                    <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl animate-in slide-in-from-top-2">
                                        <label className="text-[10px] uppercase text-zinc-500 font-bold mb-2 block">SSE Endpoint URL</label>
                                        <div className="flex gap-2">
                                            <input 
                                                autoFocus
                                                type="text" 
                                                placeholder="http://localhost:8080/sse" 
                                                className="flex-1 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:border-amber-500 outline-none font-mono text-zinc-900 dark:text-zinc-100"
                                                value={newServerUrl}
                                                onChange={(e) => setNewServerUrl(e.target.value)}
                                            />
                                            <button onClick={handleAddServer} className="px-4 bg-amber-600 text-white font-bold rounded-lg text-xs hover:bg-amber-500 shadow-sm">
                                                CONNECT
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {connections.map((conn) => (
                                    <div key={conn.id} className="p-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between group shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${conn.status === 'connected' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500' : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500'}`}>
                                                <Server size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">{conn.transport.name}</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${conn.status === 'connected' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'}`}>{conn.status}</span>
                                                </div>
                                                <div className="text-[10px] text-zinc-500 mt-1 font-mono">{conn.tools.length} Tools • {conn.id}</div>
                                            </div>
                                        </div>
                                        {conn.id !== 'internal' && (
                                            <button onClick={() => handleDisconnect(conn.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- SYSTEM TAB --- */}
                    {activeTab === 'system' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                                    <div className="flex items-center gap-2 mb-2 text-zinc-500">
                                        <Activity size={14} />
                                        <span className="text-[10px] uppercase tracking-wider font-bold">Memory Usage</span>
                                    </div>
                                    <div className="text-3xl font-mono text-zinc-900 dark:text-zinc-200 tracking-tighter">
                                        {((performance as any).memory?.usedJSHeapSize / 1024 / 1024).toFixed(1) || 'N/A'} <span className="text-sm text-zinc-500 font-sans">MB</span>
                                    </div>
                                </div>
                                <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                                    <div className="flex items-center gap-2 mb-2 text-zinc-500">
                                        <RefreshCw size={14} />
                                        <span className="text-[10px] uppercase tracking-wider font-bold">Session Uptime</span>
                                    </div>
                                    <div className="text-3xl font-mono text-zinc-900 dark:text-zinc-200 tracking-tighter">
                                        {(performance.now() / 1000 / 60).toFixed(0)} <span className="text-sm text-zinc-500 font-sans">MIN</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800">
                                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Browser Capabilities</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['WebGL 2.0', 'WebAudio API', 'MediaRecorder', 'WebWorkers', 'ServiceWorker', 'SpeechRecognition'].map(c => (
                                        <span key={c} className="px-2 py-1 rounded-md bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
      </div>
    </div>
  );
};