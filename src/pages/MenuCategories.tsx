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
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchTreatments();
    }
  }, [slug]);

  const fetchTreatments = async () => {
    try {
      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .select('id')
        .eq('slug', slug)
        .single();

      if (salonError) {
        console.error('Erro ao buscar salão:', salonError);
        return;
      }

      const { data: treatmentsData, error: treatmentsError } = await supabase
        .from('salon_treatments')
        .select(`
          *,
          treatments (
            id,
            name,
            category
          )
        `)
        .eq('salon_id', salonData.id)
        .eq('is_active', true);

      if (treatmentsError) {
        console.error('Erro ao buscar tratamentos:', treatmentsError);
        return;
      }

      const formattedTreatments = treatmentsData?.map(item => ({
        id: item.treatments.id,
        name: item.treatments.name,
        category: item.treatments.category,
        custom_price: item.custom_price
      })) || [];

      setTreatments(formattedTreatments);
    } catch (error) {
      console.error('Erro ao buscar tratamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      id: 'treatment',
      name: 'Treatment',
      image: '/lovable-uploads/058b2b94-b909-437a-a7ca-7630a654016f.png',
      gradient: 'category-treatment',
      treatmentId: 'liso-lambido'
    },
    {
      id: 'transformation', 
      name: 'Transformation',
      image: '/lovable-uploads/058b2b94-b909-437a-a7ca-7630a654016f.png',
      gradient: 'category-transformation',
      treatmentId: 'coloracao-premium'
    },
    {
      id: 'combos',
      name: 'Combos', 
      image: '/lovable-uploads/058b2b94-b909-437a-a7ca-7630a654016f.png',
      gradient: 'category-combos',
      treatmentId: 'combo-liso-hidratacao'
    },
    {
      id: 'home_care',
      name: 'Home Care',
      image: '/lovable-uploads/058b2b94-b909-437a-a7ca-7630a654016f.png', 
      gradient: 'category-homecare',
      treatmentId: 'kit-manutencao'
    }
  ];

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
              className={`relative overflow-hidden cursor-pointer transition-transform hover:scale-105 ${category.gradient} h-full`}
              onClick={() => onCategorySelect(category.id, category.treatmentId)}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"></div>
              <img 
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              {/* Nome da categoria em cima */}
              <div className="absolute top-8 left-8 right-8">
                <h3 className="text-white text-2xl md:text-3xl font-bold text-center bg-black/30 backdrop-blur-sm rounded-lg py-2 px-4">
                  {category.name}
                </h3>
              </div>
              <div className="absolute bottom-8 left-8">
                <h3 className="text-white text-3xl md:text-4xl font-bold">{category.name}</h3>
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