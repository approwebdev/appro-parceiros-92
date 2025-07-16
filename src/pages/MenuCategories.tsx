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


  if (loading) {
    return (
      <div className="menu-container bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="menu-container bg-black relative overflow-hidden min-h-screen">
      {/* Conteúdo Principal */}
      <div className="h-full min-h-screen">
        {/* Carrossel de Categorias */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 h-full min-h-screen gap-0 md:gap-0">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`relative overflow-hidden cursor-pointer group bg-gradient-to-br from-blue-600 to-purple-700 
                         h-64 sm:h-80 lg:h-full min-h-[300px] lg:min-h-screen
                         animate-fade-in transition-all duration-700 ease-out transform hover:scale-[1.02] hover:-translate-y-1
                         hover:shadow-2xl hover:z-10`}
              style={{ 
                animationDelay: `${index * 150}ms`,
                animationFillMode: 'both'
              }}
              onClick={() => onCategorySelect(category.name, category.name)}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 
                            transition-all duration-500 group-hover:to-black/40"></div>
              
              {/* Overlay de hover com gradiente suave */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <img 
                src={category.cover_image_url || '/lovable-uploads/058b2b94-b909-437a-a7ca-7630a654016f.png'}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out 
                          group-hover:scale-110 group-hover:brightness-110"
              />
              
              {/* Nome da categoria em cima */}
              <div className="absolute top-4 md:top-8 left-4 md:left-8 right-4 md:right-8 
                            transform transition-all duration-500 
                            group-hover:-translate-y-2 group-hover:scale-105">
                <h3 className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-center 
                             bg-black/40 backdrop-blur-md rounded-xl py-2 md:py-3 px-3 md:px-4 
                             transition-all duration-500 group-hover:bg-black/60 
                             group-hover:backdrop-blur-lg group-hover:shadow-xl
                             border border-white/10 group-hover:border-white/20">
                  {category.name}
                </h3>
              </div>
              
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 
                            transition-opacity duration-500 
                            bg-gradient-to-r from-transparent via-white to-transparent 
                            -skew-x-12 -translate-x-full group-hover:translate-x-full 
                            transform transition-transform duration-1000"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 z-20">
        <Button 
          onClick={onBack}
          className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 p-2 md:p-3 rounded-full 
                   border border-white/20 transition-all duration-300 hover:scale-110 
                   hover:shadow-xl hover:border-white/40"
        >
          <Home className="h-5 w-5 md:h-6 md:w-6 transition-transform duration-300 hover:scale-110" />
        </Button>
      </div>
    </div>
  );
};

export default MenuCategories;