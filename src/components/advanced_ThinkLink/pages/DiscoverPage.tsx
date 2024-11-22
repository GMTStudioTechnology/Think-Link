import React, { useState } from 'react';
import { 
  Flame, 
  StarFill, 
  Clock, 
  ThumbsUp,
  ArrowShapeTurnUpRight,
  BookmarkFill
} from '@gravity-ui/icons';

interface DiscoverItem {
  id: string;
  title: string;
  description: string;
  category: string;
  likes: number;
  shares: number;
  isSaved: boolean;
  aiType: 'ThinkLink' | 'MazsAI';
}

const DiscoverPage: React.FC = () => {
  // Sample data - in a real app, this would come from an API
  const [items, setItems] = useState<DiscoverItem[]>([
    {
      id: '1',
      title: 'Creative Writing Assistant',
      description: 'An AI-powered template for creative writing and storytelling...',
      category: 'Writing',
      likes: 234,
      shares: 56,
      isSaved: false,
      aiType: 'ThinkLink'
    },
    // ... more items
  ]);

  const categories = ['All', 'Writing', 'Code', 'Business', 'Education', 'Art'];
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <div className="text-white h-[calc(100vh-17rem)]">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Discover</h2>
        <div className="flex space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
            <Flame className="w-5 h-5 text-orange-400" />
            <span>Trending</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
            <StarFill className="w-5 h-5 text-yellow-400" />
            <span>Featured</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
            <Clock className="w-5 h-5 text-blue-400" />
            <span>Recent</span>
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex space-x-4 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-lg transition ${
              activeCategory === category
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold group-hover:text-indigo-400 transition">
                  {item.title}
                </h3>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  item.aiType === 'ThinkLink'
                    ? 'bg-indigo-500/20 text-indigo-200'
                    : 'bg-purple-500/20 text-purple-200'
                }`}>
                  {item.aiType}
                </span>
              </div>
              <button 
                onClick={() => {
                  setItems(items.map(i => 
                    i.id === item.id ? { ...i, isSaved: !i.isSaved } : i
                  ));
                }}
                className={`p-2 rounded-lg transition ${
                  item.isSaved ? 'text-yellow-400' : 'text-white/50 hover:text-white'
                }`}
              >
                <BookmarkFill className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-white/70 text-sm mb-4">{item.description}</p>
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <button className="flex items-center space-x-2 text-white/70 hover:text-white transition">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{item.likes}</span>
                </button>
                <button className="flex items-center space-x-2 text-white/70 hover:text-white transition">
                  <ArrowShapeTurnUpRight className="w-4 h-4" />
                  <span>{item.shares}</span>
                </button>
              </div>
              <span className="text-sm text-white/50">{item.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscoverPage; 