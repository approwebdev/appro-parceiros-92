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
  onCategorySelect: (category: string) => void;
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
      gradient: 'category-treatment'
    },
    {
      id: 'transformation',
      name: 'Transformation',
      image: '/lovable-uploads/058b2b94-b909-437a-a7ca-7630a654016f.png',
      gradient: 'category-transformation'
    },
    {
      id: 'combos',
      name: 'Combos',
      image: '/lovable-uploads/058b2b94-b909-437a-a7ca-7630a654016f.png',
      gradient: 'category-combos'
    },
    {
      id: 'home_care',
      name: 'Home Care',
      image: '/lovable-uploads/058b2b94-b909-437a-a7ca-7630a654016f.png',
      gradient: 'category-homecare'
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
    <div className="menu-container bg-white relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-6">
        {/* Logo Appro */}
        <div className="flex items-center">
          <div className="text-black font-bold text-2xl">
            A<span className="text-gold">RO</span>
          </div>
        </div>

        {/* Ícones superiores */}
        <div className="flex items-center gap-4">
          <div className="text-black">
            <div className="h-6 w-6 rounded-full bg-black/20 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-black"></div>
            </div>
          </div>
          <div className="text-black">
            <div className="h-6 w-6 rounded-full bg-black/20 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-black"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="h-full flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto px-8">
          {/* Carrossel de Categorias */}
          <div className="grid grid-cols-4 gap-4 h-96">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`relative overflow-hidden rounded-2xl cursor-pointer transition-transform hover:scale-105 ${category.gradient}`}
                onClick={() => onCategorySelect(category.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
                <img 
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white text-2xl font-bold">{category.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-6">
        <Button 
          onClick={onBack}
          className="bg-black/80 text-white hover:bg-black p-3 rounded-full"
        >
          <Home className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default MenuCategories;