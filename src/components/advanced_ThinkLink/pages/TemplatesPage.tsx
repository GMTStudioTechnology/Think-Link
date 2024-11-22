import React, { useState } from 'react';
import {  Copy } from '@gravity-ui/icons';
import {FontCursor} from '@gravity-ui/icons';
import {CirclePlusFill} from '@gravity-ui/icons';
import {TrashBin} from '@gravity-ui/icons';
interface Template {
  id: string;
  title: string;
  prompt: string;
  aiType: 'ThinkLink' | 'MazsAI';
}

const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [aiType, setAiType] = useState<'ThinkLink' | 'MazsAI'>('ThinkLink');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (editingId) {
      setTemplates(templates.map(template => 
        template.id === editingId 
          ? { ...template, title, prompt, aiType }
          : template
      ));
      setEditingId(null);
    } else {
      setTemplates([...templates, {
        id: Date.now().toString(),
        title,
        prompt,
        aiType
      }]);
    }
    setTitle('');
    setPrompt('');
    setAiType('ThinkLink');
  };

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">AI Prompt Templates</h2>
        <button 
          className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
          onClick={() => setEditingId(null)}
        >
          <CirclePlusFill className="w-5 h-5" />
          <span>New Template</span>
        </button>
      </div>

      {/* Template Form */}
      <div className="bg-white/5 rounded-xl p-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Template Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              placeholder="Enter template title..."
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">AI Type</label>
            <div className="flex space-x-4">
              {['ThinkLink', 'MazsAI'].map((type) => (
                <button
                  key={type}
                  onClick={() => setAiType(type as 'ThinkLink' | 'MazsAI')}
                  className={`px-4 py-2 rounded-lg ${
                    aiType === type 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">Prompt Template</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
              placeholder="Enter your prompt template..."
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:opacity-90 transition"
          >
            {editingId ? 'Update Template' : 'Save Template'}
          </button>
        </div>
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div 
            key={template.id}
            className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{template.title}</h3>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  template.aiType === 'ThinkLink' 
                    ? 'bg-indigo-500/20 text-indigo-200'
                    : 'bg-purple-500/20 text-purple-200'
                }`}>
                  {template.aiType}
                </span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setTitle(template.title);
                    setPrompt(template.prompt);
                    setAiType(template.aiType);
                    setEditingId(template.id);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <FontCursor className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => navigator.clipboard.writeText(template.prompt)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setTemplates(templates.filter(t => t.id !== template.id))}
                  className="p-2 hover:bg-white/10 rounded-lg text-red-400"
                >
                  <TrashBin className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-white/70 text-sm line-clamp-3">{template.prompt}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesPage; 