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
  const [imagemAtiva, setImagemAtiva] = useState<string | null>(null);
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
          .limit(1)
          .maybeSingle();
        treatmentData = result.data;
        treatmentError = result.error;
      }

      if (treatmentError || !treatmentData) {
        setLoading(false);
        return;
      }

      const { data: salonTreatmentData, error: salonTreatmentError } = await supabase
        .from('salon_treatments')
        .select('custom_price, is_active')
        .eq('salon_id', salonData.id)
        .eq('treatment_id', treatmentData.id)
        .maybeSingle();

      if (salonTreatmentError || !salonTreatmentData) {
        setLoading(false);
        return;
      }

      const { data: relatedData, error: relatedError } = await supabase
        .from('salon_treatments')
        .select(`
          custom_price,
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
          )
        `)
        .eq('salon_id', salonData.id)
        .eq('is_active', true)
        .neq('treatment_id', treatmentData.id);

      if (relatedError) {
        console.error('Error fetching related treatments:', relatedError);
      }

      const { data: categoryData } = await supabase
        .from('categories')
        .select('name')
        .eq('name', treatmentData.category)
        .maybeSingle();

      // Montar endereço completo para exibição
      const fullAddress = [salonData.address, salonData.city, salonData.state, salonData.postal_code]
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
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
      ];
      
      fullTreatment.images = fullTreatment.images && fullTreatment.images.length > 0 
        ? fullTreatment.images 
        : imagensGaleria;

      // Definir a primeira imagem como ativa
      setImagemAtiva(fullTreatment.images[0]);

      const { data: allTreatmentsData, error: allTreatmentsError } = await supabase
        .from('salon_treatments')
        .select(`
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
          ),
          custom_price
        `)
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
  const navigateToTreatment = (treatmentData: Treatment) => {
    setTreatment(treatmentData);
    setImagemAtiva(treatmentData.images?.[0] || null);
    setShowPrice(false);
    setTreatmentCategory(treatmentData.category || '');
    setButtonColor(treatmentData.button_color || '#D4AF37');
    
    // Atualizar tratamentos relacionados
    const related = allTreatments
      .filter(t => t.id !== treatmentData.id)
      .slice(0, 8);
    setRelatedTreatments(related);
    
    // Rolar para o topo
    window.scrollTo(0, 0);
  };

  // Função para navegação do carrossel
  const nextSlide = () => {
    const isMobile = window.innerWidth < 768;
    const maxSlides = isMobile ? 3 : 4;
    if (slideIndex + maxSlides < relatedTreatments.length) {
      setSlideIndex(slideIndex + 1);
    }
  };

  const prevSlide = () => {
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
    }
  };

  // Handlers para arrastar o carrossel
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carrosselRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - carrosselRef.current.offsetLeft);
    setScrollLeft(carrosselRef.current.scrollLeft);
    carrosselRef.current.style.cursor = 'grabbing';
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!carrosselRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carrosselRef.current.offsetLeft);
    setScrollLeft(carrosselRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (carrosselRef.current) {
      carrosselRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carrosselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carrosselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carrosselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carrosselRef.current) return;
    const x = e.touches[0].pageX - carrosselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carrosselRef.current.scrollLeft = scrollLeft - walk;
  };

  // Função para compartilhar
  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  const shareToSocial = (network: string) => {
    const url = window.location.href;
    const title = treatment ? treatment.name : 'Tratamento';
    const description = treatment ? treatment.subtitle : 'Confira esse tratamento';
    
    let shareUrl = '';

    switch (network) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${description} ${url}`)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'pinterest':
        const imageUrl = treatment && treatment.images && treatment.images.length > 0 ? treatment.images[0] : '';
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(title)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description} ${url}`)}`;
        break;
      default:
        navigator.clipboard.writeText(url)
          .then(() => alert('Link copiado para a área de transferência!'))
          .catch(err => console.error('Erro ao copiar link: ', err));
        setShowShareOptions(false);
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareOptions(false);
  };

  if (loading) return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#1A1A1A]"></div>
    </div>
  );

  if (!treatment) return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold text-red-600">Tratamento não encontrado</h2>
      <Button onClick={onBack} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
        Voltar
      </Button>
    </div>
  );

  const slides = [treatment, ...relatedTreatments];

  return (
    <div className="w-full min-h-screen bg-white">
      {/* CONTAINER PRINCIPAL DO HEADER - NÃO FIXO */}
      <motion.div 
        className="relative w-full pt-[clamp(2rem,4vh,4rem)] sm:pt-[clamp(3rem,5vh,4rem)]" 
        style={{ height: "clamp(80px, 10vh, 140px)" }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center w-full h-full px-4 sm:px-[8%]">
          {/* LOGO + BOTÃO VOLTAR */}
          <motion.div 
            className="flex items-center" 
            style={{ gap: "clamp(1rem, 2vw, 2rem)" }}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative" style={{ width: "clamp(70px, 6vw, 120px)" }}>
              <img
                src="/lovable-uploads/f77b22c2-a495-423a-bce4-4ddc7b37074d.png"
                alt="Logo ARO"
                className="w-full h-auto brightness-0"
              />
            </div>
            
            <motion.button
              onClick={onBack}
              className="group flex items-center transform transition-all duration-200 ease-in-out hover:scale-110"
              style={{ gap: "clamp(0.2rem, 0.4vw, 0.5rem)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <ArrowLeft 
                style={{ width: "clamp(14px, 1vw, 20px)", height: "auto" }}
                className="text-black"
              />
              <span 
                style={{ fontSize: "clamp(0.75rem, 1vw, 1rem)" }}
                className="text-black hidden sm:inline"
              >
                Voltar
              </span>
            </motion.button>
          </motion.div>

          {/* WHATSAPP + INSTAGRAM + MAPS */}
          <motion.div 
            className="flex items-center relative" 
            style={{ gap: "clamp(1rem, 1.5vw, 1.8rem)" }}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <button 
              className="group transform transition-all duration-200 ease-in-out hover:scale-110"
              onClick={() => {
                if (treatment.salon_phone) {
                  const cleanPhone = treatment.salon_phone.replace(/\D/g, '');
                  window.open(`https://wa.me/55${cleanPhone}`, '_blank');
                }
              }}
            >
               <FaWhatsapp
                 className="transition-all duration-200 text-black"
                 style={{ 
                   width: "clamp(24px, 2vw, 32px)", 
                   height: "auto"
                 }}
               />
            </button>

            <button 
              className="group transform transition-all duration-200 ease-in-out hover:scale-110"
              onClick={() => {
                const instagram = treatment?.salon_instagram;
                if (instagram) {
                  window.open(`https://instagram.com/${instagram.replace('@', '')}`, '_blank');
                } else {
                  window.open('https://instagram.com', '_blank');
                }
              }}
            >
              <svg className="transition-all duration-200 text-black" style={{ width: "clamp(24px, 2vw, 32px)", height: "auto" }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </button>

            <button 
              className="group transform transition-all duration-200 ease-in-out hover:scale-110"
              onClick={() => {
                const address = treatment?.salon_address;
                if (address) {
                  window.open(`https://maps.google.com/maps?q=${encodeURIComponent(address)}`, '_blank');
                } else {
                  window.open('https://maps.google.com', '_blank');
                }
              }}
            >
              <svg className="transition-all duration-200 text-black" style={{ width: "clamp(24px, 2vw, 32px)", height: "auto" }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* BOTÕES DE NAVEGAÇÃO MOBILE - FORA DO HEADER */}
      <div className="block md:hidden w-full py-4">
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setSlideIndex(Math.max(0, slideIndex - 1))}
            disabled={slideIndex === 0}
            className="px-6 py-3 bg-black text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Anterior
          </button>
          <button
            onClick={() => setSlideIndex(Math.min(slides.length - 1, slideIndex + 1))}
            disabled={slideIndex === slides.length - 1}
            className="px-6 py-3 bg-black text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Próximo
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <motion.div className="relative w-full h-[calc(100vh-clamp(80px,10vh,140px))] overflow-hidden">
        <div className="flex h-full" style={{ transform: `translateX(-${slideIndex*100}%)`, transition: 'transform 0.5s ease' }}>
          {slides.length > 0 ? slides.map((item, idx) => {
            if (!item || typeof item !== 'object') return null;
            
            return (
              <div key={idx} className="w-full flex-shrink-0 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] h-full gap-0">
                {/* Galeria e detalhes */}
                <div className="flex flex-col h-full justify-start lg:justify-start px-4 sm:px-6 overflow-y-auto lg:overflow-hidden pb-20 lg:pb-0">
                  <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 w-full justify-center mt-4 lg:mt-0 lg:px-4 lg:pt-[5%]">
                    {/* Galeria */}
                    <div className="flex flex-col items-center justify-start w-full lg:w-1/2">
                      <div className="w-full max-w-md mx-auto">
                        {/* Imagem principal */}
                         <div className="rounded-xl shadow-lg overflow-hidden bg-gray-50 mb-4 w-[280px] mx-auto">
                           <img
                             src={imagemAtiva || (item.images && item.images.length > 0 ? item.images[0] : "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80")}
                             alt={typeof item.name === 'string' ? item.name : 'Tratamento'}
                             className="w-full h-[400px] object-cover"
                           />
                         </div>
                        
                        {/* Miniaturas */}
                        {item.images && item.images.length > 1 && (
                          <div className="flex gap-2 flex-wrap justify-center">
                            {item.images.map((img, imgIdx) => (
                              <button
                                key={imgIdx}
                                onClick={() => setImagemAtiva(img)}
                                className={`
                                  w-16 h-16 
                                  rounded-lg 
                                  ${imagemAtiva === img ? 'border-2 border-black' : 'border border-gray-200'}
                                  overflow-hidden
                                `}
                              >
                                <img
                                  src={img}
                                  alt={`Foto ${imgIdx+1}`}
                                  className="w-full h-full object-cover p-1"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Texto + Preço */}
                    <div className="flex flex-col gap-2 sm:gap-3 w-full lg:w-1/2 justify-start lg:justify-start mt-4 lg:mt-0">{/* Remover sticky */}
                      <p className="text-[clamp(0.85rem,1.2vw,1rem)] uppercase font-medium text-gray-500">
                        {typeof item.category === 'string' ? item.category : treatmentCategory}
                      </p>
                      <h1 className="text-[clamp(1.5rem,3vw,3rem)] font-bold text-black">
                        {typeof item.name === 'string' ? item.name : 'Nome do tratamento'}
                      </h1>
                      <h2 className="text-[clamp(1.1rem,1.8vw,1.5rem)] font-semibold text-gray-800">
                        {typeof item.subtitle === 'string' ? item.subtitle : ''}
                      </h2>
                       <div className="text-[clamp(0.9rem,1.2vw,1rem)] text-gray-700 leading-relaxed">
                         <p className="line-clamp-3 lg:line-clamp-5">
                           {typeof item.description === 'string' ? item.description : ''}
                         </p>
                         {typeof item.description === 'string' && item.description.length > 200 && (
                           <Dialog>
                             <DialogTrigger asChild>
                               <button className="text-sm mt-1 underline" style={{ color: '#8B4513' }}>
                                 Ler mais
                               </button>
                             </DialogTrigger>
                             <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                               <DialogHeader>
                                 <DialogTitle className="text-xl font-bold mb-4">
                                   {typeof item.name === 'string' ? item.name : 'Descrição completa'}
                                 </DialogTitle>
                               </DialogHeader>
                               <div className="prose max-w-none">
                                 <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                   {item.description}
                                 </p>
                               </div>
                             </DialogContent>
                           </Dialog>
                         )}
                       </div>

                      {/* Avaliações */}
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-[clamp(14px,1.2vw,20px)] h-[clamp(14px,1.2vw,20px)] ${
                              i < (typeof item.rating === 'number' ? item.rating : 5) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            } hover:scale-110 transition-all duration-300`}
                          />
                        ))}
                        <span className="text-[clamp(0.85rem,1.2vw,1rem)] text-gray-600 ml-1 sm:ml-2">
                          ({typeof item.rating_count === 'number' ? item.rating_count : 56})
                        </span>
                        <div className="relative ml-auto">
                          <FaShareAlt
                            className="w-[clamp(14px,1.2vw,20px)] h-[clamp(14px,1.2vw,20px)] text-gray-500 hover:text-gray-700 hover:scale-110 cursor-pointer transition-all duration-300"
                            onClick={handleShare}
                          />
                          
                          {/* Menu de opções de compartilhamento */}
                          {showShareOptions && (
                            <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-50">
                              <button 
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center" 
                                onClick={() => shareToSocial('whatsapp')}
                              >
                                <FaWhatsapp className="mr-2 text-green-500 text-lg" /> WhatsApp
                              </button>
                              <button 
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center" 
                                onClick={() => shareToSocial('facebook')}
                              >
                                <FaFacebookF className="mr-2 text-blue-600 text-lg" /> Facebook
                              </button>
                              <button 
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center" 
                                onClick={() => shareToSocial('twitter')}
                              >
                                <FaTwitter className="mr-2 text-blue-400 text-lg" /> Twitter
                              </button>
                              <button 
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center" 
                                onClick={() => shareToSocial('pinterest')}
                              >
                                <FaPinterestP className="mr-2 text-red-600 text-lg" /> Pinterest
                              </button>
                              <button 
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center" 
                                onClick={() => shareToSocial('email')}
                              >
                                <FaEnvelope className="mr-2 text-gray-500 text-lg" /> Email
                              </button>
                              <button 
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center" 
                                onClick={() => shareToSocial('copy')}
                              >
                                <FaCopy className="mr-2 text-gray-600 text-lg" /> Copiar link
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Preço */}
                      <div className="border-t pt-2 sm:pt-3 mt-2 sm:mt-3">
                        <div className="flex items-start justify-between gap-2 sm:gap-4">{/* Voltar ao layout desktop original */}
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 sm:gap-4 mb-2">
                              <span className="text-[clamp(0.95rem,1.2vw,1.125rem)] text-gray-400">
                                {showPrice ? (
                                  <span className="line-through">
                                    de {formatPrice((typeof item.custom_price === 'number' ? item.custom_price : 0) * 1.5)}
                                  </span>
                                ) : (
                                  "de ********"
                                )}
                              </span>
                               <button 
                                 onClick={() => setShowPrice(!showPrice)}
                                 className="transform hover:scale-110 transition-all duration-300"
                               >
                                 {showPrice ? (
                                   <Eye className="w-[clamp(24px,2vw,32px)] h-[clamp(24px,2vw,32px)] text-gray-600" />
                                 ) : (
                                   <EyeOff className="w-[clamp(24px,2vw,32px)] h-[clamp(24px,2vw,32px)] text-gray-600" />
                                 )}
                               </button>
                            </div>
                            <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold text-black">{/* Voltar ao tamanho original do preço */}
                              {showPrice ? (
                                formatPrice(typeof item.custom_price === 'number' ? item.custom_price : 0)
                              ) : (
                                "R$ ******"
                              )}
                            </h2>
                          </div>
                          <button 
                            style={{ 
                              backgroundColor: buttonColor,
                              color: 'white'
                            }}
                            className="
                            hover:opacity-90
                            px-[clamp(1rem,1.5vw,1.5rem)] py-[clamp(0.5rem,0.8vw,0.75rem)]
                            rounded-full shadow
                            transition-all duration-300
                            hover:scale-105
                            text-[clamp(0.85rem,1.2vw,1rem)] font-medium
                            self-end
                            whitespace-nowrap
                            "
                          >
                            {typeof item.button_text === 'string' ? item.button_text : 'Saiba mais...'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TRATAMENTOS RELACIONADOS */}
                  {relatedTreatments.length > 0 && (
                    <div className="mt-8">
                      <div className="flex flex-col items-center">
                        <h2 className="text-xl md:text-2xl font-bold text-black mb-4 md:mb-6 text-center">Tratamentos Relacionados</h2>
                        
                        {/* DESKTOP - Layout com alinhamento à direita do vídeo */}
                        <div className="hidden md:block relative">
                          {/* Controles de navegação */}
                          <div className="flex justify-between items-center mb-4 w-full max-w-5xl mx-auto">
                            <button
                              onClick={prevSlide}
                              disabled={slideIndex === 0}
                              className="bg-white/90 backdrop-blur rounded-full p-3 shadow-lg hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                              </svg>
                            </button>
                            <button
                              onClick={nextSlide}
                              disabled={slideIndex + 4 >= relatedTreatments.length}
                              className="bg-white/90 backdrop-blur rounded-full p-3 shadow-lg hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                              </svg>
                            </button>
                          </div>
                          
                          {/* Grid de 4 itens */}
                          <div className="grid grid-cols-4 gap-6 max-w-5xl mx-auto">
                            {relatedTreatments.slice(slideIndex, slideIndex + 4).map((relatedTreatment, index) => (
                              <button
                                key={`${relatedTreatment.id}-${index}`}
                                onClick={() => navigateToTreatment(relatedTreatment)}
                                className="group transition-all duration-300 hover:scale-105"
                              >
                                <div className="w-full aspect-square bg-gray-100 rounded-2xl mb-3 overflow-hidden">
                                  {relatedTreatment.images && relatedTreatment.images.length > 0 ? (
                                    <img
                                      src={relatedTreatment.images[0]}
                                      alt={relatedTreatment.name}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <h3 className="text-sm font-medium text-gray-800 text-center">
                                  {relatedTreatment.name}
                                </h3>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* MOBILE - Layout centralizado com 3 itens */}
                        <div className="md:hidden">
                          {/* Controles mais próximos */}
                          <div className="flex justify-center gap-8 mb-6">
                            <button
                              onClick={prevSlide}
                              disabled={slideIndex === 0}
                              className="bg-white/90 backdrop-blur rounded-full p-3 shadow-lg hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                              </svg>
                            </button>
                            <button
                              onClick={nextSlide}
                              disabled={slideIndex + 3 >= relatedTreatments.length}
                              className="bg-white/90 backdrop-blur rounded-full p-3 shadow-lg hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                              </svg>
                            </button>
                          </div>
                          
                          {/* Grid centralizado de 3 itens */}
                          <div className="grid grid-cols-3 gap-4 justify-center max-w-sm mx-auto">
                            {relatedTreatments.slice(slideIndex, slideIndex + 3).map((relatedTreatment, index) => (
                              <button
                                key={`${relatedTreatment.id}-${index}`}
                                onClick={() => navigateToTreatment(relatedTreatment)}
                                className="group transition-all duration-300 hover:scale-105"
                              >
                                <div className="w-full aspect-square bg-gray-100 rounded-xl mb-2 overflow-hidden">
                                  {relatedTreatment.images && relatedTreatment.images.length > 0 ? (
                                    <img
                                      src={relatedTreatment.images[0]}
                                      alt={relatedTreatment.name}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <h3 className="text-xs font-medium text-gray-800 text-center line-clamp-2">
                                  {relatedTreatment.name}
                                </h3>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Vídeo em Desktop */}
                <div className="hidden lg:flex items-start justify-center h-full relative overflow-visible pt-[2%]">
                  {/* Imagem de fundo expandida */}
                  <div 
                    className="absolute inset-0 bg-no-repeat bg-center opacity-30 z-0"
                    style={{
                      backgroundImage: `url(/lovable-uploads/1ac586b1-3175-4a7d-8e81-692161f57930.png)`,
                      backgroundSize: 'contain',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                  
                  <div className="w-[clamp(225px,35.975vw,411px)] aspect-[9/16] rounded-2xl overflow-hidden shadow-xl relative z-10 hover:shadow-2xl transition-all duration-300 bg-gray-100 scale-95">
                    {typeof item.video_url === 'string' && item.video_url ? (
                      <video className="w-full h-full object-cover" controls>
                        <source src={item.video_url} type="video/mp4" />
                        Seu navegador não suporta vídeos.
                      </video>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <p className="text-gray-500 text-center p-4">Vídeo não disponível</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-xl text-gray-500">Carregando tratamento...</p>
            </div>
          )}
        </div>
        
        {/* Controles do slider removidos */}
      </motion.div>
    </div>
  );
};

export default MenuTreatment;