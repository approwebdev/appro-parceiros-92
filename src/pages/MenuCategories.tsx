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
        console.error('Erro ao buscar categorias:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
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
    <div className="menu-container bg-black relative overflow-hidden">
      {/* Conteúdo Principal */}
      <div className="h-full">
        {/* Carrossel de Categorias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 h-full">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`relative overflow-hidden cursor-pointer transition-transform hover:scale-105 bg-gradient-to-br from-blue-600 to-purple-700 h-full`}
              onClick={() => onCategorySelect(category.name, category.id)}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"></div>
              <img 
                src={category.cover_image_url || '/lovable-uploads/058b2b94-b909-437a-a7ca-7630a654016f.png'}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              {/* Nome da categoria em cima */}
              <div className="absolute top-8 left-8 right-8">
                <h3 className="text-white text-2xl md:text-3xl font-bold text-center bg-black/30 backdrop-blur-sm rounded-lg py-2 px-4">
                  {category.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-6 z-20">
        <Button 
          onClick={onBack}
          className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 p-3 rounded-full border border-white/20"
        >
          <Home className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default MenuCategories;