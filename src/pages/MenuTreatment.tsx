import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [currentTreatmentIndex, setCurrentTreatmentIndex] = useState(0);
  const [allTreatments, setAllTreatments] = useState<Treatment[]>([]);

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
      
      const allTreatmentsList = Object.values(treatmentData);
      setAllTreatments(allTreatmentsList);
      
      if (selectedTreatment) {
        setTreatment(selectedTreatment);
        
        // Encontrar o índice do tratamento atual
        const currentIndex = allTreatmentsList.findIndex(t => t.id === treatmentId);
        setCurrentTreatmentIndex(currentIndex !== -1 ? currentIndex : 0);
        
        // Produtos relacionados fictícios
        const related = allTreatmentsList
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

  const truncateDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const nextTreatment = () => {
    const nextIndex = (currentTreatmentIndex + 1) % allTreatments.length;
    const nextTreatment = allTreatments[nextIndex];
    
    // Atualizar todos os dados para o próximo tratamento
    setCurrentTreatmentIndex(nextIndex);
    setTreatment(nextTreatment);
    setShowPrice(false); // Reset price visibility
    
    // Atualizar produtos relacionados
    const related = allTreatments
      .filter(t => t.id !== nextTreatment.id)
      .slice(0, 3);
    setRelatedTreatments(related);
  };

  const prevTreatment = () => {
    const prevIndex = (currentTreatmentIndex - 1 + allTreatments.length) % allTreatments.length;
    const prevTreatment = allTreatments[prevIndex];
    
    // Atualizar todos os dados para o tratamento anterior
    setCurrentTreatmentIndex(prevIndex);
    setTreatment(prevTreatment);
    setShowPrice(false); // Reset price visibility
    
    // Atualizar produtos relacionados
    const related = allTreatments
      .filter(t => t.id !== prevTreatment.id)
      .slice(0, 3);
    setRelatedTreatments(related);
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
          <img src="/lovable-uploads/4645a4ff-beda-4f6f-90f1-ea6a54167f18.png" alt="ARO" className="h-8" />
          <Button 
            onClick={onBack}
            variant="ghost"
            className="text-black hover:text-gray-600"
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
      <div className="h-full pt-20 overflow-hidden bg-black">
        <div className="max-w-7xl mx-auto px-6 py-8 relative">
          {/* Controles do Carrossel - Mais afastados */}
          <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 z-20">
            <Button
              onClick={prevTreatment}
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-white"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="absolute -right-16 top-1/2 transform -translate-y-1/2 z-20">
            <Button
              onClick={nextTreatment}
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-white"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            
            {/* Lado Esquerdo - Imagens e Produtos Relacionados */}
            <div className="lg:col-span-1 space-y-6">
              {/* Imagem Principal */}
              <div className="h-96 bg-gray-100 rounded-2xl overflow-hidden">
                <img 
                  src={treatment.images && treatment.images.length > 0 
                    ? treatment.images[0] 
                    : "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  }
                  alt={treatment.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Galeria de Miniaturas - Responsiva */}
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-3">
                {(treatment.images && treatment.images.length > 0 ? treatment.images : [
                  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
                  "https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
                  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                ]).slice(0, 6).map((img, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                    <img 
                      src={img}
                      alt={`${treatment.name} ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
              </div>
              
              {/* Produtos Relacionados - Responsivo */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Produtos Relacionados</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                  {relatedTreatments.slice(0, 4).map((related, i) => (
                    <div key={i} className="group cursor-pointer">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                        <img 
                          src={related.images && related.images.length > 0 
                            ? related.images[0] 
                            : "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                          }
                          alt={related.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h4 className="text-sm font-medium text-white truncate">{related.name}</h4>
                      <p className="text-xs text-gray-400">R$ {related.custom_price?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Centro - Informações */}
            <div className="lg:col-span-1">
              <div className="mb-3">
                <span className="text-sm text-gray-400 uppercase tracking-wide">Categoria</span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-white">{treatment.name}</h1>
              
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">{treatment.subtitle}</p>
              
              <div className="mb-6">
                <p className="text-gray-300 leading-relaxed text-base">
                  {truncateDescription(treatment.description, 330)}
                </p>
                {treatment.description.length > 330 && (
                  <Dialog open={isDescriptionExpanded} onOpenChange={setIsDescriptionExpanded}>
                    <DialogTrigger asChild>
                      <Button variant="link" className="p-0 h-auto text-yellow-400 hover:text-yellow-300 mt-2">
                        Ler mais
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-gray-900 text-white border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">{treatment.name}</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <p className="text-gray-300 leading-relaxed">
                          {treatment.description}
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              
              {/* Avaliações */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={`h-5 w-5 ${star <= treatment.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400">({treatment.rating_count})</span>
              </div>
              
              {/* Preço e Botões */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-400">de</span>
                  <span className="text-lg line-through text-gray-500">
                    {showPrice ? `R$ ${(treatment.custom_price * 1.5).toFixed(2)}` : 'R$ ********'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-white">
                      {showPrice ? formatPrice(treatment.custom_price) : 'R$ ********'}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPrice(!showPrice)}
                      className="text-gray-400 hover:text-gray-300 p-2"
                    >
                      {showPrice ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                  
                  {/* Botão Saiba Mais */}
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-full text-base font-medium">
                    Saiba mais...
                  </Button>
                </div>
              </div>
            </div>

            {/* Lado Direito - Vídeo */}
            <div className="lg:col-span-1">
              <div className="aspect-[9/16] bg-black rounded-2xl overflow-hidden relative z-30 h-[calc(100vh-12rem)]">
                <img 
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  alt="Vídeo demonstrativo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/70 rounded-full p-6 hover:bg-black/80 transition-colors cursor-pointer">
                    <div className="w-0 h-0 border-l-[24px] border-l-white border-t-[14px] border-t-transparent border-b-[14px] border-b-transparent ml-1"></div>
                  </div>
                </div>
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/50 rounded-lg p-3 flex items-center justify-between text-white text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span>0:19 / 0:19</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="hover:text-gray-300">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.824a1 1 0 01.617-.076zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button className="hover:text-gray-300">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                      </button>
                      <button className="hover:text-gray-300">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuTreatment;