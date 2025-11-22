import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, Loader2, RefreshCw, MessageCircle, Send, List } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { analyzeFoodImage, refineFoodAnalysis } from '../services/geminiService';
import { FoodItem, MealEntry, MealType, ChatMessage } from '../types';
import { Input } from '../components/ui/Input';

interface ScannerProps {
  onSave: (entry: Omit<MealEntry, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onSave, onCancel }) => {
  const [image, setImage] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [mealType, setMealType] = useState<MealType>('Обед');
  
  // Chat State
  const [activeTab, setActiveTab] = useState<'list' | 'chat'>('list');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, activeTab]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = async () => {
          try {
            const maxWidth = 1024;
            const scale = Math.min(1, maxWidth / img.width);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressed = canvas.toDataURL('image/jpeg', 0.8);
            const rawBase64 = compressed.split(',')[1];
            setImage(compressed);
            setBase64Data(rawBase64);
            runAnalysis(rawBase64);
          } catch (err) {
            console.error('Image processing error', err);
            const base64 = reader.result as string;
            const rawBase64 = base64.split(',')[1];
            setImage(base64);
            setBase64Data(rawBase64);
            runAnalysis(rawBase64);
          } finally {
            setIsProcessingImage(false);
          }
        };
        img.onerror = () => {
          const base64 = reader.result as string;
          const rawBase64 = base64.split(',')[1];
          setImage(base64);
          setBase64Data(rawBase64);
          runAnalysis(rawBase64);
          setIsProcessingImage(false);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async (b64: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeFoodImage(b64);
      if (result.items) {
        setItems(result.items);
        setChatHistory([{
          id: 'init',
          role: 'model',
          text: 'Я проанализировал ваше фото. Проверьте список продуктов. Если что-то не так, напишите мне здесь, и я исправлю.'
        }]);
      }
    } catch (error) {
      alert("Не удалось проанализировать изображение. Попробуйте снова.");
      setImage(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !base64Data) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: chatInput
    };

    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const result = await refineFoodAnalysis(base64Data, items, userMsg.text);
      
      if (result.items) {
        setItems(result.items);
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.message || 'Список продуктов обновлен.'
      };
      setChatHistory(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'Произошла ошибка при обновлении. Попробуйте еще раз.'
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const updateItem = (index: number, field: keyof FoodItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'weight') {
        const oldWeight = items[index].weight;
        const ratio = Number(value) / oldWeight;
        if (!isNaN(ratio) && oldWeight > 0) {
            newItems[index].calories = Math.round(items[index].calories * ratio);
            newItems[index].protein = Math.round(items[index].protein * ratio);
            newItems[index].carbs = Math.round(items[index].carbs * ratio);
            newItems[index].fat = Math.round(items[index].fat * ratio);
        }
    }
    setItems(newItems);
  };

  const handleSave = () => {
    const totalCalories = items.reduce((acc, item) => acc + item.calories, 0);
    onSave({
      mealType,
      items,
      totalCalories,
      image: image || undefined
    });
  };

  // 1. Camera Entry
  if (!image) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-white">
        <Button variant="ghost" onClick={onCancel} className="absolute top-4 right-4 !text-white">
          <X />
        </Button>
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-2xl font-bold">Сфотографируйте еду</h2>
          <p className="text-gray-400 max-w-xs mx-auto">ИИ определит продукты и автоматически рассчитает калории.</p>
        </div>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-20 h-20 rounded-full bg-white border-4 border-[#1C1C1E] flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
        >
          <Camera className="text-black" size={32} />
        </button>
        <p className="mt-6 text-sm text-gray-500 font-medium">Нажмите, чтобы снять</p>
        {isProcessingImage && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
            <Loader2 className="animate-spin text-[#0A84FF] mb-4" size={40} />
            <span className="text-white text-lg font-bold">Обработка изображения...</span>
            <span className="text-gray-400 mt-2">Пожалуйста, подождите</span>
          </div>
        )}
      </div>
    );
  }

  // 2. Loading State
  if (isAnalyzing) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 mb-8">
            <img src={image} className="w-full h-full object-cover rounded-2xl opacity-50 blur-sm" alt="analyzing" />
            <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#0A84FF]" size={40} />
            </div>
        </div>
        <h2 className="text-xl font-bold text-white">Анализ продуктов...</h2>
        <p className="text-gray-400 mt-2">Определяем состав и порции</p>
      </div>
    );
  }

  // 3. Result & Correction & Chat
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col h-full text-white">
      {/* Header Image & Controls */}
      <div className="relative h-48 shrink-0 w-full">
        <img src={image} className="w-full h-full object-cover" alt="meal" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        
        <button onClick={onCancel} className="absolute top-4 left-4 bg-black/40 backdrop-blur p-2 rounded-full text-white">
            <X size={20} />
        </button>

        {/* Tab Switcher Floating on Image */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex bg-[#1C1C1E]/80 backdrop-blur-md rounded-full p-1 border border-white/10">
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
          >
            <List size={16} /> Список
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'chat' ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
          >
            <MessageCircle size={16} /> Ассистент
          </button>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto relative bg-black rounded-t-[24px] -mt-4 pt-6">
        
        {/* VIEW: LIST */}
        <div className={`px-6 pb-32 space-y-6 ${activeTab === 'list' ? 'block' : 'hidden'}`}>
            {/* Meal Type Selector */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {['Завтрак', 'Обед', 'Ужин', 'Перекус'].map((type) => (
                    <button 
                        key={type}
                        onClick={() => setMealType(type as MealType)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${mealType === type ? 'bg-[#0A84FF] text-white shadow-lg shadow-blue-500/25' : 'bg-[#1C1C1E] text-gray-400'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Items List */}
            <div className="space-y-4">
                {items.map((item, idx) => (
                    <Card key={idx} className="space-y-3 bg-[#1C1C1E]">
                        <div className="flex justify-between items-center">
                            <Input 
                                value={item.name} 
                                onChange={(e) => updateItem(idx, 'name', e.target.value)}
                                className="!bg-transparent !p-0 !text-lg !font-bold !w-auto focus:!bg-[#2C2C2E] focus:!p-2 !text-white"
                            />
                            <button 
                                onClick={() => {
                                    const newItems = items.filter((_, i) => i !== idx);
                                    setItems(newItems);
                                }}
                                className="text-red-400 p-1"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-400 uppercase">Вес (г)</label>
                                <div className="flex items-center gap-2 bg-[#2C2C2E] rounded-xl px-3 py-2">
                                    <input 
                                        type="number"
                                        value={item.weight}
                                        onChange={(e) => updateItem(idx, 'weight', Number(e.target.value))}
                                        className="bg-transparent w-full font-semibold text-white focus:outline-none"
                                    />
                                    <span className="text-xs text-gray-500">г</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-400 uppercase">Калории</label>
                                <div className="flex items-center gap-2 bg-[#0A84FF]/10 rounded-xl px-3 py-2">
                                    <input 
                                        type="number"
                                        value={item.calories}
                                        onChange={(e) => updateItem(idx, 'calories', Number(e.target.value))}
                                        className="bg-transparent w-full font-bold text-[#0A84FF] focus:outline-none"
                                    />
                                    <span className="text-xs text-blue-500/70">ккал</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
                            <span>Б: {item.protein}г</span>
                            <span>У: {item.carbs}г</span>
                            <span>Ж: {item.fat}г</span>
                        </div>
                    </Card>
                ))}

                <Button variant="secondary" fullWidth onClick={() => setItems([...items, { name: 'Продукт', weight: 100, calories: 100, protein: 5, carbs: 10, fat: 5 }])}>
                    <RefreshCw size={16} className="mr-2" /> Добавить вручную
                </Button>
            </div>
        </div>

        {/* VIEW: CHAT */}
        <div className={`px-4 pb-32 h-full flex flex-col ${activeTab === 'chat' ? 'flex' : 'hidden'}`}>
            <div className="flex-1 space-y-4 pb-4">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-[#0A84FF] text-white rounded-br-none' 
                        : 'bg-[#1C1C1E] text-gray-200 rounded-bl-none border border-white/10'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                   <div className="bg-[#1C1C1E] p-4 rounded-2xl rounded-bl-none flex gap-2 items-center border border-white/10">
                      <Loader2 size={16} className="animate-spin text-gray-400" />
                      <span className="text-gray-400 text-xs">Думаю...</span>
                   </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="bg-[#1C1C1E] border-t border-white/10 p-4 pb-8 shrink-0 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
          {activeTab === 'list' ? (
            <div className="flex justify-between items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-medium uppercase">Итого</span>
                  <span className="text-2xl font-bold text-white">{items.reduce((a,b) => a + b.calories, 0)} <span className="text-sm font-normal text-gray-400">ккал</span></span>
                </div>
                <Button onClick={handleSave} className="!bg-white !text-black px-8 hover:!bg-gray-200">
                    <Check className="mr-2" size={20} /> Сохранить
                </Button>
            </div>
          ) : (
            <div className="flex gap-3 items-end">
               <div className="flex-1 bg-[#2C2C2E] rounded-2xl px-4 py-3">
                  <textarea 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Например: Это не курица, а индейка..."
                    className="bg-transparent w-full text-sm text-white focus:outline-none resize-none max-h-20 placeholder-gray-500"
                    rows={1}
                    onKeyDown={(e) => {
                      if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
               </div>
               <button 
                 onClick={handleSendMessage}
                 disabled={!chatInput.trim() || isChatLoading}
                 className="bg-[#0A84FF] text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition-transform active:scale-95"
               >
                 <Send size={20} />
               </button>
            </div>
          )}
      </div>
    </div>
  );
};