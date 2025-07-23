import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Star, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FaWhatsapp, FaFacebookF, FaTwitter, FaPinterestP, FaEnvelope, FaCopy, FaShareAlt, FaBell } from "react-icons/fa";

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
  salon_phone?: string;
  salon_instagram?: string;
  salon_address?: string;
  category?: string;
  button_color?: string;
  button_text?: string;
  short_description?: string;
}

interface MenuTreatmentProps {
  onBack: () => void;
  treatmentId: string;
  selectedCategory: string;
}

const MenuTreatment = ({ onBack, treatmentId, selectedCategory }: MenuTreatmentProps) => {
  const { slug } = useParams<{ slug: string }>();
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [relatedTreatments, setRelatedTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPrice, setShowPrice] = useState(false);
  const [currentTreatmentIndex, setCurrentTreatmentIndex] = useState(0);
  const [allTreatments, setAllTreatments] = useState<Treatment[]>([]);
  const [treatmentCategory, setTreatmentCategory] = useState('');
  const [buttonColor, setButtonColor] = useState('#D4AF37');
  const [imageAtiva, setImageAtiva] = useState<string | null>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const carrosselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (slug && (treatmentId || selectedCategory)) {
      fetchTreatment();
    }
  }, [slug, treatmentId, selectedCategory]);

  const fetchTreatment = async () => {
    try {
      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .select('id, phone, instagram, address, city, state, postal_code')
        .eq('slug', slug)
        .maybeSingle();

      if (salonError || !salonData) {
        setLoading(false);
        return;
      }

      let treatmentData;
      let treatmentError;

      if (treatmentId) {
        const result = await supabase
          .from('treatments')
          .select('*')
          .eq('id', treatmentId)
          .maybeSingle();
        
        treatmentData = result.data;
        treatmentError = result.error;
      } else if (selectedCategory) {
        const result = await supabase
          .from('treatments')
          .select('*')
          .ilike('category', `%${selectedCategory.toLowerCase()}%`)
          .eq('is_active', true)
          .limit(1);
        
        treatmentData = result.data;
        treatmentError = result.error;
      }

      if (treatmentError || !treatmentData) {
        setLoading(false);
        return;
      }

      const { data: salonTreatmentData, error: salonTreatmentError } = await supabase
        .from('salon_treatments')
        .select(
          `custom_price,
          treatments!inner (
            id,
            name,
            subtitle,
            description,
            images,
            video_url,
            rating,
            rating_count,
            category
          )`
        )
        .eq('salon_id', salonData.id)
        .eq('treatment_id', treatmentData.id);

      if (salonTreatmentError || !salonTreatmentData) {
        console.error('Error fetching related treatments:', salonTreatmentError);
      }

      const { data: categoryData } = await supabase
        .from('categories')
        .select('name')
        .eq('name', treatmentData.category)
        .maybeSingle();

      // Montar endereço completo para exibição
      const fullAddress = [salonData.phone, salonData.address, salonData.city, salonData.state, salonData.postal_code]
        .filter(Boolean)
        .join(', ');

      const fullTreatment = {
        ...treatmentData,
        custom_price: salonTreatmentData.custom_price,
        salon_phone: salonData.phone,
        salon_instagram: salonData.instagram,
        salon_address: fullAddress
      };

      setTreatmentCategory(categoryData?.name || treatmentData.category || '');
      setButtonColor(treatmentData.button_color || '#D4AF37');

      // Filtrar tratamentos da mesma categoria e randomizar
      const sameCategoryTreatments = relatedData?.filter(item =>
        item.treatments.category === treatmentData.category
      ).map(item => ({
        ...item.treatments,
        custom_price: item.custom_price
      })) || [];

      // Randomizar a ordem dos tratamentos
      const shuffledTreatments = sameCategoryTreatments.sort(() => Math.random() - 0.5);
      const relatedTreatments = shuffledTreatments;

      setTreatment(fullTreatment);
      setRelatedTreatments(relatedTreatments);

      // Adicionar imagens de exemplo se não houver imagens
      const imagensGaleria = [
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1726&q=80",
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
      ];

      fullTreatment.images = fullTreatment.images && fullTreatment.images.length > 0
        ? fullTreatment.images
        : imagensGaleria;

      // Definir a primeira imagem como ativa
      setImageAtiva(fullTreatment.images[0]);

      const { data: allTreatmentsData, error: allTreatmentsError } = await supabase
        .from('salon_treatments')
        .select(
          `treatments!inner (
            id,
            name,
            subtitle,
            description,
            images,
            video_url,
            rating,
            rating_count,
            category
          ),
          custom_price`
        )
        .eq('salon_id', salonData.id)
        .eq('is_active', true);

      if (!allTreatmentsError) {
        const allFormattedTreatments = allTreatmentsData?.map(item => ({
          ...item.treatments,
          custom_price: item.custom_price,
          salon_phone: salonData.phone,
          salon_instagram: salonData.instagram,
          salon_address: fullAddress
        })) || [];

        setAllTreatments(allFormattedTreatments);
        const currentIndex = allFormattedTreatments.findIndex(t => t.id === treatmentData.id);
        setCurrentTreatmentIndex(currentIndex !== -1 ? currentIndex : 0);
      }
    } catch (error) {
      console.error('Error fetching treatment:', error);
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

  // Função para navegar para outro tratamento
  const navigateToTreatment = (newTreatment: Treatment) => {
    setTreatment(newTreatment);
    setImageAtiva(newTreatment.images[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevSlide = () => {
    setSlideIndex(prev => Math.max(0, prev - 1));
  };

  const nextSlide = () => {
    setSlideIndex(prev => Math.min(prev + 1, relatedTreatments.length - 3));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!treatment) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tratamento não encontrado</h2>
          <Button onClick={onBack} className="bg-gray-900 hover:bg-gray-800 text-white">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container mx-auto px-4 py-6 max-w-7xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onBack}
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Voltar
          </Button>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <Phone size={16} className="mr-2" />
              Contato
            </Button>
          </div>
        </div>

        {/* Conteúdo principal - LAYOUT MODIFICADO */}
        <div className="lg:flex lg:gap-8 lg:items-start">
          {treatment ? (
            <>
              {/* Container da esquerda: Imagem + Tratamentos Relacionados */}
              <div className="lg:w-1/3 space-y-8">
                {/* Galeria de imagens */}
                <div className="space-y-4">
                  {/* Imagem principal */}
                  <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                    <img
                      src={imageAtiva || treatment.images[0]}
                      alt={treatment.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Miniaturas */}
                  <div className="grid grid-cols-4 gap-2">
                    {treatment.images.slice(0, 4).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setImageAtiva(image)}
                        className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                          imageAtiva === image ? 'border-gray-900' : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${treatment.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tratamentos Relacionados - MOVIDO PARA BAIXO DA IMAGEM */}
                {relatedTreatments && relatedTreatments.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Tratamentos Relacionados</h2>
                    
                    <div className="space-y-4">
                      {relatedTreatments.slice(0, 3).map((relatedTreatment, index) => (
                        <button
                          key={`${relatedTreatment.id}-${index}`}
                          onClick={() => navigateToTreatment(relatedTreatment)}
                          className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 text-left"
                        >
                          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {relatedTreatment.images && relatedTreatment.images.length > 0 ? (
                              <img
                                src={relatedTreatment.images[0]}
                                alt={relatedTreatment.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {relatedTreatment.name}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {relatedTreatment.subtitle || 'Tratamento disponível'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Container do centro: Informações do produto */}
              <div className="lg:w-1/3 space-y-6 lg:px-4">
                {/* Categoria */}
                <div className="text-sm text-gray-500 uppercase tracking-wide">
                  {treatmentCategory}
                </div>

                {/* Nome do tratamento */}
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {treatment.name}
                  </h1>
                  {treatment.subtitle && (
                    <p className="text-xl text-gray-600">{treatment.subtitle}</p>
                  )}
                </div>

                {/* Descrição */}
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {treatment.description}
                  </p>
                  <button className="text-blue-600 hover:text-blue-800 font-medium mt-2">
                    Ler mais
                  </button>
                </div>

                {/* Avaliações */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < treatment.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({treatment.rating_count || 0} avaliações)
                  </span>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <FaBell size={14} className="mr-2" />
                    Compartilhar
                  </Button>
                </div>

                {/* Preço */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                      de <span className="line-through">R$ ******</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPrice(!showPrice)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {showPrice ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  
                  <div className="text-3xl font-bold text-gray-900">
                    {showPrice ? formatPrice(treatment.custom_price) : 'R$ ******'}
                  </div>
                  
                  <Button
                    className="w-full text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-105"
                    style={{ backgroundColor: buttonColor }}
                  >
                    {treatment.button_text || 'Saiba mais...'}
                  </Button>
                </div>
              </div>

              {/* Container da direita: Vídeo */}
              <div className="lg:w-1/3 lg:flex lg:justify-center">
                {/* Vídeo - ALTURA AJUSTADA PARA ALINHAR COM TRATAMENTOS RELACIONADOS */}
                <div className="aspect-[9/16] bg-gray-100 rounded-2xl overflow-hidden max-w-sm w-full">
                  {typeof treatment.video_url === 'string' && treatment.video_url ? (
                    <video className="w-full h-full object-cover" controls>
                      <source src={treatment.video_url} type="video/mp4" />
                      Seu navegador não suporta vídeos.
                    </video>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-gray-500 text-center p-4">Vídeo não disponível</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-center py-12">
              <p className="text-xl text-gray-500">Carregando tratamento...</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MenuTreatment;