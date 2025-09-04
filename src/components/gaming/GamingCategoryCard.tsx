import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gamepad2, Trophy, Star, Zap } from 'lucide-react';

interface GamingCategoryCardProps {
  category: {
    id: string;
    name: string;
    description?: string;
    image: string;
  };
  index: number;
}

const GamingCategoryCard: React.FC<GamingCategoryCardProps> = ({ category, index }) => {
  // Gaming-themed icons for different categories
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('strategy') || name.includes('tactical')) return <Gamepad2 className="w-8 h-8" />;
    if (name.includes('family') || name.includes('party')) return <Trophy className="w-8 h-8" />;
    if (name.includes('puzzle') || name.includes('brain')) return <Star className="w-8 h-8" />;
    if (name.includes('rpg') || name.includes('adventure')) return <Zap className="w-8 h-8" />;
    return <Gamepad2 className="w-8 h-8" />;
  };

  // Gaming-themed colors and effects
  const getCategoryTheme = (index: number) => {
    const themes = [
      { bg: 'from-blue-600/20 to-purple-600/20', border: 'border-blue-500/30', glow: 'shadow-blue-500/20', accent: 'text-blue-400' },
      { bg: 'from-green-600/20 to-emerald-600/20', border: 'border-green-500/30', glow: 'shadow-green-500/20', accent: 'text-green-400' },
      { bg: 'from-red-600/20 to-pink-600/20', border: 'border-red-500/30', glow: 'shadow-red-500/20', accent: 'text-red-400' },
      { bg: 'from-yellow-600/20 to-orange-600/20', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/20', accent: 'text-yellow-400' },
      { bg: 'from-purple-600/20 to-indigo-600/20', border: 'border-purple-500/30', glow: 'shadow-purple-500/20', accent: 'text-purple-400' },
      { bg: 'from-cyan-600/20 to-blue-600/20', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/20', accent: 'text-cyan-400' }
    ];
    return themes[index % themes.length];
  };

  const theme = getCategoryTheme(index);

  return (
    <Link 
      to={`/shop?category=${category.id}`}
      className="group block h-full"
    >
      <div className={`
        relative h-full min-h-[400px] rounded-2xl overflow-hidden
        bg-gradient-to-br ${theme.bg} backdrop-blur-sm
        border ${theme.border} shadow-lg ${theme.glow}
        transition-all duration-500 ease-out
        hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/30
        transform-gpu will-change-transform
      `}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        </div>

        {/* Gaming grid overlay */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          ></div>
        </div>

        {/* Category Image */}
        <div className="relative h-2/3 overflow-hidden">
          <img
            src={category.image || '/gaming-assets/img/placeholder-game.webp'}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/gaming-assets/img/placeholder-game.webp';
            }}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          {/* Gaming-style corner decorations */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/30"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/30"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/30"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/30"></div>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          {/* Category Icon */}
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 mb-4 ${theme.accent}`}>
            {getCategoryIcon(category.name)}
          </div>

          {/* Category Name */}
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">
            {category.name.toUpperCase()}
          </h3>

          {/* Description */}
          {category.description && (
            <p className="text-white/80 text-sm mb-4 line-clamp-2">
              {category.description}
            </p>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-xs font-medium uppercase tracking-wider">
              Explore Games
            </span>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-blue-500/20 group-hover:border-blue-400/50 transition-all duration-300">
              <ArrowRight className="w-4 h-4 text-white group-hover:text-blue-300 transition-colors duration-300" />
            </div>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Animated border effect */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
             style={{ 
               backgroundClip: 'padding-box',
               WebkitBackgroundClip: 'padding-box'
             }}>
        </div>
      </div>
    </Link>
  );
};

export default GamingCategoryCard;
