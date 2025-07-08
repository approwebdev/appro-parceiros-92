import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Star, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";

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
  const [showPrice, setShowPrice] = useState(false);

  useEffect(() => {
    if (slug && treatmentId) {
      fetchTreatment();
    }
  }, [slug, treatmentId]);

  const fetchTreatment = async () => {
    try {
      // Dados fictícios baseados no treatmentId para demonstração
      const treatmentData = {
        'liso-lambido': {
          id: 'liso-lambido',
          name: 'Liso Lambido',
          subtitle: 'Realinhamento capilar de alto desempenho',
          description: 'Apresentamos o Liso Lambido, a solução perfeita para quem busca um realinhamento capilar impecável e duradouro. Este produto inovador foi desenvolvido para proporcionar um efeito liso e sedoso, eliminando o frizz e disciplinando até os fios mais rebeldes. Formulado com ingredientes de alta qualidade, o Liso Lambido hidrata profundamente e nutre os cabelos.',
          custom_price: 150.00,
          images: ['/lovable-uploads/f5c1b56b-2cb9-470a-8b4c-7640e6b2ac64.png'],
          video_url: '',
          rating: 5.0,
          rating_count: 56
        },
        'coloracao-premium': {
          id: 'coloracao-premium',
          name: 'Coloração Premium',
          subtitle: 'Transformação completa da cor',
          description: 'Serviço completo de coloração com produtos de alta qualidade que proporcionam cobertura perfeita e durabilidade excepcional. Inclui análise de fios e tratamento pré-coloração para resultados profissionais.',
          custom_price: 200.00,
          images: ['/lovable-uploads/f5c1b56b-2cb9-470a-8b4c-7640e6b2ac64.png'],
          video_url: '',
          rating: 4.8,
          rating_count: 32
        },
        'combo-liso-hidratacao': {
          id: 'combo-liso-hidratacao',
          name: 'Combo Liso + Hidratação',
          subtitle: 'Realinhamento + nutrição em um só serviço',
          description: 'Combinação perfeita do tratamento Liso Lambido com hidratação profunda, garantindo fios lisos, nutridos e com brilho intenso por mais tempo. O melhor dos dois mundos em uma única sessão.',
          custom_price: 220.00,
          images: ['/lovable-uploads/f5c1b56b-2cb9-470a-8b4c-7640e6b2ac64.png'],
          video_url: '',
          rating: 4.9,
          rating_count: 28
        },
        'kit-manutencao': {
          id: 'kit-manutencao',
          name: 'Kit Manutenção Liso',
          subtitle: 'Produtos para manter o liso em casa',
          description: 'Kit completo com shampoo, condicionador e leave-in específicos para manter o efeito do tratamento Liso Lambido por mais tempo em casa. Desenvolvido especialmente para prolongar os resultados.',
          custom_price: 120.00,
          images: ['/lovable-uploads/f5c1b56b-2cb9-470a-8b4c-7640e6b2ac64.png'],
          video_url: '',
          rating: 4.7,
          rating_count: 45
        }
      };

      const selectedTreatment = treatmentData[treatmentId as keyof typeof treatmentData];
      
      if (selectedTreatment) {
        setTreatment(selectedTreatment);
        
        // Produtos relacionados fictícios
        const related = Object.values(treatmentData)
          .filter(t => t.id !== treatmentId)
          .slice(0, 3);
        setRelatedTreatments(related);
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
          <div className="flex-1 p-8">
            <div className="h-full flex flex-col">
              {/* Imagem Principal */}
              <div className="flex-1 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt={treatment.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Miniaturas */}
              <div className="flex gap-2">
                {[
                  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
                  "https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
                  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                ].map((img, i) => (
                  <div key={i} className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={img}
                      alt={`${treatment.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Centro - Informações */}
          <div className="flex-1 p-8 max-w-md mx-auto">
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
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-black">
                    {showPrice ? formatPrice(treatment.custom_price) : 'R$ ****'}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrice(!showPrice)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showPrice ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {/* Botão Saiba Mais */}
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-full mb-4">
                Saiba mais...
              </Button>
            </div>
          </div>

          {/* Lado Direito - Vídeo */}
          <div className="flex-1 p-8">
            <div className="h-full bg-gray-100 rounded-lg overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
                alt="Vídeo demonstrativo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 rounded-full p-4">
                  <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Produtos Relacionados */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-6">
        <h3 className="text-lg font-semibold mb-4">Produtos Relacionados</h3>
        <div className="flex gap-4 overflow-x-auto">
          {[
            "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
            "https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
          ].map((img, i) => (
            <div key={i} className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={img}
                alt={`Produto relacionado ${i + 1}`}
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