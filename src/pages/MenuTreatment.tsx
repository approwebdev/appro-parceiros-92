import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Treatment {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  custom_price: number;
  images: string[];
  video_url: string;
  rating: number;
  rating_count: number;
}

interface MenuTreatmentProps {
  onBack: () => void;
  treatmentId: string;
}

const MenuTreatment = ({ onBack, treatmentId }: MenuTreatmentProps) => {
  const { slug } = useParams<{ slug: string }>();
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [relatedTreatments, setRelatedTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug && treatmentId) {
      fetchTreatment();
    }
  }, [slug, treatmentId]);

  const fetchTreatment = async () => {
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

      const { data: treatmentData, error: treatmentError } = await supabase
        .from('salon_treatments')
        .select(`
          *,
          treatments (
            id,
            name,
            subtitle,
            description,
            images,
            video_url,
            rating,
            rating_count
          )
        `)
        .eq('salon_id', salonData.id)
        .eq('treatment_id', treatmentId)
        .eq('is_active', true)
        .single();

      if (treatmentError) {
        console.error('Erro ao buscar tratamento:', treatmentError);
        return;
      }

      const formattedTreatment = {
        id: treatmentData.treatments.id,
        name: treatmentData.treatments.name,
        subtitle: treatmentData.treatments.subtitle,
        description: treatmentData.treatments.description,
        custom_price: treatmentData.custom_price,
        images: treatmentData.treatments.images || [],
        video_url: treatmentData.treatments.video_url,
        rating: treatmentData.treatments.rating,
        rating_count: treatmentData.treatments.rating_count
      };

      setTreatment(formattedTreatment);

      // Buscar produtos relacionados
      const { data: relatedData, error: relatedError } = await supabase
        .from('salon_treatments')
        .select(`
          *,
          treatments (
            id,
            name,
            subtitle,
            description,
            images,
            video_url,
            rating,
            rating_count
          )
        `)
        .eq('salon_id', salonData.id)
        .eq('is_active', true)
        .neq('treatment_id', treatmentId)
        .limit(5);

      if (!relatedError && relatedData) {
        const formattedRelated = relatedData.map(item => ({
          id: item.treatments.id,
          name: item.treatments.name,
          subtitle: item.treatments.subtitle,
          description: item.treatments.description,
          custom_price: item.custom_price,
          images: item.treatments.images || [],
          video_url: item.treatments.video_url,
          rating: item.treatments.rating,
          rating_count: item.treatments.rating_count
        }));

        setRelatedTreatments(formattedRelated);
      }
    } catch (error) {
      console.error('Erro ao buscar tratamento:', error);
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

  if (!treatment) {
    return (
      <div className="menu-container bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Tratamento não encontrado</h2>
          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-container bg-white relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-6 bg-white border-b">
        <div className="flex items-center gap-4">
          <div className="text-black font-bold text-2xl">
            A<span className="text-gold">RO</span>
          </div>
          <Button 
            onClick={onBack}
            variant="ghost"
            className="text-black hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-black">
            <Phone className="h-6 w-6" />
          </div>
          <div className="text-black">
            <div className="h-6 w-6 rounded-full bg-black/20 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-black"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="h-full pt-20 pb-20">
        <div className="h-full flex">
          {/* Lado Esquerdo - Imagens */}
          <div className="w-1/2 p-8">
            <div className="h-full flex flex-col">
              {/* Imagem Principal */}
              <div className="flex-1 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                <img 
                  src="/lovable-uploads/f5c1b56b-2cb9-470a-8b4c-7640e6b2ac64.png"
                  alt={treatment.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Miniaturas */}
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src="/lovable-uploads/f5c1b56b-2cb9-470a-8b4c-7640e6b2ac64.png"
                      alt={`${treatment.name} ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Centro - Informações */}
          <div className="w-1/2 p-8">
            <div className="h-full flex flex-col">
              <div className="mb-2">
                <span className="text-sm text-gray-500">Categoria</span>
              </div>
              
              <h1 className="text-3xl font-bold mb-2">{treatment.name}</h1>
              
              <p className="text-lg text-gray-600 mb-4">{treatment.subtitle}</p>
              
              <div className="flex-1 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {treatment.description}
                </p>
              </div>
              
              {/* Avaliações */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={`h-4 w-4 ${star <= treatment.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({treatment.rating_count})</span>
              </div>
              
              {/* Preço */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500">de</span>
                  <span className="text-lg line-through text-gray-400">R$ ****</span>
                </div>
                <div className="text-3xl font-bold text-black">
                  {formatPrice(treatment.custom_price)}
                </div>
              </div>
              
              {/* Botão */}
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-full">
                Saiba mais...
              </Button>
            </div>
          </div>

          {/* Lado Direito - Vídeo */}
          <div className="w-1/2 p-8">
            <div className="h-full bg-gray-200 rounded-lg overflow-hidden">
              <video 
                className="w-full h-full object-cover"
                controls
                poster="/lovable-uploads/f5c1b56b-2cb9-470a-8b4c-7640e6b2ac64.png"
              >
                <source src={treatment.video_url} type="video/mp4" />
                Seu navegador não suporta vídeo.
              </video>
            </div>
          </div>
        </div>
      </div>

      {/* Produtos Relacionados */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-6">
        <h3 className="text-lg font-semibold mb-4">Produtos Relacionados</h3>
        <div className="flex gap-4 overflow-x-auto">
          {relatedTreatments.map((related) => (
            <div key={related.id} className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
              <img 
                src="/lovable-uploads/f5c1b56b-2cb9-470a-8b4c-7640e6b2ac64.png"
                alt={related.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
            <ChevronRight className="h-6 w-6 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuTreatment;