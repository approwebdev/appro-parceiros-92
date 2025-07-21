import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MenuCategoriesProps {
  onBack: () => void;
  onCategorySelect: (category: string, treatmentId: string) => void;
}

const MenuCategories = ({ onBack, onCategorySelect }: MenuCategoriesProps) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const constraintsRef = useRef(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        console.log("Iniciando carregamento das categorias...");
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('order_position');

        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log("Categorias carregadas:", data);
          setCategorias(data || []);
        } else {
          setCategorias([]);
        }
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, []);

  const total = categorias.length;

  const getSlides = () => {
    let slides = [];
    for (let i = 0; i < total; i++) {
      slides.push({ ...categorias[i], position: i });
    }
    return slides;
  };

  const next = () => {
    setCurrentIndex((prev) => {
      if (prev >= total - (isMobile ? 1 : 4)) return prev;
      return prev + 1;
    });
  };

  const prev = () => {
    setCurrentIndex((prev) => {
      if (prev <= 0) return prev;
      return prev - 1;
    });
  };

  const handleDragStart = (event, info) => {
    setDragStartX(info.point.x);
  };

  const handleDragEnd = (event, info) => {
    const dragEndX = info.point.x;
    const diff = dragStartX - dragEndX;

    // Detectar arrastos significativos (mais de 50px)
    if (Math.abs(diff) > 50) {
      // Movimentar apenas 1 slide por vez, independente da distância arrastada
      if (diff > 0) {
        // Arrastar para a esquerda (próximo slide)
        next();
      } else {
        // Arrastar para a direita (slide anterior)
        prev();
      }
    } else {
      // Se o arrasto foi pequeno, voltar para a posição original
      // Reset animado para a posição atual
      const container = constraintsRef.current;
      if (container) {
        container.style.transition = 'transform 0.3s ease';
        container.style.transform = isMobile 
          ? `translateX(${-currentIndex * 100}%)` 
          : `translateX(${-currentIndex * 25}%)`;
      }
    }
  };

  // Função para ir para a página de catálogo
  const handleHomeClick = () => {
    onBack();
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black text-white font-figtree relative">
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-500/80 text-white p-4 rounded-lg z-50">
          Erro ao carregar dados: {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : categorias.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-xl">Nenhuma categoria encontrada</div>
        </div>
      ) : (
        <>
          {!isMobile && total > 4 && (
            <>
              <motion.button
                onClick={prev}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 text-white p-4 rounded-full bg-black/50 transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <FaChevronLeft size={24} />
              </motion.button>
              <motion.button
                onClick={next}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 text-white p-4 rounded-full bg-black/50 transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <FaChevronRight size={24} />
              </motion.button>
            </>
          )}

          <motion.div 
            className={`flex h-full ${isMobile ? 'gap-4 px-2' : 'gap-0'}`}
            ref={constraintsRef}
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{
              x: isMobile ? `calc(${currentIndex * -100}% + ${currentIndex * 8}px)` : currentIndex * -25 + "%",
              paddingRight: isMobile ? '50%' : '0',
            }}
            animate={{
              x: isMobile ? `calc(${currentIndex * -100}% + ${currentIndex * 8}px)` : currentIndex * -25 + "%",
              opacity: 1
            }}
            initial={{ opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              duration: 0.4
            }}
          >
            {getSlides().map((cat, index) => (
              <motion.div
                key={cat.id}
                className={`relative ${isMobile ? 'w-[100%] flex-shrink-0' : 'w-[25%] flex-shrink-0'} h-full overflow-hidden cursor-pointer group`}
                onClick={() => {
                  onCategorySelect(cat.name, cat.name);
                }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
              >
                <motion.img
                  src={cat.cover_image_url || '/lovable-uploads/058b2b94-b909-437a-a7ca-7630a654016f.png'}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-90"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  onError={(e) => {
                    console.log('Erro ao carregar imagem:', cat.cover_image_url);
                    (e.target as HTMLImageElement).src = '/lovable-uploads/058b2b94-b909-437a-a7ca-7630a654016f.png';
                  }}
                />
                <motion.div
                  className="absolute top-9 left-6 text-black font-bold bg-white/0 px-4 py-2 rounded-xl"
                  style={{
                    fontSize: "clamp(1.8rem,3vw,2.8rem)",
                  }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {cat.name}
                </motion.div>
                
                {/* Overlay de hover */}
                <motion.div
                  className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Dots para mobile */}
          {isMobile && total > 1 && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex gap-2">
              {Array.from({ length: total }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          <motion.button
            onClick={handleHomeClick}
            className="absolute bottom-8 left-8 z-50 p-3 rounded-full bg-black/50 hover:scale-110 transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Home className="w-6 h-6 text-white" />
          </motion.button>
        </>
      )}
    </div>
  );
};

export default MenuCategories;