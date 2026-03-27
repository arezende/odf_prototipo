/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Calendar, 
  Trophy, 
  Send, 
  Terminal, 
  Clock, 
  MapPin, 
  CloudSun, 
  ChevronRight,
  Medal,
  LayoutDashboard,
  Search,
  Menu,
  Share2,
  Copy,
  Bell,
  Megaphone,
  FileText,
  Info,
  Users,
  ShieldAlert,
  TrendingUp,
  BarChart2,
  History,
  Zap,
  Target,
  Award
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  AreaChart,
  Area,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { GoogleGenAI, Type } from "@google/genai";

interface ODFMessage {
  raw: string;
  parsed: any;
  timestamp: string;
}

export default function App() {
  const [messages, setMessages] = useState<ODFMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'results' | 'medals' | 'logs' | 'social' | 'internal' | 'performance'>('dashboard');
  const [showOnlyBrasil, setShowOnlyBrasil] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [resultsSearchTerm, setResultsSearchTerm] = useState('');
  const [resultsSportFilter, setResultsSportFilter] = useState('ALL');
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);
  const [technicalInsight, setTechnicalInsight] = useState<string>('');
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('cob_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    localStorage.setItem('cob_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const fetchTechnicalInsight = async (athlete: any) => {
    if (!athlete) return;
    setIsGeneratingInsight(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `Analise o desempenho do atleta ${athlete.results[0].Competitor?.Description?.FamilyName} no esporte ${athlete.sport}. 
      Ele terminou em ${athlete.results[0].Rank}º lugar. 
      Forneça um insight técnico curto (máximo 2 frases) em português, focado em pontos fortes ou áreas de melhoria, simulando uma análise de IA de alto desempenho para o Comitê Olímpico do Brasil.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setTechnicalInsight(response.text || "O atleta demonstra uma superioridade tática clara nas fases finais da competição.");
    } catch (error) {
      console.error("Erro ao gerar insight:", error);
      setTechnicalInsight("O atleta demonstra uma superioridade tática clara nas fases finais da competição. Sua precisão em momentos de alta pressão é superior à média da categoria.");
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  useEffect(() => {
    if (selectedAthlete) {
      fetchTechnicalInsight(selectedAthlete);
    }
  }, [selectedAthlete]);

  const generatePerformanceData = (athlete: any) => {
    if (!athlete) return null;
    
    // Seeded random for consistency
    const seed = athlete.unitCode.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const random = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    const rank = parseInt(athlete.results[0].Rank) || 1;
    const rankBonus = Math.max(0, (10 - rank) * 2);

    const attributes = [
      { subject: 'Velocidade', A: Math.floor(random(seed + 1) * 20 + 70 + rankBonus), fullMark: 100 },
      { subject: 'Técnica', A: Math.floor(random(seed + 2) * 20 + 70 + rankBonus), fullMark: 100 },
      { subject: 'Resistência', A: Math.floor(random(seed + 3) * 20 + 70 + rankBonus), fullMark: 100 },
      { subject: 'Estratégia', A: Math.floor(random(seed + 4) * 20 + 70 + rankBonus), fullMark: 100 },
      { subject: 'Mental', A: Math.floor(random(seed + 5) * 20 + 70 + rankBonus), fullMark: 100 },
      { subject: 'Potência', A: Math.floor(random(seed + 6) * 20 + 70 + rankBonus), fullMark: 100 },
    ];

    const trend = [
      { name: 'Qualif 1', rank: Math.floor(random(seed + 7) * 5 + 5) },
      { name: 'Qualif 2', rank: Math.floor(random(seed + 8) * 4 + 4) },
      { name: 'Oitavas', rank: Math.floor(random(seed + 9) * 3 + 3) },
      { name: 'Quartas', rank: Math.floor(random(seed + 10) * 2 + 2) },
      { name: 'Semi', rank: Math.floor(random(seed + 11) * 2 + 1) },
      { name: 'Final', rank: parseInt(athlete.results[0].Rank) || 1 },
    ];

    const stats = [
      { label: 'Precisão', val: `${Math.floor(random(seed + 12) * 10 + 85 + rankBonus / 2)}%`, color: 'bg-cob-blue' },
      { label: 'Eficiência', val: `${Math.floor(random(seed + 13) * 10 + 80 + rankBonus / 2)}%`, color: 'bg-cob-green' },
      { label: 'Ataques', val: `${Math.floor(random(seed + 14) * 20 + 40 + rankBonus)}`, color: 'bg-cob-yellow' },
      { label: 'Defesas', val: `${Math.floor(random(seed + 15) * 15 + 25 + rankBonus)}`, color: 'bg-slate-400' }
    ];

    const timeline = [
      { time: '00:00', event: 'Início da Competição', desc: 'Sincronização de cronômetro oficial ODF.', type: 'start' },
      { time: '05:20', event: 'Primeiro Ataque Efetivo', desc: 'Manobra técnica de alta complexidade executada com sucesso.', type: 'action' },
      { time: '12:45', event: 'Advertência Técnica', desc: 'Infração leve de posicionamento detectada pelos juízes.', type: 'warning' },
      { time: '18:30', event: 'Ponto Decisivo', desc: 'Ação estratégica resultando em vantagem competitiva imediata.', type: 'score' },
      { time: '24:15', event: 'Finalização da Prova', desc: 'Conclusão da unidade de competição com validação técnica.', type: 'end' }
    ];

    return { attributes, trend, stats, timeline };
  };

  const perfData = generatePerformanceData(selectedAthlete);

  useEffect(() => {
    socketRef.current = io();
    socketRef.current.on('connect', () => setConnected(true));
    socketRef.current.on('disconnect', () => setConnected(false));
    socketRef.current.on('odf_message', (msg: ODFMessage) => {
      setMessages((prev) => [msg, ...prev].slice(0, 100));
    });
    return () => { socketRef.current?.disconnect(); };
  }, []);

  const simulate = async (type: string) => {
    await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
  };

  const getLatest = (type: string) => messages.find(m => m.parsed?.OdfBody?.DocumentType === type);
  
  const latestSchedule = getLatest('DT_SCHEDULE');
  const latestMedals = getLatest('DT_MEDALS');
  const latestWeather = getLatest('DT_VEN_COND');

  const scheduleUnits = latestSchedule?.parsed?.OdfBody?.Competition?.Unit;
  const scheduleList = Array.isArray(scheduleUnits) ? scheduleUnits : (scheduleUnits ? [scheduleUnits] : []);

  const medalLines = latestMedals?.parsed?.OdfBody?.MedalStandings?.MedalsTable?.MedalLine;
  const medalList = Array.isArray(medalLines) ? medalLines : (medalLines ? [medalLines] : []);

  const weatherData = latestWeather?.parsed?.OdfBody?.Venue?.DateTime?.Conditions;
  
  // Extract all unique results for Brazil
  const allResults = messages
    .filter(m => m.parsed?.OdfBody?.DocumentType === 'DT_RESULT')
    .reduce((acc: any[], msg) => {
      const competition = msg.parsed?.OdfBody?.Competition;
      if (!competition) return acc;
      
      const units = Array.isArray(competition.Unit) ? competition.Unit : (competition.Unit ? [competition.Unit] : []);
      
      units.forEach((unit: any) => {
        const unitResults = Array.isArray(unit.Result) ? unit.Result : (unit.Result ? [unit.Result] : []);
        const brasilResults = unitResults.filter((r: any) => r.Competitor?.Organisation === 'BRA');
        
        if (brasilResults.length > 0) {
          // Check if we already have a newer result for this unit
          const existingIdx = acc.findIndex(a => a.unitCode === (unit.Code || unit.UnitCode));
          if (existingIdx === -1) {
            acc.push({
              unitCode: unit.Code || unit.UnitCode,
              itemName: unit.ItemName?.Value,
              venue: unit.VenueDescription?.VenueName || unit.VenueDescription?.Value,
              sport: unit.Sport || 'GEN',
              timestamp: msg.timestamp,
              results: brasilResults,
              allUnitResults: unitResults
            });
          }
        }
      });
      return acc;
    }, []);

  const latestBrasilResult = allResults[0]; // allResults is already sorted by latest message

  const filteredSchedule = scheduleList.filter((unit: any) => {
    const matchesBrasil = !showOnlyBrasil || (Array.isArray(unit.Competitor) ? unit.Competitor : (unit.Competitor ? [unit.Competitor] : [])).some((c: any) => c.Organisation === 'BRA');
    const matchesSearch = !searchTerm || 
      (unit.ItemName?.Value || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (unit.VenueDescription?.VenueName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorites = !showOnlyFavorites || favorites.includes(unit.Code || unit.UnitCode);
    return matchesBrasil && matchesSearch && matchesFavorites;
  });
  const filteredResults = allResults.filter(item => {
    const matchesSearch = !resultsSearchTerm || 
      (item.itemName || '').toLowerCase().includes(resultsSearchTerm.toLowerCase()) ||
      item.results.some((r: any) => (r.Competitor?.Description?.FamilyName || '').toLowerCase().includes(resultsSearchTerm.toLowerCase()));
    const matchesSport = resultsSportFilter === 'ALL' || item.sport === resultsSportFilter;
    return matchesSearch && matchesSport;
  });

  const uniqueSports = Array.from(new Set(allResults.map(r => r.sport)));

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-cob-blue/10 selection:text-cob-blue">
      {/* COB Style Top Header */}
      <header className="bg-white border-b border-slate-200/60 sticky top-0 z-50 backdrop-blur-xl bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 cob-gradient-green rounded-lg flex items-center justify-center text-white font-black italic text-2xl shadow-lg shadow-cob-green/20">B</div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cob-yellow rounded-full border-2 border-white" />
                  </div>
                  <div className="h-10 w-px bg-slate-200 mx-1" />
                  <div className="flex flex-col">
                    <span className="text-cob-green font-extrabold text-xs uppercase tracking-[0.2em] leading-none mb-1">Comitê Olímpico do</span>
                    <span className="text-cob-blue font-black text-3xl tracking-tighter leading-none font-display">BRASIL</span>
                  </div>
                </div>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-10">
              {['dashboard', 'schedule', 'results', 'performance', 'medals', 'internal', 'social', 'logs'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)} 
                  className={`relative py-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === tab ? 'text-cob-blue' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab === 'dashboard' ? 'Início' : tab === 'schedule' ? 'Agenda' : tab === 'results' ? 'Resultados' : tab === 'performance' ? 'Análise' : tab === 'medals' ? 'Medalhas' : tab === 'social' ? 'Social' : tab === 'internal' ? 'Comunicação' : 'Técnico'}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-cob-blue rounded-full"
                    />
                  )}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {connected ? 'Feed ODF Ativo' : 'Feed Offline'}
                </span>
              </div>
              <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-cob-blue">
                <Search size={20} />
              </button>
              <button className="lg:hidden p-2.5 hover:bg-slate-100 rounded-xl transition-all">
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Simulation Bar - More Subtle */}
      <div className="bg-cob-dark text-white/60 py-2.5 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-[9px] font-bold uppercase tracking-[0.2em]">
            <Activity size={12} className="text-cob-yellow" />
            <span>Ambiente de Simulação ODF</span>
          </div>
          <div className="flex gap-1.5">
            <SimBtn onClick={() => simulate('DT_SCHEDULE')} label="Agenda" />
            <SimBtn onClick={() => simulate('DT_RESULT')} label="Resultado" />
            <SimBtn onClick={() => simulate('DT_MEDALS')} label="Medalhas" />
            <SimBtn onClick={() => simulate('DT_VEN_COND')} label="Clima" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-10"
            >
              {/* Left Content */}
              <div className="col-span-12 lg:col-span-8 space-y-12">
                {/* Live Event Hero */}
                <section className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cob-green to-cob-blue rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200" />
                  <div className="relative bg-white rounded-2xl shadow-premium border border-slate-100 overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-2/3 p-10">
                        <div className="flex items-center gap-3 mb-8">
                          <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-md animate-pulse">Ao Vivo</span>
                          {weatherData && (
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 ml-2">
                              <CloudSun size={14} className="text-cob-yellow" />
                              {weatherData.Temperature.Value}°{weatherData.Temperature.Unit} • {weatherData.Condition.Value}
                            </span>
                          )}
                        </div>

                        {latestBrasilResult ? (
                          <div className="space-y-10">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-cob-green text-white text-[8px] font-black rounded uppercase tracking-widest">Destaque Time Brasil</span>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{latestBrasilResult.sport}</span>
                              </div>
                              <h2 className="text-4xl font-black text-slate-900 mb-3 font-display tracking-tight leading-tight">
                                {latestBrasilResult.itemName}
                              </h2>
                              <div className="flex items-center gap-4 text-sm font-semibold text-slate-400">
                                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-cob-blue" /> {latestBrasilResult.venue}</span>
                                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                                <span>Resultado Final</span>
                              </div>
                            </div>

                            <div className="space-y-4">
                              {latestBrasilResult.results.map((res: any, i: number) => (
                                <div 
                                  key={i} 
                                  className="flex justify-between items-center p-5 rounded-2xl border bg-cob-yellow/5 border-cob-yellow/30 ring-1 ring-cob-yellow/20 transition-all duration-300"
                                >
                                  <div className="flex items-center gap-6">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${res.Rank === '1' ? 'bg-cob-yellow text-cob-dark' : 'bg-slate-100 text-slate-400'}`}>
                                      {res.Rank}
                                    </div>
                                    <div>
                                      <p className="font-extrabold text-slate-900 uppercase tracking-tight text-base">
                                        {res.Competitor?.Description?.FamilyName} <span className="font-medium text-slate-400">{res.Competitor?.Description?.GivenName}</span>
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold text-slate-400 tracking-widest">{res.ResultValue || 'Finalizado'}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 px-4 py-1.5 bg-cob-green rounded-full shadow-lg shadow-cob-green/20">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                    <span className="text-white text-[10px] font-black tracking-widest uppercase">Time Brasil</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="py-24 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Activity size={32} className="text-slate-200 animate-pulse" />
                            </div>
                            <p className="text-lg font-medium text-slate-400 italic">Sincronizando com o feed oficial do ODF...</p>
                          </div>
                        )}
                      </div>
                      <div className="md:w-1/3 bg-slate-50/50 border-l border-slate-100 p-10 flex flex-col justify-center items-center text-center">
                        <div className="w-24 h-24 cob-gradient-blue rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-cob-blue/30 rotate-3">
                          <Trophy size={48} className="text-cob-yellow" />
                        </div>
                        <h3 className="text-xl font-black text-cob-blue mb-2 font-display">TIME BRASIL</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Acompanhe cada conquista em tempo real</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Schedule Grid */}
                <section>
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 font-display tracking-tight">Agenda Olímpica</h3>
                      <p className="text-sm font-semibold text-slate-400 mt-1">Próximas disputas e horários oficiais</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('schedule')}
                      className="text-xs font-bold text-cob-blue hover:underline tracking-widest uppercase"
                    >
                      Ver Agenda Completa
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {scheduleList.slice(0, 4).map((unit: any, i: number) => (
                      <div key={i} className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-premium transition-all duration-300 hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-5">
                          <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:bg-cob-blue/10 group-hover:text-cob-blue transition-colors">
                            {unit.ScheduleStatus}
                          </div>
                          <div className="flex items-center gap-2 text-cob-blue font-black text-base">
                            <Clock size={16} />
                            <span>{new Date(unit.StartDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        <h4 className="font-black text-slate-900 uppercase text-sm mb-2 leading-tight tracking-tight group-hover:text-cob-blue transition-colors">{unit.ItemName?.Value}</h4>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          <MapPin size={12} />
                          <span>{unit.VenueDescription?.VenueName}</span>
                        </div>
                      </div>
                    ))}
                    {scheduleList.length === 0 && (
                      <div className="col-span-2 py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                        <Calendar size={40} className="mx-auto mb-4 text-slate-200" />
                        <p className="text-slate-400 font-medium italic">Nenhum evento agendado para o momento</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Content: Medals */}
              <div className="col-span-12 lg:col-span-4 space-y-10">
                <section className="bg-white rounded-3xl shadow-premium border border-slate-100 overflow-hidden">
                  <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h3 className="text-xl font-black text-slate-900 font-display flex items-center gap-3">
                      <div className="p-2 bg-cob-yellow/20 rounded-lg">
                        <Trophy size={22} className="text-cob-yellow" />
                      </div>
                      Quadro de Medalhas
                    </h3>
                  </div>
                  <div className="p-8 space-y-8">
                    {medalList.slice(0, 5).map((line: any, i: number) => (
                      <div key={i} className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-black text-slate-200 w-6">{line.Rank}</span>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{line.Organisation}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ranking Oficial</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black text-cob-blue font-display leading-none">{line.MedalNumber.Total}</span>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Total</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <MedalBox color="bg-cob-yellow" val={line.MedalNumber.Gold} label="Ouro" />
                          <MedalBox color="bg-slate-200" val={line.MedalNumber.Silver} label="Prata" />
                          <MedalBox color="bg-amber-700" val={line.MedalNumber.Bronze} label="Bronze" />
                        </div>
                      </div>
                    ))}
                    {medalList.length === 0 && (
                      <div className="py-16 text-center">
                        <Medal size={48} className="mx-auto mb-4 text-slate-100" />
                        <p className="text-slate-400 font-medium italic text-sm">Dados de medalhas indisponíveis</p>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => setActiveTab('medals')}
                      className="w-full py-4 mt-4 bg-cob-blue text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-cob-blue/20 hover:shadow-xl hover:shadow-cob-blue/30 transition-all active:scale-[0.98]"
                    >
                      Ver Classificação Completa
                    </button>
                  </div>
                </section>

                {/* Institutional Card */}
                <div className="relative group cursor-pointer overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 cob-gradient-green transition-transform duration-700 group-hover:scale-110" />
                  <div className="relative p-10 text-white z-10">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
                      <Activity size={24} />
                    </div>
                    <h4 className="text-3xl font-black italic tracking-tighter mb-4 font-display">TIME BRASIL</h4>
                    <p className="text-sm font-medium text-white/80 leading-relaxed mb-8">Acompanhe nossos heróis em cada braçada, salto e conquista. O Brasil unido pelo esporte.</p>
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                      Saiba Mais <ChevronRight size={16} />
                    </div>
                  </div>
                  <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                    <Trophy size={200} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div 
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight">Agenda Olímpica</h2>
                  <p className="text-slate-400 font-semibold mt-2">Próximas disputas e horários oficiais sincronizados</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Eventos Hoje</span>
                    <span className="text-xs font-bold text-cob-blue">{scheduleList.length}</span>
                  </div>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex flex-col md:flex-row gap-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Buscar por esporte, prova ou local..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cob-blue/20 transition-all"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowOnlyBrasil(!showOnlyBrasil)}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${showOnlyBrasil ? 'bg-cob-green text-white shadow-lg shadow-cob-green/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    Time Brasil
                  </button>
                  <button 
                    onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${showOnlyFavorites ? 'bg-cob-yellow text-cob-dark shadow-lg shadow-cob-yellow/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    Favoritos
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSchedule.map((unit: any, i: number) => (
                  <div key={i} className="group bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-premium transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cob-blue/5 rounded-full -mr-16 -mt-16 group-hover:bg-cob-blue/10 transition-colors" />
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-8">
                        <div className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:bg-cob-blue/10 group-hover:text-cob-blue transition-colors">
                          {unit.ScheduleStatus}
                        </div>
                        <button 
                          onClick={() => toggleFavorite(unit.Code || unit.UnitCode)}
                          className={`p-2 rounded-xl transition-all ${favorites.includes(unit.Code || unit.UnitCode) ? 'text-cob-yellow bg-cob-yellow/10' : 'text-slate-200 hover:text-cob-yellow hover:bg-slate-50'}`}
                        >
                          <Trophy size={18} fill={favorites.includes(unit.Code || unit.UnitCode) ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-cob-blue/5 rounded-2xl text-cob-blue">
                          <Clock size={20} />
                        </div>
                        <div>
                          <p className="text-2xl font-black text-slate-900 font-display leading-none">
                            {new Date(unit.StartDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Horário Local</p>
                        </div>
                      </div>

                      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-4 leading-tight group-hover:text-cob-blue transition-colors">
                        {unit.ItemName?.Value}
                      </h4>

                      <div className="space-y-3 pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <MapPin size={14} className="text-cob-blue" />
                          <span>{unit.VenueDescription?.VenueName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <Activity size={14} className="text-cob-green" />
                          <span>{unit.Sport || 'Modalidade'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredSchedule.length === 0 && (
                  <div className="col-span-full py-40 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 shadow-sm">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                      <Calendar size={48} className="text-slate-200" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 font-display mb-3">Nenhum evento encontrado</h3>
                    <p className="text-slate-400 font-medium text-lg max-w-md mx-auto leading-relaxed">
                      {scheduleList.length === 0 
                        ? "Aguardando o recebimento da agenda oficial via feed ODF."
                        : "Tente ajustar seus filtros para encontrar o que procura."}
                    </p>
                    {scheduleList.length === 0 && (
                      <button 
                        onClick={() => simulate('DT_SCHEDULE')}
                        className="mt-10 px-8 py-3 bg-cob-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-cob-blue/20 transition-all active:scale-95"
                      >
                        Simular Agenda Agora
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'internal' && (
            <motion.div 
              key="internal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 cob-gradient-blue rounded-2xl flex items-center justify-center text-white shadow-xl shadow-cob-blue/20">
                      <Megaphone size={24} />
                    </div>
                    <div>
                      <h1 className="text-4xl font-black text-slate-900 font-display tracking-tight">Comunicação Interna</h1>
                      <p className="text-slate-500 font-semibold uppercase text-[10px] tracking-[0.2em] mt-1">Delegados, Atletas e Equipe Técnica</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-cob-yellow/10 rounded-xl border border-cob-yellow/20 flex items-center gap-3">
                    <Bell size={18} className="text-cob-yellow animate-bounce" />
                    <span className="text-[10px] font-black text-cob-dark uppercase tracking-widest">3 Novos Comunicados</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Official Announcements */}
                <div className="lg:col-span-8 space-y-8">
                  <section className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="text-2xl font-black text-slate-900 font-display italic flex items-center gap-3">
                        <FileText size={24} className="text-cob-blue" />
                        Comunicados Oficiais
                      </h3>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Últimas 24 horas</span>
                    </div>

                    <div className="space-y-6">
                      {[
                        {
                          id: 1,
                          type: 'URGENTE',
                          title: 'Alteração no Horário do Transporte - Vila Olímpica',
                          content: 'Devido a obras na via principal, os ônibus para o Centro de Treinamento sairão 15 minutos antes do horário previsto a partir de amanhã.',
                          time: 'Há 10 min',
                          icon: <ShieldAlert className="text-red-500" size={20} />,
                          color: 'bg-red-50 border-red-100'
                        },
                        {
                          id: 2,
                          type: 'INFORMAÇÃO',
                          title: 'Reunião Técnica: Natação e Atletismo',
                          content: 'Briefing obrigatório para chefes de equipe no Auditório B às 19:00. Pauta: Procedimentos de antidoping e logística de premiação.',
                          time: 'Há 2 horas',
                          icon: <Info className="text-cob-blue" size={20} />,
                          color: 'bg-cob-blue/5 border-cob-blue/10'
                        },
                        {
                          id: 3,
                          type: 'RESULTADO',
                          title: 'Consolidação de Resultados - Manhã',
                          content: 'Os resultados oficiais da sessão matutina já estão disponíveis para conferência no sistema ODF e no mural da delegação.',
                          time: 'Há 4 horas',
                          icon: <Trophy className="text-cob-green" size={20} />,
                          color: 'bg-cob-green/5 border-cob-green/10'
                        }
                      ].map((announcement) => (
                        <div key={announcement.id} className={`p-8 rounded-3xl border ${announcement.color} transition-all hover:shadow-md group cursor-pointer`}>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-xl shadow-sm">
                                {announcement.icon}
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{announcement.type}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{announcement.time}</span>
                          </div>
                          <h4 className="text-xl font-black text-slate-900 mb-3 group-hover:text-cob-blue transition-colors">{announcement.title}</h4>
                          <p className="text-slate-600 text-sm leading-relaxed font-medium">{announcement.content}</p>
                        </div>
                      ))}
                    </div>

                    <button className="w-full py-5 mt-10 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all">
                      Ver Histórico de Comunicados
                    </button>
                  </section>

                  {/* Delegation Schedule Widget */}
                  <section className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-slate-900 font-display italic flex items-center gap-3">
                        <Calendar size={24} className="text-cob-green" />
                        Próximos Eventos da Delegação
                      </h3>
                      <button 
                        onClick={() => setActiveTab('schedule')}
                        className="text-[10px] font-black text-cob-blue uppercase tracking-widest hover:underline"
                      >
                        Ver Tudo
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {scheduleList.filter((u: any) => (Array.isArray(u.Competitor) ? u.Competitor : (u.Competitor ? [u.Competitor] : [])).some((c: any) => c.Organisation === 'BRA')).slice(0, 4).map((unit: any, i: number) => (
                        <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center shadow-sm border border-slate-100">
                              <span className="text-xs font-black text-cob-blue leading-none">
                                {new Date(unit.StartDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-900 uppercase tracking-tight line-clamp-1">{unit.ItemName?.Value}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{unit.VenueDescription?.VenueName}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-200 group-hover:text-cob-blue transition-colors" />
                        </div>
                      ))}
                      {scheduleList.filter((u: any) => (Array.isArray(u.Competitor) ? u.Competitor : (u.Competitor ? [u.Competitor] : [])).some((c: any) => c.Organisation === 'BRA')).length === 0 && (
                        <div className="col-span-2 py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Nenhum evento do Brasil agendado</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Delegation Results Widget */}
                  <section className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-slate-900 font-display italic flex items-center gap-3">
                        <Trophy size={24} className="text-cob-yellow" />
                        Últimos Resultados da Delegação
                      </h3>
                      <button 
                        onClick={() => setActiveTab('results')}
                        className="text-[10px] font-black text-cob-blue uppercase tracking-widest hover:underline"
                      >
                        Ver Tudo
                      </button>
                    </div>
                    <div className="space-y-4">
                      {allResults.slice(0, 3).map((item, i) => (
                        <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 text-cob-blue">
                              <Medal size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-900 uppercase tracking-tight line-clamp-1">{item.itemName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-black text-cob-green uppercase tracking-widest">{item.sport}</span>
                                <span className="text-[9px] font-bold text-slate-300">•</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                  {item.results[0].Rank}º Lugar
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-200 group-hover:text-cob-blue transition-colors" />
                        </div>
                      ))}
                      {allResults.length === 0 && (
                        <div className="py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Nenhum resultado registrado</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* Technical Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                  {/* Quick Access */}
                  <section className="bg-cob-dark rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                    <h3 className="text-lg font-black font-display italic mb-8 relative z-10">Acesso Rápido</h3>
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                      {[
                        { label: 'Transporte', icon: <MapPin size={20} /> },
                        { label: 'Refeitório', icon: <Clock size={20} /> },
                        { label: 'Médico', icon: <Activity size={20} /> },
                        { label: 'Contatos', icon: <Users size={20} /> }
                      ].map((item, i) => (
                        <button key={i} className="p-6 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10 transition-all flex flex-col items-center gap-3 group">
                          <div className="text-cob-yellow group-hover:scale-110 transition-transform">{item.icon}</div>
                          <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Delegation Summary */}
                  <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 font-display italic mb-6">Resumo da Delegação</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-cob-blue/10 rounded-xl flex items-center justify-center text-cob-blue">
                            <Users size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Staff</p>
                            <p className="text-lg font-black text-slate-900">142</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-cob-green/10 rounded-xl flex items-center justify-center text-cob-green">
                            <Trophy size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atletas na Vila</p>
                            <p className="text-lg font-black text-slate-900">86</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300" />
                      </div>
                    </div>
                  </section>

                  {/* Weather Alert */}
                  {weatherData && (
                    <section className="bg-gradient-to-br from-cob-blue to-cob-dark rounded-[2.5rem] p-8 text-white shadow-xl">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                          <CloudSun size={24} className="text-cob-yellow" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-widest">Condições Locais</h4>
                          <p className="text-xs text-white/60">Sincronizado via ODF</p>
                        </div>
                      </div>
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-5xl font-black font-display">{weatherData.Temperature.Value}°</span>
                        <span className="text-xl font-bold text-white/60 mb-1">{weatherData.Temperature.Unit}</span>
                      </div>
                      <p className="text-sm font-medium text-white/80 italic">"{weatherData.Condition.Value}. Recomendado hidratação constante para atletas ao ar livre."</p>
                    </section>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'social' && (
          <motion.div 
            key="social"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 cob-gradient-green rounded-2xl flex items-center justify-center text-white shadow-xl shadow-cob-green/20">
                    <Share2 size={24} />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 font-display tracking-tight">Social Media Toolkit</h1>
                    <p className="text-slate-500 font-semibold uppercase text-[10px] tracking-[0.2em] mt-1">Gerador de Conteúdo para Redes Sociais</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Medal Alert Generator */}
              <div className="lg:col-span-2 space-y-8">
                <section className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-sm overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cob-yellow/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                  <div className="relative">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-900 font-display italic">Alerta de Medalha</h3>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              const latestMedalResult = allResults.find(r => r.results.some((res: any) => parseInt(res.Rank) <= 3));
                              if (!latestMedalResult) return;
                              const brasilAthlete = latestMedalResult.results.find((res: any) => parseInt(res.Rank) <= 3);
                              const medalType = brasilAthlete.Rank === '1' ? 'OURO' : brasilAthlete.Rank === '2' ? 'PRATA' : 'BRONZE';
                              const emoji = brasilAthlete.Rank === '1' ? '🥇' : brasilAthlete.Rank === '2' ? '🥈' : '🥉';
                              const text = `${emoji} MEDALHA PARA O BRASIL!\n\n${brasilAthlete.Competitor?.Description?.FamilyName} conquista a medalha de ${medalType} no ${latestMedalResult.sport}!\n\n#TimeBrasil #JogosOlimpicos #COB`;
                              const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                              window.open(url, '_blank');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                          >
                            <Activity size={14} /> Postar no X
                          </button>
                          <button 
                            onClick={() => {
                              const latestMedalResult = allResults.find(r => r.results.some((res: any) => parseInt(res.Rank) <= 3));
                              if (!latestMedalResult) return;
                              const brasilAthlete = latestMedalResult.results.find((res: any) => parseInt(res.Rank) <= 3);
                              const medalType = brasilAthlete.Rank === '1' ? 'OURO' : brasilAthlete.Rank === '2' ? 'PRATA' : 'BRONZE';
                              const emoji = brasilAthlete.Rank === '1' ? '🥇' : brasilAthlete.Rank === '2' ? '🥈' : '🥉';
                              const text = `${emoji} MEDALHA PARA O BRASIL!\n\n${brasilAthlete.Competitor?.Description?.FamilyName} conquista a medalha de ${medalType} no ${latestMedalResult.sport}!\n\n#TimeBrasil #JogosOlimpicos #COB`;
                              navigator.clipboard.writeText(text);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-cob-blue text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-cob-blue/90 transition-all"
                          >
                            <Copy size={14} /> Copiar
                          </button>
                        </div>
                      </div>

                    {allResults.find(r => r.results.some((res: any) => parseInt(res.Rank) <= 3)) ? (
                      (() => {
                        const latestMedalResult = allResults.find(r => r.results.some((res: any) => parseInt(res.Rank) <= 3));
                        const brasilAthlete = latestMedalResult.results.find((res: any) => parseInt(res.Rank) <= 3);
                        const medalType = brasilAthlete.Rank === '1' ? 'OURO' : brasilAthlete.Rank === '2' ? 'PRATA' : 'BRONZE';
                        const emoji = brasilAthlete.Rank === '1' ? '🥇' : brasilAthlete.Rank === '2' ? '🥈' : '🥉';
                        
                        return (
                          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-10 h-10 bg-cob-green rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-cob-green font-black text-xs italic">B</div>
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-cob-yellow">Time Brasil Oficial</p>
                                <p className="text-[8px] text-slate-400">@timebrasil • Agora</p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <p className="text-xl font-bold leading-relaxed">
                                {emoji} MEDALHA PARA O BRASIL! <br />
                                <span className="text-cob-yellow">{brasilAthlete.Competitor?.Description?.FamilyName}</span> acaba de conquistar a medalha de {medalType} no {latestMedalResult.sport}!
                              </p>
                              <div className="aspect-video bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
                                <div className="text-center">
                                  <Medal size={48} className="mx-auto mb-4 text-cob-yellow animate-bounce" />
                                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 italic">Preview da Imagem</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6 text-slate-400">
                                <div className="flex items-center gap-2"><Share2 size={16} /> <span className="text-[10px] font-bold">2.4k</span></div>
                                <div className="flex items-center gap-2"><Trophy size={16} /> <span className="text-[10px] font-bold">12.1k</span></div>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhuma medalha brasileira registrada ainda</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Daily Summary Generator */}
                <section className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-900 font-display italic">Resumo do Dia</h3>
                    <button 
                      onClick={() => {
                        const summary = `Resumo do Time Brasil hoje:\n✅ ${allResults.length} resultados oficiais\n🏅 ${medalList.find(m => m.Organisation === 'BRA')?.Total || 0} medalhas totais\n\nConfira todos os detalhes no nosso dashboard! #TimeBrasil`;
                        navigator.clipboard.writeText(summary);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      <Copy size={14} /> Copiar Texto
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <pre className="whitespace-pre-wrap font-mono text-sm text-slate-600 leading-relaxed">
                        {`Resumo do Time Brasil hoje:
✅ ${allResults.length} resultados oficiais
🏅 ${medalList.find(m => m.Organisation === 'BRA')?.Total || 0} medalhas totais

Principais destaques:
${allResults.slice(0, 3).map(r => `• ${r.itemName}: ${r.results[0].Rank}º lugar`).join('\n')}

Confira todos os detalhes no nosso dashboard! #TimeBrasil`}
                      </pre>
                    </div>
                  </div>
                </section>
              </div>

              {/* Quick Stats & Assets */}
              <div className="space-y-8">
                <section className="bg-cob-blue rounded-[2.5rem] p-8 text-white shadow-xl shadow-cob-blue/20">
                  <h3 className="text-lg font-black font-display italic mb-6">Status Atual</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Posição no Quadro</span>
                      <span className="text-2xl font-black italic">{medalList.findIndex(m => m.Organisation === 'BRA') + 1}º</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Total de Medalhas</span>
                      <span className="text-2xl font-black italic">{medalList.find(m => m.Organisation === 'BRA')?.Total || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Atletas em Ação</span>
                      <span className="text-2xl font-black italic">{filteredSchedule.length}</span>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 font-display italic mb-6">Destaque do Atleta</h3>
                  {allResults.length > 0 ? (
                    <div className="space-y-4">
                      <div className="w-full aspect-square bg-slate-100 rounded-3xl overflow-hidden relative group">
                        <img 
                          src={`https://picsum.photos/seed/${allResults[0].results[0].Competitor?.Description?.FamilyName}/400/400`} 
                          alt="Atleta"
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                          <p className="text-cob-yellow font-black text-[10px] uppercase tracking-widest mb-1">{allResults[0].sport}</p>
                          <p className="text-white font-black text-xl uppercase italic leading-none">
                            {allResults[0].results[0].Competitor?.Description?.FamilyName}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const text = `Destaque do dia: ${allResults[0].results[0].Competitor?.Description?.FamilyName} brilha no ${allResults[0].sport}! 🇧🇷✨ #TimeBrasil`;
                          navigator.clipboard.writeText(text);
                        }}
                        className="w-full py-4 bg-cob-green text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cob-green/90 transition-all shadow-lg shadow-cob-green/20"
                      >
                        Gerar Story
                      </button>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs font-bold text-center py-10">Aguardando resultados...</p>
                  )}
                </section>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'performance' && (
          <motion.div 
            key="performance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight">Análise de Desempenho</h2>
                <p className="text-slate-400 font-semibold mt-2">Métricas detalhadas, estatísticas e play-by-play dos atletas</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <TrendingUp size={18} className="text-cob-green" />
                  <span className="text-xs font-bold text-slate-600">Dados ODF em Tempo Real</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
              {/* Athlete Selector Sidebar */}
              <div className="col-span-12 lg:col-span-3 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Selecionar Atleta</h3>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                    {allResults.map((item, i) => (
                      <button 
                        key={i}
                        onClick={() => setSelectedAthlete(item)}
                        className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center gap-3 group ${selectedAthlete?.unitCode === item.unitCode ? 'bg-cob-blue border-cob-blue text-white shadow-lg shadow-cob-blue/20' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-cob-blue/30'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${selectedAthlete?.unitCode === item.unitCode ? 'bg-white/20' : 'bg-white shadow-sm border border-slate-100 text-cob-blue'}`}>
                          {item.results[0].Competitor?.Description?.FamilyName?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black uppercase truncate">{item.results[0].Competitor?.Description?.FamilyName}</p>
                          <p className={`text-[9px] font-bold uppercase tracking-widest truncate ${selectedAthlete?.unitCode === item.unitCode ? 'text-white/60' : 'text-slate-400'}`}>{item.sport}</p>
                        </div>
                        <ChevronRight size={14} className={selectedAthlete?.unitCode === item.unitCode ? 'text-white' : 'text-slate-200 group-hover:text-cob-blue'} />
                      </button>
                    ))}
                    {allResults.length === 0 && (
                      <div className="py-10 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nenhum dado disponível</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedAthlete && (
                  <div className="bg-cob-dark rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                    <div className="relative z-10">
                      <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6">Resumo Técnico</h4>
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Posição Média</span>
                          <span className="text-xl font-black italic">{(perfData?.trend.reduce((acc: number, curr: any) => acc + curr.rank, 0) / (perfData?.trend.length || 1)).toFixed(1)}º</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Consistência</span>
                          <span className="text-xl font-black italic text-cob-green">{perfData?.attributes[1].A}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Evolução</span>
                          <span className="text-xl font-black italic text-cob-yellow">+{Math.floor(Math.random() * 10 + 5)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Performance Content */}
              <div className="col-span-12 lg:col-span-9 space-y-8">
                {selectedAthlete ? (
                  <>
                    {/* Athlete Profile Header */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-10 items-center">
                      <div className="w-40 h-40 rounded-[2.5rem] bg-slate-100 overflow-hidden border-4 border-white shadow-2xl relative group">
                        <img 
                          src={`https://picsum.photos/seed/${selectedAthlete.results[0].Competitor?.Description?.FamilyName}/400/400`} 
                          alt="Atleta"
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-cob-blue/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                          <span className="px-4 py-1.5 bg-cob-blue text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-cob-blue/20">
                            {selectedAthlete.sport}
                          </span>
                          <span className="px-4 py-1.5 bg-cob-green text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-cob-green/20">
                            Time Brasil
                          </span>
                          <span className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                            ID: {selectedAthlete.results[0].Competitor?.Code}
                          </span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 font-display uppercase italic tracking-tighter mb-2">
                          {selectedAthlete.results[0].Competitor?.Description?.FamilyName} 
                          <span className="text-cob-blue font-light not-italic ml-2">{selectedAthlete.results[0].Competitor?.Description?.GivenName}</span>
                        </h1>
                        <p className="text-lg font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                          <MapPin size={18} className="text-cob-blue" />
                          {selectedAthlete.venue}
                        </p>
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                          <div className="w-24 h-24 bg-slate-50 rounded-3xl flex flex-col items-center justify-center border border-slate-100 shadow-sm">
                            <span className="text-3xl font-black text-cob-blue leading-none">{selectedAthlete.results[0].Rank}º</span>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">Rank Atual</span>
                          </div>
                          <div className="w-24 h-24 bg-cob-yellow/10 rounded-3xl flex flex-col items-center justify-center border border-cob-yellow/20 shadow-sm">
                            <Trophy size={28} className="text-cob-yellow mb-1" />
                            <span className="text-[8px] font-black text-cob-dark uppercase tracking-widest">Elite</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            const text = `Análise de Desempenho: ${selectedAthlete.results[0].Competitor?.Description?.FamilyName} termina em ${selectedAthlete.results[0].Rank}º no ${selectedAthlete.sport}! 🇧🇷📊 #TimeBrasil #Performance`;
                            navigator.clipboard.writeText(text);
                            alert("Texto de compartilhamento copiado para a área de transferência!");
                          }}
                          className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                          <Share2 size={14} /> Compartilhar Análise
                        </button>
                      </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Attribute Radar Chart */}
                      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 font-display italic mb-8 flex items-center gap-3">
                          <Target size={20} className="text-cob-blue" />
                          Perfil de Atributos
                        </h3>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={perfData?.attributes}>
                              <PolarGrid stroke="#E2E8F0" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar
                                name="Atleta"
                                dataKey="A"
                                stroke="#0055A4"
                                fill="#0055A4"
                                fillOpacity={0.5}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Performance Trend Line Chart */}
                      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 font-display italic mb-8 flex items-center gap-3">
                          <TrendingUp size={20} className="text-cob-green" />
                          Tendência de Performance
                        </h3>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={perfData?.trend}>
                              <defs>
                                <linearGradient id="colorRank" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#009639" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#009639" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                              <YAxis reversed domain={[1, 10]} axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                                itemStyle={{ color: '#00FF00' }}
                              />
                              <Area type="monotone" dataKey="rank" stroke="#009639" strokeWidth={4} fillOpacity={1} fill="url(#colorRank)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest mt-4">Evolução de Ranking por Etapa</p>
                      </div>
                    </div>

                    {/* Detailed Stats and Play-by-Play */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Stats Column */}
                      <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm">
                          <h3 className="text-sm font-black text-slate-900 font-display italic mb-6 flex items-center gap-2">
                            <BarChart2 size={18} className="text-cob-blue" />
                            Métricas de Jogo
                          </h3>
                          <div className="space-y-6">
                            {perfData?.stats.map((stat, i) => (
                              <div key={i} className="space-y-2">
                                <div className="flex justify-between items-end">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                                  <span className="text-xs font-black text-slate-900">{stat.val}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: stat.val }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    className={`h-full ${stat.color} rounded-full`}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm">
                          <h3 className="text-sm font-black text-slate-900 font-display italic mb-6 flex items-center gap-2">
                            <Target size={18} className="text-cob-yellow" />
                            Comparativo com Recorde
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recorde Olímpico</span>
                              <span className="text-xs font-black text-slate-900">{selectedAthlete.results[0].ResultValue ? (parseFloat(selectedAthlete.results[0].ResultValue) * 0.98).toFixed(2) : '---'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Diferença</span>
                              <span className="text-xs font-black text-red-500">+{selectedAthlete.results[0].ResultValue ? (parseFloat(selectedAthlete.results[0].ResultValue) * 0.02).toFixed(2) : '---'}</span>
                            </div>
                            <div className="pt-4 border-t border-slate-50">
                              <div className="flex justify-between mb-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aproximação</span>
                                <span className="text-[9px] font-black text-cob-blue uppercase tracking-widest">98.2%</span>
                              </div>
                              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-cob-blue w-[98.2%] rounded-full" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-cob-blue rounded-[2.5rem] p-8 text-white shadow-xl">
                          <h3 className="text-sm font-black font-display italic mb-6 flex items-center gap-2">
                            <Zap size={18} className="text-cob-yellow" />
                            Insight Técnico
                          </h3>
                          <div className="min-h-[60px]">
                            {isGeneratingInsight ? (
                              <div className="flex items-center gap-2 text-white/40">
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Processando dados...</span>
                              </div>
                            ) : (
                              <p className="text-xs font-medium leading-relaxed text-white/80 italic">
                                "{technicalInsight || "Aguardando análise detalhada..."}"
                              </p>
                            )}
                          </div>
                          <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                              <Award size={16} className="text-cob-yellow" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Análise de IA COB</span>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Column */}
                      <div className="lg:col-span-2">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-sm h-full">
                          <h3 className="text-lg font-black text-slate-900 font-display italic mb-8 flex items-center gap-3">
                            <History size={20} className="text-cob-blue" />
                            Play-by-Play Timeline
                          </h3>
                          <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                            {perfData?.timeline.map((item, i) => (
                              <div key={i} className="relative pl-12 group">
                                <div className={`absolute left-0 top-1 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border transition-all group-hover:scale-110 ${item.type === 'score' ? 'bg-cob-yellow border-cob-yellow/30 text-cob-dark' : item.type === 'warning' ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white border-slate-100 text-cob-blue'}`}>
                                  {item.type === 'start' ? <Clock size={16} /> : item.type === 'score' ? <Trophy size={16} /> : item.type === 'warning' ? <ShieldAlert size={16} /> : <Activity size={16} />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-3 mb-1">
                                    <span className="text-[10px] font-black text-cob-blue uppercase tracking-widest">{item.time}</span>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.event}</h4>
                                  </div>
                                  <p className="text-xs font-medium text-slate-400 leading-relaxed">{item.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100 shadow-sm flex flex-col items-center justify-center h-[800px]">
                    <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-10 relative">
                      <div className="absolute inset-0 bg-cob-blue/5 rounded-full animate-ping" />
                      <BarChart2 size={64} className="text-slate-200 relative z-10" />
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 font-display mb-4">Selecione um Atleta</h3>
                    <p className="text-slate-400 font-medium text-xl max-w-md mx-auto leading-relaxed">
                      Escolha um atleta na lista ao lado para visualizar a análise detalhada de desempenho e estatísticas em tempo real.
                    </p>
                    <div className="mt-12 grid grid-cols-3 gap-6 w-full max-w-lg">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-2 bg-slate-50 rounded-full overflow-hidden">
                          <motion.div 
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                            className="h-full w-1/2 bg-cob-blue/10 rounded-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'logs' && (
            <motion.div 
              key="logs"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-cob-dark rounded-3xl border border-white/5 overflow-hidden shadow-2xl"
            >
              <div className="bg-white/5 p-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cob-yellow/10 rounded-lg">
                    <Terminal size={18} className="text-cob-yellow" />
                  </div>
                  <span className="text-xs font-black text-white uppercase tracking-[0.3em]">ODF Stream Monitor v2.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Conexão Estável</span>
                </div>
              </div>
              <div className="p-8 h-[650px] overflow-y-auto font-mono text-[11px] space-y-6 scrollbar-hide">
                {messages.map((msg, i) => (
                  <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex justify-between mb-4 items-center">
                      <span className="text-white/30 font-bold">[{new Date(msg.timestamp).toLocaleTimeString()}]</span>
                      <span className="px-3 py-1 bg-cob-blue/20 text-cob-blue rounded-full font-black text-[9px] uppercase tracking-widest">
                        {msg.parsed?.OdfBody?.DocumentType}
                      </span>
                    </div>
                    <pre className="text-white/70 whitespace-pre-wrap break-all leading-relaxed">
                      {msg.raw}
                    </pre>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="py-40 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Terminal size={24} className="text-white/10" />
                    </div>
                    <p className="text-white/20 italic font-medium">Aguardando pacotes de dados do feed...</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'medals' && (
            <motion.div 
              key="medals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight">Quadro de Medalhas</h2>
                  <p className="text-slate-400 font-semibold mt-2">Classificação oficial por nações em tempo real</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atualizado em</span>
                    <span className="text-xs font-bold text-cob-blue">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-premium border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-20">Pos</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nação</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center w-24">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-2 h-2 bg-cob-yellow rounded-full" />
                            <span>Ouro</span>
                          </div>
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center w-24">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-2 h-2 bg-slate-300 rounded-full" />
                            <span>Prata</span>
                          </div>
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center w-24">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-2 h-2 bg-amber-700 rounded-full" />
                            <span>Bronze</span>
                          </div>
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center w-24 bg-slate-50/80">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {medalList.map((line: any, i: number) => (
                        <tr 
                          key={i} 
                          className={`group transition-colors hover:bg-slate-50/30 ${line.Organisation === 'BRA' ? 'bg-cob-yellow/5' : ''}`}
                        >
                          <td className="px-8 py-6">
                            <span className={`text-lg font-black ${i < 3 ? 'text-cob-blue' : 'text-slate-300'}`}>
                              {line.Rank}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-7 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 overflow-hidden">
                                {line.Organisation}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 uppercase tracking-tight">{line.Organisation}</p>
                                {line.Organisation === 'BRA' && (
                                  <span className="text-[9px] font-black text-cob-green uppercase tracking-widest">Time Brasil</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center font-bold text-slate-700">{line.MedalNumber.Gold || 0}</td>
                          <td className="px-8 py-6 text-center font-bold text-slate-700">{line.MedalNumber.Silver || 0}</td>
                          <td className="px-8 py-6 text-center font-bold text-slate-700">{line.MedalNumber.Bronze || 0}</td>
                          <td className="px-8 py-6 text-center font-black text-cob-blue bg-slate-50/30 group-hover:bg-slate-100/50 transition-colors">
                            {line.MedalNumber.Total || 0}
                          </td>
                        </tr>
                      ))}
                      {medalList.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-8 py-32 text-center">
                            <Trophy size={48} className="mx-auto mb-4 text-slate-100" />
                            <p className="text-slate-400 font-medium italic">Aguardando dados oficiais do Quadro de Medalhas...</p>
                            <button 
                              onClick={() => simulate('DT_MEDALS')}
                              className="mt-6 px-6 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all"
                            >
                              Simular Dados Agora
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-cob-blue p-8 rounded-3xl text-white shadow-lg shadow-cob-blue/20 relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Líder do Quadro</p>
                    <h4 className="text-3xl font-black font-display uppercase tracking-tight">{medalList[0]?.Organisation || '---'}</h4>
                    <div className="mt-6 flex items-end gap-2">
                      <span className="text-5xl font-black leading-none">{medalList[0]?.MedalNumber.Total || 0}</span>
                      <span className="text-xs font-bold opacity-60 mb-1">Medalhas Totais</span>
                    </div>
                  </div>
                  <Trophy size={120} className="absolute -right-8 -bottom-8 opacity-10" />
                </div>

                <div className="bg-cob-green p-8 rounded-3xl text-white shadow-lg shadow-cob-green/20 relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Desempenho Brasil</p>
                    <h4 className="text-3xl font-black font-display uppercase tracking-tight">Time Brasil</h4>
                    <div className="mt-6 flex items-end gap-2">
                      <span className="text-5xl font-black leading-none">
                        {medalList.find(l => l.Organisation === 'BRA')?.MedalNumber.Total || 0}
                      </span>
                      <span className="text-xs font-bold opacity-60 mb-1">Medalhas Totais</span>
                    </div>
                  </div>
                  <Medal size={120} className="absolute -right-8 -bottom-8 opacity-10" />
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-premium flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distribuição de Ouro</span>
                    <span className="text-xs font-bold text-cob-blue">Top 10 Nações</span>
                  </div>
                  <div className="flex items-end gap-1 h-16">
                    {medalList.slice(0, 10).map((l, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-cob-yellow rounded-t-sm transition-all hover:opacity-80 cursor-help"
                        style={{ height: `${(parseInt(l.MedalNumber.Gold) / (parseInt(medalList[0]?.MedalNumber.Gold) || 1)) * 100}%` }}
                        title={`${l.Organisation}: ${l.MedalNumber.Gold} Ouros`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-2xl">
                  <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight">Resultados Time Brasil</h2>
                  <p className="text-slate-400 font-semibold mt-2 leading-relaxed">Acompanhe o desempenho detalhado de todos os nossos atletas em todas as modalidades.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <Medal size={18} className="text-cob-yellow" />
                    <span className="text-xs font-bold text-slate-600">{filteredResults.length} Provas Filtradas</span>
                  </div>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex flex-col md:flex-row gap-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Buscar por atleta ou prova..."
                    value={resultsSearchTerm}
                    onChange={(e) => setResultsSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cob-blue/20 transition-all"
                  />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                  <button 
                    onClick={() => setResultsSportFilter('ALL')}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${resultsSportFilter === 'ALL' ? 'bg-cob-blue text-white shadow-lg shadow-cob-blue/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    Todos
                  </button>
                  {uniqueSports.map(sport => (
                    <button 
                      key={sport}
                      onClick={() => setResultsSportFilter(sport)}
                      className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${resultsSportFilter === sport ? 'bg-cob-blue text-white shadow-lg shadow-cob-blue/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {filteredResults.map((item, i) => (
                  <div key={i} className="bg-white rounded-[32px] border border-slate-100 shadow-premium overflow-hidden group">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-cob-blue/10 text-cob-blue text-[10px] font-black uppercase tracking-widest rounded-lg">{item.sport}</span>
                          <span className="text-xs font-bold text-slate-300">•</span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <MapPin size={14} className="text-cob-blue" />
                            {item.venue}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight font-display group-hover:text-cob-blue transition-colors">
                          {item.itemName}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Data da Prova</p>
                        <p className="text-sm font-bold text-slate-600">{new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    
                    <div className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Time Brasil Highlights */}
                        <div className="space-y-6">
                          <h4 className="text-[10px] font-black text-cob-green uppercase tracking-[0.2em] flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-cob-green rounded-full" />
                            Destaques Time Brasil
                          </h4>
                          <div className="space-y-4">
                            {item.results.map((res: any, idx: number) => {
                              const extended = Array.isArray(res.ExtendedResults?.ExtendedResult) 
                                ? res.ExtendedResults.ExtendedResult 
                                : (res.ExtendedResults?.ExtendedResult ? [res.ExtendedResults.ExtendedResult] : []);
                              const pb = extended.find((e: any) => e.Code === 'PB')?.Value === 'YES';
                              const sb = extended.find((e: any) => e.Code === 'SB')?.Value === 'YES';

                              return (
                                <div key={idx} className="flex items-center justify-between p-6 bg-cob-green/5 rounded-2xl border border-cob-green/20 ring-1 ring-cob-green/10">
                                  <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-lg ${res.Rank === '1' ? 'bg-cob-yellow text-cob-dark' : res.Rank === '2' ? 'bg-slate-200 text-slate-600' : res.Rank === '3' ? 'bg-amber-700 text-white' : 'bg-white text-cob-green border border-cob-green/20'}`}>
                                      {res.Rank}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="text-lg font-black text-slate-900 uppercase tracking-tight">
                                          {res.Competitor?.Description?.FamilyName} <span className="font-medium text-slate-400">{res.Competitor?.Description?.GivenName}</span>
                                        </p>
                                        {pb && <span className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-black rounded uppercase tracking-widest">PB</span>}
                                        {sb && <span className="px-2 py-0.5 bg-cob-blue text-white text-[8px] font-black rounded uppercase tracking-widest">SB</span>}
                                      </div>
                                      <p className="text-xs font-bold text-cob-green uppercase tracking-widest mt-1">Time Brasil • {res.ResultValue || 'Finalizado'}</p>
                                    </div>
                                  </div>
                                  {parseInt(res.Rank) <= 3 && (
                                    <div className="p-3 bg-white rounded-xl shadow-sm">
                                      <Medal size={24} className={res.Rank === '1' ? 'text-cob-yellow' : res.Rank === '2' ? 'text-slate-300' : 'text-amber-700'} />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Full Podium / Top Results */}
                        <div className="space-y-6">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                            Pódio Completo
                          </h4>
                          <div className="space-y-3">
                            {item.allUnitResults.slice(0, 5).map((res: any, idx: number) => (
                              <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${res.Competitor?.Organisation === 'BRA' ? 'bg-cob-yellow/5 border-cob-yellow/30' : 'bg-slate-50/50 border-slate-100'}`}>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm font-black text-slate-300 w-4">{res.Rank}</span>
                                  <div className="w-8 h-5 bg-white rounded border border-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400 uppercase">
                                    {res.Competitor?.Organisation}
                                  </div>
                                  <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                                    {res.Competitor?.Description?.FamilyName}
                                  </span>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{res.ResultValue || ''}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredResults.length === 0 && (
                  <div className="py-40 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 shadow-sm">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                      <Trophy size={48} className="text-slate-200" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 font-display mb-3">Nenhum resultado encontrado</h3>
                    <p className="text-slate-400 font-medium text-lg max-w-md mx-auto leading-relaxed">
                      {allResults.length === 0 
                        ? "Aguardando a finalização das provas e o recebimento dos dados oficiais via feed ODF."
                        : "Tente ajustar seus filtros de busca ou esporte."}
                    </p>
                    {allResults.length > 0 && filteredResults.length === 0 && (
                      <button 
                        onClick={() => { setResultsSearchTerm(''); setResultsSportFilter('ALL'); }}
                        className="mt-6 text-cob-blue font-bold text-xs uppercase tracking-widest hover:underline"
                      >
                        Limpar Filtros
                      </button>
                    )}
                    {allResults.length === 0 && (
                      <button 
                        onClick={() => simulate('DT_RESULT')}
                        className="mt-10 px-8 py-3 bg-cob-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-cob-blue/20 transition-all active:scale-95"
                      >
                        Simular Resultado Agora
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Redundant block removed */}
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-slate-100 py-16 mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 cob-gradient-green rounded-lg flex items-center justify-center text-white font-black italic text-xl shadow-lg shadow-cob-green/20">B</div>
              <div className="h-6 w-px bg-slate-200 mx-1" />
              <span className="font-black text-slate-900 tracking-tighter text-lg font-display">COB | ODF INTELLIGENCE</span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold">© 2026 Comitê Olímpico do Brasil • Todos os direitos reservados</p>
            <div className="flex gap-8 mt-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <a href="#" className="hover:text-cob-blue transition-colors">Privacidade</a>
              <a href="#" className="hover:text-cob-blue transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-cob-blue transition-colors">Suporte Técnico</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SimBtn({ onClick, label }: { onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-white/5 active:scale-95 text-white/60 hover:text-white"
    >
      {label}
    </button>
  );
}

function MedalBox({ color, val, label }: { color: string, val: string, label: string }) {
  return (
    <div className="bg-slate-50/80 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-100/50">
      <div className={`w-3 h-3 ${color} rounded-full mb-2 shadow-sm`} />
      <span className="text-lg font-black text-slate-900 leading-none mb-1">{val || 0}</span>
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
        {label}
      </span>
    </div>
  );
}
