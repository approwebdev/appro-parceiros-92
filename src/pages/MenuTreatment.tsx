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
  salon_phone?: string;
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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [currentTreatmentIndex, setCurrentTreatmentIndex] = useState(0);
  const [allTreatments, setAllTreatments] = useState<Treatment[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [treatmentCategory, setTreatmentCategory] = useState('');
  const [buttonColor, setButtonColor] = useState('#D4AF37');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (slug && (treatmentId || selectedCategory)) {
      fetchTreatment();
    }
  }, [slug, treatmentId, selectedCategory]);

  const fetchTreatment = async () => {
    try {
      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .select('id, phone')
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
        .neq('treatment_id', treatmentData.id)
        .limit(3);

      if (relatedError) {
        console.error('Error fetching related treatments:', relatedError);
      }

      const { data: categoryData } = await supabase
        .from('categories')
        .select('name')
        .eq('name', treatmentData.category)
        .maybeSingle();

      const fullTreatment = {
        ...treatmentData,
        custom_price: salonTreatmentData.custom_price,
        salon_phone: salonData.phone
      };

      setTreatmentCategory(categoryData?.name || treatmentData.category);
      setButtonColor(treatmentData.button_color || '#D4AF37');

      const relatedTreatments = relatedData?.map(item => ({
        ...item.treatments,
        custom_price: item.custom_price
      })) || [];

      setTreatment(fullTreatment);
      setRelatedTreatments(relatedTreatments);

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
          salon_phone: salonData.phone
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

  const truncateDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const nextTreatment = async () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    const carousel = document.querySelector('.carousel-container') as HTMLElement;
    
    if (carousel) {
      carousel.style.transform = 'translateX(-100%)';
      carousel.style.transition = 'transform 0.3s ease-out';
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const nextIndex = (currentTreatmentIndex + 1) % allTreatments.length;
    const nextTreatment = allTreatments[nextIndex];
    
    setCurrentTreatmentIndex(nextIndex);
    setTreatment(nextTreatment);
    setShowPrice(false);
    setCurrentImageIndex(0);
    
    const related = allTreatments
      .filter(t => t.id !== nextTreatment.id)
      .slice(0, 3);
    setRelatedTreatments(related);
    
    if (carousel) {
      carousel.style.transform = 'translateX(100%)';
      carousel.style.transition = 'none';
    }
    
    setTimeout(() => {
      if (carousel) {
        carousel.style.transform = 'translateX(0)';
        carousel.style.transition = 'transform 0.3s ease-out';
      }
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 50);
  };

  const prevTreatment = async () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    const carousel = document.querySelector('.carousel-container') as HTMLElement;
    
    if (carousel) {
      carousel.style.transform = 'translateX(100%)';
      carousel.style.transition = 'transform 0.3s ease-out';
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const prevIndex = (currentTreatmentIndex - 1 + allTreatments.length) % allTreatments.length;
    const prevTreatment = allTreatments[prevIndex];
    
    setCurrentTreatmentIndex(prevIndex);
    setTreatment(prevTreatment);
    setShowPrice(false);
    setCurrentImageIndex(0);
    
    const related = allTreatments
      .filter(t => t.id !== prevTreatment.id)
      .slice(0, 3);
    setRelatedTreatments(related);
    
    if (carousel) {
      carousel.style.transform = 'translateX(-100%)';
      carousel.style.transition = 'none';
    }
    
    setTimeout(() => {
      if (carousel) {
        carousel.style.transform = 'translateX(0)';
        carousel.style.transition = 'transform 0.3s ease-out';
      }
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 50);
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
    <div className="menu-container bg-white relative h-screen overflow-y-auto sm:landscape:overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 left-0 right-0 z-30 flex justify-between items-center p-4 md:p-6 bg-white border-b shadow-sm animate-fade-in">
        <div className="flex items-center gap-2 md:gap-4">
          <img src="/lovable-uploads/f77b22c2-a495-423a-bce4-4ddc7b37074d.png" alt="ARO" className="h-6 md:h-8 brightness-0" />
          <Button 
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-black hover:text-gray-600 p-1 md:p-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <button 
            className="text-black hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            onClick={() => {
              if (treatment.salon_phone) {
                const cleanPhone = treatment.salon_phone.replace(/\D/g, '');
                window.open(`https://wa.me/55${cleanPhone}`, '_blank');
              }
            }}
          >
            <Phone className="h-5 w-5 md:h-6 md:w-6 text-black" />
          </button>
          <button 
            className="text-black hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            onClick={() => window.open('https://instagram.com', '_blank')}
          >
            <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </button>
          <button 
            className="text-black hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            onClick={() => window.open('https://maps.google.com', '_blank')}
          >
            <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Carrossel horizontal */}
      <div className="relative h-auto sm:landscape:h-[calc(100vh-80px)] sm:landscape:overflow-hidden">
        {/* Controles do Carrossel */}
        <div className="hidden md:block absolute left-4 top-1/2 transform -translate-y-1/2 z-20">
          <Button
            onClick={prevTreatment}
            disabled={isTransitioning}
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-white disabled:opacity-50"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
          <Button
            onClick={nextTreatment}
            disabled={isTransitioning}
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-white disabled:opacity-50"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Controles do Carrossel Mobile */}
        <div className="md:hidden absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-4">
          <Button
            onClick={prevTreatment}
            disabled={isTransitioning}
            variant="outline"
            className="bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-white disabled:opacity-50 px-4 py-2 text-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          
          <Button
            onClick={nextTreatment}
            disabled={isTransitioning}
            variant="outline"
            className="bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-white disabled:opacity-50 px-4 py-2 text-sm"
          >
            Próximo
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Container do carrossel */}
        <div className="carousel-container w-full h-full transition-transform duration-300 ease-out">
          <div className="max-w-7xl mx-auto px-6 py-8 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-auto lg:h-full">
              
              {/* Lado Esquerdo - Imagens e Produtos Relacionados */}
              <div className="lg:col-span-1 space-y-6 overflow-y-auto sm:landscape:overflow-y-hidden sm:landscape:h-full">
                {/* Imagem Principal */}
                <div className="h-64 md:h-80 lg:h-96 bg-gray-100 rounded-xl overflow-hidden">
                  <img 
                    src={treatment.images && treatment.images.length > 0 
                      ? treatment.images[currentImageIndex] 
                      : "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                    }
                    alt={treatment.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Galeria de Miniaturas */}
                <div className="grid grid-cols-3 gap-2 p-2">
                  {(treatment.images && treatment.images.length > 0 ? treatment.images : [
                    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
                    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
                    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                  ]).slice(0, 3).map((img, i) => (
                    <div 
                      key={i} 
                      className={`aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all p-1 ${
                        i === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setCurrentImageIndex(i)}
                    >
                      <img 
                        src={img}
                        alt={`${treatment.name} ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform rounded-md"
                      />
                    </div>
                  ))}
                </div>
                
                 {/* Produtos Relacionados */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-black">Produtos Relacionados</h3>
                  <div className="flex gap-2 overflow-x-auto">
                    {relatedTreatments.slice(0, 3).map((related, i) => (
                      <div 
                        key={i} 
                        className="group cursor-pointer flex-shrink-0 w-24"
                        onClick={async () => {
                          if (isTransitioning) return;
                          
                          setIsTransitioning(true);
                          
                          const relatedIndex = allTreatments.findIndex(t => t.id === related.id);
                          if (relatedIndex !== -1) {
                            setCurrentTreatmentIndex(relatedIndex);
                            setTreatment(allTreatments[relatedIndex]);
                            setShowPrice(false);
                            setCurrentImageIndex(0);
                          }
                          
                          setTimeout(() => {
                            setIsTransitioning(false);
                          }, 300);
                        }}
                      >
                        <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden mb-2">
                          <img 
                            src={related.images && related.images.length > 0 
                              ? related.images[0] 
                              : "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                            }
                            alt={related.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <h4 className="text-xs font-medium text-black truncate leading-tight">{related.name}</h4>
                        <p className="text-xs text-gray-400">R$ {related.custom_price?.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Centro - Informações */}
              <div className="lg:col-span-1">
                <div className="mb-3">
                  <span className="text-sm text-gray-400 uppercase tracking-wide">{treatmentCategory}</span>
                </div>
                
                <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-black">{treatment.name}</h1>
                
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">{treatment.subtitle}</p>
                
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed text-base">
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
                      <div className="text-3xl font-bold text-black">
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
                    
                    <Button 
                      className="text-white px-8 py-3 rounded-full text-base font-medium hover:opacity-90 transition-all"
                      style={{ backgroundColor: buttonColor }}
                    >
                      Saiba mais...
                    </Button>
                  </div>
                </div>
              </div>

              {/* Lado Direito - Vídeo */}
              <div className="lg:col-span-1">
                <div className="aspect-[9/16] bg-black rounded-2xl overflow-hidden relative h-full max-h-[600px]">
                  <img 
                    src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                    alt="Vídeo demonstrativo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/70 rounded-full p-6 hover:bg-black/80 transition-all cursor-pointer">
                      <div className="w-0 h-0 border-l-[24px] border-l-white border-t-[14px] border-t-transparent border-b-[14px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                  
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
    </div>
  );
};

export default MenuTreatment;