import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LocationDialog } from "@/components/ui/location-dialog";
import { Phone, Instagram, MapPin, Bell } from "lucide-react";
import { motion } from "framer-motion";
interface Salon {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  instagram: string;
}
interface MenuDigitalProps {
  onEnter: () => void;
}
const MenuDigital = ({
  onEnter
}: MenuDigitalProps) => {
  const {
    slug
  } = useParams<{
    slug: string;
  }>();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (slug) {
      fetchSalon();
    }
  }, [slug]);
  const fetchSalon = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('salons').select('*').eq('slug', slug).maybeSingle();
      if (error) {
        return;
      }
      setSalon(data);
    } catch (error) {} finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="h-screen w-screen bg-menu-dark flex items-center justify-center overflow-hidden">
        <div className="animate-spin rounded-full border-b-2 border-gold" style={{
        width: 'clamp(2rem, 4vw, 8rem)',
        height: 'clamp(2rem, 4vw, 8rem)'
      }}></div>
      </div>;
  }
  if (!salon) {
    return <div className="h-screen w-screen bg-menu-dark flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <h2 className="font-bold text-white mb-4" style={{
          fontSize: 'clamp(1.5rem, 3vw, 2rem)'
        }}>Salão não encontrado</h2>
          <p className="text-gray-400" style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)'
        }}>Verifique o link e tente novamente.</p>
        </div>
      </div>;
  }
  return <div className="fixed inset-0 bg-black text-white font-figtree overflow-hidden menu-digital-page">
      <style dangerouslySetInnerHTML={{
      __html: `
          @media (max-width: 1600px) {
            .menu-digital-page .menu-text {
              font-size: 180% !important;
            }
          }
          
          @media (max-width: 768px) {
            .menu-digital-page .mobile-text-container {
              top: 5% !important;
              left: 50% !important;
              transform: translateX(-50%) !important;
              text-align: center !important;
              width: 100% !important;
              padding: 0 1rem !important;
              position: relative !important;
            }
            
            .menu-digital-page .menu-digital-container {
              flex-direction: column !important;
              align-items: center !important;
            }
            
            .menu-digital-page .menu-text {
              margin-left: 0 !important;
              margin-bottom: 0.5rem !important;
              font-size: 5.5rem !important;
            }
            
            .menu-digital-page .digital-text {
              margin-left: 0 !important;
              font-size: 3.5rem !important;
            }
            
            .menu-digital-page .mobile-text-container button {
              margin: 2.5rem auto 0 !important;
              font-size: 1.5rem !important;
              padding: 1rem 3rem !important;
            }
            
            .menu-digital-page .mobile-image-container {
              bottom: 0 !important;
              right: 50% !important;
              transform: translateX(50%) !important;
              height: 60vh !important;
              width: 100% !important;
            }

            .menu-digital-page .mobile-image-container img {
              object-position: bottom !important;
            }
            
            .menu-digital-page .mobile-instagram {
              display: none !important;
            }
          }

          @media (max-width: 380px) {
            .menu-digital-page .mobile-text-container {
              top: 3% !important;
            }

            .menu-digital-page .menu-text {
              font-size: 4.5rem !important;
            }
            
            .menu-digital-page .digital-text {
              font-size: 3rem !important;
            }
            
            .menu-digital-page .mobile-text-container button {
              font-size: 1.3rem !important;
              padding: 0.875rem 2.5rem !important;
              margin-top: 2rem !important;
            }
          }
        `
    }} />

      {/* CONTAINER PRINCIPAL DO HEADER */}
      <motion.div className="relative w-full pt-[clamp(3rem,5vh,4rem)]" style={{
      height: "clamp(100px, 12vh, 140px)"
    }} initial={{
      y: -50,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} transition={{
      duration: 0.6
    }}>
        <div className="flex justify-between items-center w-full h-full pl-[8%] pr-[8%]">
          {/* LOGO APPRO */}
          <motion.div className="relative flex items-center" style={{
          width: "clamp(70px, 6vw, 90px)"
        }} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }}>
            <div className="w-full transform transition duration-200 ease-in-out hover:scale-110">
              <img src="/lovable-uploads/f77b22c2-a495-423a-bce4-4ddc7b37074d.png" alt="Logo Appro" className="w-full h-auto brightness-0 invert opacity-60" />
            </div>
          </motion.div>

          {/* WHATSAPP + ÍCONES */}
          <motion.div className="flex items-center relative" style={{
          gap: "clamp(1.2rem, 2vw, 1.8rem)"
        }} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }}>
            {salon.phone && <a href={`https://wa.me/${salon.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="group transform transition-all duration-200 ease-in-out hover:scale-110">
                <Phone className="transition-all duration-200 text-gray-400" style={{
              width: "clamp(24px, 2vw, 32px)",
              height: "auto"
            }} />
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-zinc-900 text-white text-xs py-1 px-2 rounded-md -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  WhatsApp
                </div>
              </a>}

            {salon.instagram && <a href={`https://instagram.com/${salon.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="group transform transition-all duration-200 ease-in-out hover:scale-110">
                <Instagram className="transition-all duration-200 text-gray-400" style={{
              width: "clamp(24px, 2vw, 32px)",
              height: "auto"
            }} />
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-zinc-900 text-white text-xs py-1 px-2 rounded-md -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  Instagram
                </div>
              </a>}

            {salon.address && <LocationDialog address={salon.address}>
                <button className="group transform transition-all duration-200 ease-in-out hover:scale-110">
                  <MapPin className="transition-all duration-200 text-gray-400" style={{
                width: "clamp(24px, 2vw, 32px)",
                height: "auto"
              }} />
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-zinc-900 text-white text-xs py-1 px-2 rounded-md -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    Localização
                  </div>
                </button>
              </LocationDialog>}
          </motion.div>
        </div>
      </motion.div>

      {/* CONTAINER PRINCIPAL DO CONTEÚDO */}
      <div className="relative w-full h-[calc(100vh-clamp(100px,12vh,140px))]">
        {/* BLOCO DE TEXTO AJUSTADO */}
        <motion.div className="absolute top-[45%] left-[8%] transform -translate-y-1/2 z-10 mobile-text-container" style={{
        fontSize: "6vw"
      }} initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: 0.8
      }}>
          <div className="relative">
            <div className="flex items-baseline menu-digital-container">
              <motion.span className="block font-bold menu-text" style={{
              fontSize: "220%",
              letterSpacing: "-0.03em",
              lineHeight: "1",
              marginLeft: "clamp(0.5rem, 1vw, 1rem)",
              color: "#E8D2A9"
            }} initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              duration: 0.6,
              delay: 0.2
            }}>
                Menu
              </motion.span>

              <motion.span className="block text-white font-bold ml-4 digital-text" style={{
              fontSize: "50%",
              letterSpacing: "-0.06em",
              lineHeight: "0.9"
            }} initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              duration: 0.6,
              delay: 0.4
            }}>
                Digital
              </motion.span>
            </div>
          </div>

          <motion.button onClick={onEnter} className="mt-[clamp(3rem,5vh,4rem)] bg-white text-black font-semibold rounded-full shadow-lg transform transition duration-200 ease-in-out hover:scale-110" style={{
          fontSize: "clamp(1.1rem, 1.6vw, 1.4rem)",
          paddingInline: "clamp(2.5rem, 7vw, 5rem)",
          paddingBlock: "clamp(1rem, 1.8vw, 1.5rem)",
          marginLeft: "clamp(0.5rem, 1vw, 1rem)"
        }} initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.6,
          delay: 0.8
        }}>
            Entrar
          </motion.button>
        </motion.div>

        {/* CONTAINER DA IMAGEM */}
        <motion.div className="absolute bottom-0 right-[8%] h-[105%] pointer-events-none mobile-image-container" style={{
        width: "clamp(800px, 70vw, 1400px)"
      }} initial={{
        x: 100,
        opacity: 0
      }} animate={{
        x: 0,
        opacity: 1
      }} transition={{
        duration: 0.8
      }}>
          <div className="relative h-full w-full">
            <img src="/lovable-uploads/7b0ce177-78db-44ee-9a51-a94e3561d5cd.png" alt="Profissional de beleza" className="absolute bottom-0 right-0 h-[105%] w-auto object-contain select-none pointer-events-none" />
          </div>
        </motion.div>

      </div>
    </div>;
};
export default MenuDigital;