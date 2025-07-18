
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Home, ChevronLeft, ChevronRight } from "lucide-react";

interface Treatment {
  id: string;
  name: string;
  category: string;
  custom_price: number;
}

interface MenuCategoriesProps {
  onBack: () => void;
  onCategorySelect: (category: string, treatmentId: string) => void;
}

const MenuCategories = ({ onBack, onCategorySelect }: MenuCategoriesProps) => {
  const { slug } = useParams<{ slug: string }>();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('order_position');

      if (error) {
        return;
      }

      setCategories(data || []);
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? categories.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === categories.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Carousel Container */}
      <div className="relative w-full h-full">
        {/* Categories Slides */}
        <div 
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)`,
            width: `${categories.length * 100}%`
          }}
        >
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="relative flex-shrink-0 cursor-pointer group w-screen h-full"
              onClick={() => onCategorySelect(category.name, category.name)}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={category.cover_image_url || '/lovable-uploads/058b2b94-b909-437a-a7ca-7630a654016f.png'}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out 
                            group-hover:scale-105"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80"></div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-center items-center p-8">
                <h2 className="text-white text-center font-bold mb-4 transform transition-all duration-500 
                             group-hover:scale-110 group-hover:-translate-y-2"
                    style={{
                      fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}>
                  {category.name}
                </h2>
                
                {category.description && (
                  <p className="text-white/80 text-center max-w-md opacity-0 group-hover:opacity-100 
                               transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100"
                     style={{
                       fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                       textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                     }}>
                    {category.description}
                  </p>
                )}
                
                {/* Click indicator */}
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 
                              opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
                    <span className="text-white text-sm font-medium">Toque para explorar</span>
                  </div>
                </div>
              </div>
              
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-30 
                            transition-opacity duration-500 
                            bg-gradient-to-r from-transparent via-white/20 to-transparent 
                            -skew-x-12 -translate-x-full group-hover:translate-x-full 
                            transform transition-transform duration-1000"></div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows - Desktop */}
        <button 
          onClick={goToPrevious}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 z-30 
                   bg-white/10 backdrop-blur-md rounded-full p-4 
                   border border-white/20 hover:bg-white/20 hover:border-white/40
                   transition-all duration-300 hover:scale-110 
                   hidden md:flex items-center justify-center group"
          disabled={categories.length <= 1}
        >
          <ChevronLeft className="w-6 h-6 text-white group-hover:text-white transition-colors" />
        </button>
        
        <button 
          onClick={goToNext}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 z-30 
                   bg-white/10 backdrop-blur-md rounded-full p-4 
                   border border-white/20 hover:bg-white/20 hover:border-white/40
                   transition-all duration-300 hover:scale-110 
                   hidden md:flex items-center justify-center group"
          disabled={categories.length <= 1}
        >
          <ChevronRight className="w-6 h-6 text-white group-hover:text-white transition-colors" />
        </button>

        {/* Dots Indicator */}
        {categories.length > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
            <div className="flex space-x-3">
              {categories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 border border-white/30
                            ${index === currentIndex 
                              ? 'bg-white scale-125' 
                              : 'bg-white/30 hover:bg-white/60 hover:scale-110'
                            }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mobile Swipe Indicator */}
        <div className="md:hidden absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-white/80 text-xs ml-2">Deslize para navegar</span>
          </div>
        </div>

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-30">
          <Button 
            onClick={onBack}
            className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 
                     border border-white/20 hover:border-white/40
                     rounded-full p-3 transition-all duration-300 hover:scale-110"
          >
            <Home className="h-5 w-5" />
          </Button>
        </div>

        {/* Category Counter */}
        <div className="absolute top-6 right-6 z-30">
          <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
            <span className="text-white text-sm font-medium">
              {currentIndex + 1} / {categories.length}
            </span>
          </div>
        </div>
      </div>

      {/* Touch/Swipe Events for Mobile */}
      <div 
        className="md:hidden absolute inset-0 z-20 touch-pan-y"
        onTouchStart={(e) => {
          const touch = e.touches[0];
          e.currentTarget.setAttribute('data-start-x', touch.clientX.toString());
        }}
        onTouchEnd={(e) => {
          const startX = parseFloat(e.currentTarget.getAttribute('data-start-x') || '0');
          const endX = e.changedTouches[0].clientX;
          const diff = startX - endX;
          
          if (Math.abs(diff) > 50) { // Minimum swipe distance
            if (diff > 0) {
              goToNext();
            } else {
              goToPrevious();
            }
          }
        }}
      />
    </div>
  );
};

export default MenuCategories;
