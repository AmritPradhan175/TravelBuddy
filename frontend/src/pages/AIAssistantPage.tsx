import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Sparkles, 
  MapPin, 
  User, 
  RotateCcw, 
  ArrowRight,
  Compass,
  Calendar,
  Wallet,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { destinationsData, type Destination } from '../data/destinations';
import { formatCurrency, ensureArray } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api-client';

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  destinations?: Destination[];
  costEstimate?: string;
  timestamp: string;
  suggestedFollowUps?: string[];
}

/** Formats bold text (**bold**) and bullet points cleanly into JSX */
const FormattedMessageText: React.FC<{ text: string; isUser: boolean }> = ({ text, isUser }) => {
  if (isUser) {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }

  // Split lines to format headers, bullets, and bold spans
  const lines = text.split('\n');

  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        // Render bullet line
        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('* ');
        const content = isBullet ? trimmed.replace(/^[•\-*]\s*/, '') : trimmed;

        // Parse bold segments **text**
        const parts = content.split(/(\*\*.*?\*\*)/g);
        const parsedLine = parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const boldText = part.slice(2, -2);
            return (
              <strong key={partIdx} className="font-semibold text-forest-900">
                {boldText}
              </strong>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1">
              <span className="text-forest-700 font-bold select-none mt-0.5">•</span>
              <div className="flex-1 text-travel-text">{parsedLine}</div>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="text-travel-text">
            {parsedLine}
          </p>
        );
      })}
    </div>
  );
};

export const AIAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: "Hello! I am your **TravelBuddy AI Travel Assistant**.\n\n" +
            "I am grounded directly in verified data across **100 premier Indian destinations**—including real " +
            "INR budget categories, safety ratings, weather windows, packing checklists, transit connections, and local cuisines.\n\n" +
            "How can I help you design your next adventure?",
      destinations: [
        destinationsData[0], // Goa
        destinationsData[1], // Ladakh
        destinationsData[2], // Jaipur
      ],
      suggestedFollowUps: [
        "Plan a 4-day trip to Goa within ₹15,000",
        "What should I pack for Ladakh?",
        "How do I reach Manali from Delhi?",
        "What local food should I try in Jaipur?"
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() || isTyping) return;

    const userText = queryText.trim();
    setInput('');

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await apiClient.post<{ text: string; destinations?: any[]; confidence?: number }>(
        '/assistant/chat',
        { message: userText }
      );

      if (res && res.text) {
        // Derive contextual follow-ups if destination was returned
        let followUps: string[] = [];
        if (res.destinations && res.destinations.length > 0) {
          const primaryDest = res.destinations[0].destination_name;
          followUps = [
            `What should I pack for ${primaryDest}?`,
            `How do I reach ${primaryDest}?`,
            `What is the best time to visit ${primaryDest}?`,
            `What local food must I try in ${primaryDest}?`
          ];
        }

        const assistantMsg: ChatMessage = {
          id: `msg_asst_${Date.now()}`,
          sender: 'assistant',
          text: res.text,
          destinations: res.destinations,
          suggestedFollowUps: followUps,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error('No answer');
      }
    } catch {
      // Fallback response grounded in local destinations dataset
      const q = userText.toLowerCase();
      const matched = destinationsData.find(d => 
        q.includes(d.destination_name.toLowerCase()) || 
        d.destination_name.toLowerCase().includes(q)
      ) || destinationsData[0];

      const assistantMsg: ChatMessage = {
        id: `msg_asst_${Date.now()}`,
        sender: 'assistant',
        text: `Here is the verified dossier for **${matched.destination_name}** (${matched.state}):\n\n` +
              `• **Highlights:** ${ensureArray(matched.primary_attractions).slice(0, 3).join(', ')}\n` +
              `• **Ideal Duration:** ${matched.ideal_days || 4} days\n` +
              `• **Peak Season:** ${matched.peak_tourist_season}\n` +
              `• **Safety Rating:** ${matched.safety_rating}/10 — ${matched.safety_notes}\n` +
              `• **Daily Mid-Range Budget:** ${formatCurrency(matched.mid_range_category?.total_daily_range?.[0] || 2500)} – ${formatCurrency(matched.mid_range_category?.total_daily_range?.[1] || 5000)} per person.`,
        destinations: [matched],
        suggestedFollowUps: [
          `Plan a 4-day trip to ${matched.destination_name}`,
          `What should I pack for ${matched.destination_name}?`,
          `How do I reach ${matched.destination_name}?`
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(input);
  };

  const samplePrompts = [
    "Plan a 4-day trip to Goa within ₹15,000",
    "What should I pack for Ladakh?",
    "How do I reach Manali from Delhi?",
    "What is the best time to visit Munnar?",
    "What food should I try in Jaipur?",
    "Is Spiti safe for solo travelers?"
  ];

  return (
    <div className="py-10 bg-ivory min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-forest-700 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-forest-700" />
              <span>Grounded Tourism Intelligence</span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-forest-900">
              AI Travel Assistant
            </h1>
            <p className="text-xs text-travel-muted mt-1">
              Real-time advice on 100 Indian destinations: day-by-day itineraries, exact INR budgets, packing checklists, transit & weather.
            </p>
          </div>

          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-travel-border bg-white text-travel-muted hover:text-forest-900 text-xs font-medium transition-colors self-start shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Conversation</span>
          </button>
        </div>

        {/* Chat Window */}
        <div className="bg-white rounded-3xl border border-travel-border shadow-elevated overflow-hidden flex flex-col h-[680px]">
          
          {/* Assistant Sub-header */}
          <div className="px-6 py-3.5 bg-forest-900 text-white flex items-center justify-between border-b border-forest-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-forest-800 text-lime-accent flex items-center justify-center text-xs font-bold shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold block">TravelBuddy Travel Planner</span>
                <span className="text-[10px] text-lime-accent font-medium">Online · 100 Verified Destinations · INR Currency</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[10px] px-2.5 py-0.5 rounded-full bg-forest-800 text-lime-accent border border-forest-700 font-medium">
                Grounded Engine Active
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-ivory/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-forest-800 text-lime-accent flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs">
                    TB
                  </div>
                )}

                <div className={`max-w-[88%] sm:max-w-[80%] space-y-3 ${msg.sender === 'user' ? 'items-end' : ''}`}>
                  <div
                    className={`p-4 rounded-2xl shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-forest-800 text-white rounded-tr-xs'
                        : 'bg-white border border-travel-border text-travel-text rounded-tl-xs'
                    }`}
                  >
                    <FormattedMessageText text={msg.text} isUser={msg.sender === 'user'} />

                    {msg.costEstimate && (
                      <div className="mt-3 pt-2.5 border-t border-travel-border text-xs font-semibold text-forest-800">
                        {msg.costEstimate}
                      </div>
                    )}
                  </div>

                  {/* Destination recommendation cards */}
                  {msg.destinations && msg.destinations.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {msg.destinations.map((d) => (
                        <div key={d.id} className="p-3 rounded-xl bg-white border border-travel-border shadow-xs hover:border-forest-700/50 transition-all text-xs flex flex-col justify-between">
                          <div>
                            <img
                              src={d.image_url}
                              alt={d.destination_name}
                              className="w-full h-24 object-cover rounded-lg mb-2"
                              loading="lazy"
                            />
                            <strong className="text-forest-900 block truncate font-serif text-sm">{d.destination_name}</strong>
                            <span className="text-[11px] text-travel-muted block truncate">{d.state} · {ensureArray(d.trip_types)[0] || 'Scenic'}</span>
                          </div>
                          
                          <div className="mt-3 pt-2 border-t border-travel-border flex items-center justify-between gap-2">
                            <Link
                              to={`/destinations/${d.id}`}
                              className="text-[11px] font-semibold text-forest-800 hover:underline flex items-center gap-0.5"
                            >
                              <span>Details</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>

                            <button
                              onClick={() => navigate(`/plan-trip?destination=${encodeURIComponent(d.destination_name)}`)}
                              className="px-2.5 py-1 rounded-full bg-forest-800 hover:bg-forest-900 text-lime-accent text-[10px] font-semibold transition-colors"
                            >
                              Plan Trip
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dynamic Follow-up Suggestions */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] font-semibold text-travel-muted uppercase flex items-center gap-1 mr-1">
                        <HelpCircle className="w-3 h-3" />
                        Suggested:
                      </span>
                      {msg.suggestedFollowUps.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          disabled={isTyping}
                          onClick={() => sendQuery(prompt)}
                          className="px-2.5 py-1 rounded-full bg-white hover:bg-forest-50 border border-travel-border text-[11px] text-forest-800 font-medium transition-colors shadow-2xs hover:border-forest-700/40 text-left"
                        >
                          "{prompt}"
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-travel-muted px-1 block">
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 items-center text-xs text-travel-muted">
                <div className="w-8 h-8 rounded-full bg-forest-800 text-lime-accent flex items-center justify-center text-xs font-bold">
                  TB
                </div>
                <div className="p-3.5 bg-white border border-travel-border rounded-2xl rounded-tl-xs flex items-center gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-forest-700 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-forest-700 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-forest-700 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-travel-muted ml-1 font-medium">Consulting tourism database...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Carousel Pills */}
          <div className="px-4 py-2.5 border-t border-travel-border bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase font-bold text-travel-muted flex-shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-forest-700" />
              Quick Prompts:
            </span>
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isTyping}
                onClick={() => sendQuery(prompt)}
                className="px-3 py-1 rounded-full bg-ivory hover:bg-forest-100 border border-travel-border text-[11px] text-forest-900 font-medium whitespace-nowrap transition-colors shadow-2xs hover:border-forest-700/50 active:scale-95 disabled:opacity-50"
              >
                "{prompt}"
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleFormSubmit} className="p-4 bg-white border-t border-travel-border flex items-center gap-3">
            <input
              type="text"
              placeholder="Ask anything about 100 Indian destinations, budgets, itineraries, packing or transit..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              className="flex-1 py-3 px-4 rounded-full border border-travel-border bg-ivory text-sm text-travel-text focus:outline-none focus:ring-2 focus:ring-forest-700 focus:bg-white transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-3 rounded-full bg-forest-800 text-lime-accent hover:bg-forest-900 disabled:opacity-40 transition-colors shadow-xs active:scale-95"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};

