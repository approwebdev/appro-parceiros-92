
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
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  const categoriesPerPage = 4;
  const totalPages = Math.ceil(categories.length / categoriesPerPage);

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
    setCurrentPageIndex((prevIndex) => 
      prevIndex === 0 ? totalPages - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentPageIndex((prevIndex) => 
      prevIndex === totalPages - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPage = (index: number) => {
    setCurrentPageIndex(index);
  };

  const getCurrentPageCategories = () => {
    const startIndex = currentPageIndex * categoriesPerPage;
    const endIndex = startIndex + categoriesPerPage;
    return categories.slice(startIndex, endIndex);
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
      {/* Page Container */}
      <div className="relative w-full h-full">
        {/* Categories Container - Horizontal layout */}
        <div 
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ 
            transform: `translateX(-${currentPageIndex * 100}%)`,
            width: `${totalPages * 100}%`
          }}
        >
          {Array.from({ length: totalPages }, (_, pageIndex) => {
            const startIndex = pageIndex * categoriesPerPage;
            const pageCategories = categories.slice(startIndex, startIndex + categoriesPerPage);
            
            return (
              <div key={pageIndex} className="w-screen h-full flex-shrink-0">
                {/* 4 categories in horizontal line, each taking 25% width and full height */}
                <div className="flex h-full">
                  {pageCategories.map((category, index) => (
                    <div
                      key={category.id}
                      className="relative cursor-pointer group overflow-hidden flex-1"
                      style={{ width: '25%' }}
                      onClick={() => onCategorySelect(category.name, category.name)}
                    >
                      {/* Background Image */}
                      <div className="absolute inset-0">
                        <img 
                          src={category.cover_image_url || '/lovable-uploads/058b2b94-b909-437a-a7ca-7630a654016f.png'}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out 
                                    group-hover:scale-110"
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80"></div>
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300"></div>
                      </div>
                      
                      {/* Content */}
                      <div className="relative z-10 h-full flex flex-col justify-center items-center p-6">
                        <h2 className="text-white text-center font-bold mb-2 transform transition-all duration-500 
                                     group-hover:scale-110 group-hover:-translate-y-2"
                            style={{
                              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                            }}>
                          {category.name}
                        </h2>
                        
                        {category.description && (
                          <p className="text-white/80 text-center max-w-xs opacity-0 group-hover:opacity-100 
                                       transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100"
                             style={{
                               fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                               textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                             }}>
                            {category.description}
                          </p>
                        )}
                        
                        {/* Click indicator */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
                                      opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                            <span className="text-white text-xs font-medium">Toque aqui</span>
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
                  
                  {/* Fill empty slots if less than 4 categories on last page */}
                  {pageCategories.length < categoriesPerPage && 
                    Array.from({ length: categoriesPerPage - pageCategories.length }, (_, emptyIndex) => (
                      <div key={`empty-${emptyIndex}`} className="relative bg-black/20 flex-1" style={{ width: '25%' }}></div>
                    ))
                  }
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows - Desktop */}
        {totalPages > 1 && (
          <>
            <button 
              onClick={goToPrevious}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 z-30 
                       bg-white/10 backdrop-blur-md rounded-full p-4 
                       border border-white/20 hover:bg-white/20 hover:border-white/40
                       transition-all duration-300 hover:scale-110 
                       hidden md:flex items-center justify-center group"
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
            >
              <ChevronRight className="w-6 h-6 text-white group-hover:text-white transition-colors" />
            </button>
          </>
        )}

        {/* Page Dots Indicator */}
        {totalPages > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
            <div className="flex space-x-3">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 border border-white/30
                            ${index === currentPageIndex 
                              ? 'bg-white scale-125' 
                              : 'bg-white/30 hover:bg-white/60 hover:scale-110'
                            }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mobile Swipe Indicator */}
        {totalPages > 1 && (
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
        )}

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

        {/* Page Counter */}
        <div className="absolute top-6 right-6 z-30">
          <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
            <span className="text-white text-sm font-medium">
              {currentPageIndex + 1} / {totalPages}
            </span>
          </div>
        </div>
      </div>

      {/* Touch/Swipe Events for Mobile */}
      {totalPages > 1 && (
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
      )}
    </div>
  );
};

export default MenuCategories;
