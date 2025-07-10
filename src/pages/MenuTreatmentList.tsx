import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Instagram } from "lucide-react";

interface Treatment {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  custom_price: number;
  images: string[];
  rating: number;
  rating_count: number;
  category: string;
}

interface MenuTreatmentListProps {
  onBack: () => void;
  onTreatmentSelect: (treatmentId: string) => void;
  selectedCategory: string;
}

const MenuTreatmentList = ({ onBack, onTreatmentSelect, selectedCategory }: MenuTreatmentListProps) => {
  const { slug } = useParams<{ slug: string }>();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [salonInfo, setSalonInfo] = useState<{ name: string; instagram?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug && selectedCategory) {
      fetchTreatments();
    }
  }, [slug, selectedCategory]);

  const fetchTreatments = async () => {
    try {
      // Buscar salão pelo slug
      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .select('id, name, instagram')
        .eq('slug', slug)
        .single();

      if (salonError) {
        console.error('Erro ao buscar salão:', salonError);
        return;
      }

      setSalonInfo({ name: salonData.name, instagram: salonData.instagram });

      // Buscar tratamentos da categoria específica
      const { data: treatmentData, error: treatmentError } = await supabase
        .from('salon_treatments')
        .select(`
          custom_price,
          treatments (
            id,
            name,
            subtitle,
            description,
            images,
            rating,
            rating_count,
            category
          )
        `)
        .eq('salon_id', salonData.id)
        .eq('is_active', true);

      if (treatmentError) {
        console.error('Erro ao buscar tratamentos:', treatmentError);
        return;
      }

      // Filtrar apenas tratamentos da categoria selecionada
      const filteredTreatments = treatmentData
        ?.filter(item => item.treatments.category === selectedCategory)
        .map(item => ({
          ...item.treatments,
          custom_price: item.custom_price
        })) || [];

      setTreatments(filteredTreatments);
    } catch (error) {
      console.error('Erro ao buscar tratamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="menu-container bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="menu-container bg-white relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-6 bg-white border-b">
        <div className="flex items-center gap-4">
          <img src="/lovable-uploads/4645a4ff-beda-4f6f-90f1-ea6a54167f18.png" alt="ARO" className="h-8" />
          <Button 
            onClick={onBack}
            variant="ghost"
            className="text-black hover:text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Categorias
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {salonInfo?.instagram && (
            <button 
              className="text-purple-600 hover:text-purple-700 transition-colors"
              onClick={() => {
                window.open(`https://instagram.com/${salonInfo.instagram?.replace('@', '')}`, '_blank');
              }}
            >
              <Instagram className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="h-full pt-20 overflow-y-auto bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">{selectedCategory}</h1>
            <p className="text-lg text-gray-600">{salonInfo?.name}</p>
          </div>

          {treatments.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Nenhum tratamento encontrado</h2>
              <p className="text-gray-600 mb-6">Esta categoria ainda não possui tratamentos disponíveis.</p>
              <Button onClick={onBack} className="bg-amber-600 hover:bg-amber-700 text-white">
                Voltar às categorias
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {treatments.map((treatment) => (
                <div
                  key={treatment.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow border border-gray-200"
                  onClick={() => onTreatmentSelect(treatment.id)}
                >
                  {/* Imagem */}
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img 
                      src={treatment.images && treatment.images.length > 0 
                        ? treatment.images[0] 
                        : "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                      }
                      alt={treatment.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-black mb-2 line-clamp-2">{treatment.name}</h3>
                    {treatment.subtitle && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{treatment.subtitle}</p>
                    )}
                    
                    {/* Avaliações */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className={`h-4 w-4 ${star <= treatment.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">({treatment.rating_count})</span>
                    </div>
                    
                    {/* Preço */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-amber-600">
                          {formatPrice(treatment.custom_price)}
                        </span>
                      </div>
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuTreatmentList;