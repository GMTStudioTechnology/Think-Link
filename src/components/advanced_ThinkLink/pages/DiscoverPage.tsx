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
    <div className="text-white h-[calc(100vh-8rem)] sm:h-[calc(100vh-12rem)] md:h-[calc(100vh-17rem)]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Discover</h2>
        <div className="flex flex-wrap w-full sm:w-auto gap-2 sm:gap-3 md:gap-4">
          <button className="flex-1 sm:flex-none flex items-center justify-center sm:justify-start space-x-2 px-2 sm:px-3 md:px-4 py-1.5 md:py-2 bg-white/10 rounded-lg hover:bg-white/20 transition text-xs sm:text-sm md:text-base">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-orange-400" />
            <span>Trending</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center sm:justify-start space-x-2 px-2 sm:px-3 md:px-4 py-1.5 md:py-2 bg-white/10 rounded-lg hover:bg-white/20 transition text-xs sm:text-sm md:text-base">
            <StarFill className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-400" />
            <span>Featured</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center sm:justify-start space-x-2 px-2 sm:px-3 md:px-4 py-1.5 md:py-2 bg-white/10 rounded-lg hover:bg-white/20 transition text-xs sm:text-sm md:text-base">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-400" />
            <span>Recent</span>
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto scrollbar-hide space-x-2 sm:space-x-3 md:space-x-4 mb-4 sm:mb-6 md:mb-8 pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg transition whitespace-nowrap text-xs sm:text-sm md:text-base ${
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white/5 rounded-xl p-3 sm:p-4 md:p-6 hover:bg-white/10 transition group"
          >
            <div className="flex justify-between items-start mb-2 sm:mb-3 md:mb-4">
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold group-hover:text-indigo-400 transition">
                  {item.title}
                </h3>
                <span className={`text-[10px] sm:text-xs md:text-sm px-2 py-0.5 sm:py-1 rounded-full inline-block mt-1.5 sm:mt-2 ${
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
                className={`p-1 sm:p-1.5 md:p-2 rounded-lg transition ${
                  item.isSaved ? 'text-yellow-400' : 'text-white/50 hover:text-white'
                }`}
              >
                <BookmarkFill className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </button>
            </div>
            
            <p className="text-white/70 text-xs sm:text-sm md:text-base mb-2 sm:mb-3 md:mb-4 line-clamp-2">
              {item.description}
            </p>
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-2 sm:space-x-3 md:space-x-4">
                <button className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2 text-white/70 hover:text-white transition">
                  <ThumbsUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  <span className="text-[10px] sm:text-xs md:text-sm">{item.likes}</span>
                </button>
                <button className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2 text-white/70 hover:text-white transition">
                  <ArrowShapeTurnUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  <span className="text-[10px] sm:text-xs md:text-sm">{item.shares}</span>
                </button>
              </div>
              <span className="text-[10px] sm:text-xs md:text-sm text-white/50">{item.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscoverPage; 