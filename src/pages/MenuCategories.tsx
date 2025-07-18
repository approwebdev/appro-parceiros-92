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
      {/* Setas de navegação */}
      <button className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all hidden md:block">
        <ChevronLeft className="w-6 h-6 text-gray-800" />
      </button>
      
      <button className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all hidden md:block">
        <ChevronRight className="w-6 h-6 text-gray-800" />
      </button>

      {/* Conteúdo Principal */}
      <div className="h-full min-h-screen">
        {/* Carrossel de Categorias - Responsivo */}
        <div className="md:hidden flex overflow-x-auto gap-2 h-full min-h-screen snap-x snap-mandatory scrollbar-hide px-4">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`relative overflow-hidden cursor-pointer group bg-gradient-to-br from-blue-600 to-purple-700 
                         flex-shrink-0 w-80 h-full min-h-screen snap-center rounded-2xl
                         animate-fade-in transition-all duration-700 ease-out transform hover:scale-[1.02]
                         hover:shadow-2xl hover:z-10`}
              style={{ 
                animationDelay: `${index * 150}ms`,
                animationFillMode: 'both'
              }}
              onClick={() => onCategorySelect(category.name, category.name)}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 
                            transition-all duration-500 group-hover:to-black/40 rounded-2xl"></div>
              
              <img 
                src={category.cover_image_url || '/lovable-uploads/058b2b94-b909-437a-a7ca-7630a654016f.png'}
                alt={category.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out 
                          group-hover:scale-110 group-hover:brightness-110 rounded-2xl"
              />
              
              {/* Nome da categoria */}
              <div className="absolute top-4 left-4 right-4 transform transition-all duration-500 
                            group-hover:-translate-y-2 group-hover:scale-105">
                <h3 className="text-white text-xl font-bold text-center 
                             bg-black/40 backdrop-blur-md rounded-xl py-3 px-4 
                             transition-all duration-500 group-hover:bg-black/60 
                             group-hover:backdrop-blur-lg group-hover:shadow-xl
                             border border-white/10 group-hover:border-white/20">
                  {category.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Layout Desktop/Tablet - Grid responsivo */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-6 p-6 h-full min-h-screen">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`relative overflow-hidden cursor-pointer group bg-gradient-to-br from-blue-600 to-purple-700 
                         aspect-[4/5] rounded-3xl
                         animate-fade-in transition-all duration-700 ease-out transform hover:scale-105 hover:-translate-y-2
                         hover:shadow-2xl hover:z-10`}
              style={{ 
                animationDelay: `${index * 150}ms`,
                animationFillMode: 'both'
              }}
              onClick={() => onCategorySelect(category.name, category.name)}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 
                            transition-all duration-500 group-hover:to-black/40 rounded-3xl"></div>
              
              <img 
                src={category.cover_image_url || '/lovable-uploads/058b2b94-b909-437a-a7ca-7630a654016f.png'}
                alt={category.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out 
                          group-hover:scale-110 group-hover:brightness-110 rounded-3xl"
              />
              
              {/* Nome da categoria */}
              <div className="absolute bottom-6 left-4 right-4 transform transition-all duration-500 
                            group-hover:translate-y-2 group-hover:scale-105">
                <h3 className="text-white text-lg lg:text-xl font-bold text-center 
                             bg-black/40 backdrop-blur-md rounded-xl py-3 px-4 
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
                            transform transition-transform duration-1000 rounded-3xl"></div>
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
