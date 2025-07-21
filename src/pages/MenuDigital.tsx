
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LocationDialog } from "@/components/ui/location-dialog";
import { Phone, Instagram, MapPin } from "lucide-react";

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

  return <div className="h-screen w-screen bg-black relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center" style={{
        padding: 'clamp(1rem, 2vw, 1.5rem)'
      }}>
        {/* Logo AR */}
        <div className="flex items-center z-50">
          <div className="text-white font-bold text-2xl">AR</div>
        </div>

        {/* Ícones superiores direita */}
        <div className="flex items-center z-50" style={{
          gap: 'clamp(0.75rem, 1.5vw, 1rem)'
        }}>
          {salon.phone && <a href={`https://wa.me/${salon.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gold transition-colors">
              <Phone style={{
                width: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                height: 'clamp(1.25rem, 2.5vw, 1.5rem)'
              }} />
            </a>}
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
          <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div className="w-3 h-1 bg-black"></div>
            <div className="w-3 h-1 bg-black ml-0.5"></div>
            <div className="w-3 h-1 bg-black ml-0.5"></div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="h-full flex flex-col-reverse md:flex-row">
        {/* Lado Esquerdo - Texto */}
        <div className="flex-1 flex flex-col justify-center order-2 md:order-1 relative z-30" style={{
          paddingLeft: 'clamp(1rem, 4vw, 4rem)',
          paddingRight: 'clamp(1rem, 2vw, 2rem)',
          paddingTop: 'clamp(2rem, 5vh, 5rem)',
          paddingBottom: 'clamp(1rem, 2vh, 2rem)'
        }}>
          <div className="text-center md:text-left">
            <h1 className="flex flex-col md:flex-row md:items-baseline md:gap-4" style={{
              marginBottom: 'clamp(1.5rem, 3vh, 2.5rem)'
            }}>
              <span className="font-black text-[#D4B08A]" style={{
                fontSize: 'clamp(6rem, 20vw, 12rem)'
              }}>
                Menu
              </span>
              <span className="font-medium text-white" style={{
                fontSize: 'clamp(2rem, 6vw, 4rem)'
              }}>Digital</span>
            </h1>

            {/* Botão Entrar */}
            <div className="flex justify-center md:justify-start">
              <Button 
                onClick={onEnter} 
                className="bg-white text-black hover:bg-gray-100 font-semibold rounded-full relative z-40"
                style={{
                  padding: 'clamp(1rem, 2vw, 1.25rem) clamp(2.5rem, 5vw, 3rem)',
                  fontSize: 'clamp(1rem, 2.5vw, 1.125rem)'
                }}
              >
                Entrar
              </Button>
            </div>
          </div>
        </div>

        {/* Lado Direito - Modelo */}
        <div className="flex-1 relative h-1/2 md:h-full order-1 md:order-2">
          <img 
            src="/lovable-uploads/9c955626-919c-48a6-99ec-0548d46d6009.png" 
            alt="Mulher profissional" 
            className="w-full h-full object-cover object-center relative z-10 pointer-events-none" 
          />
        </div>
      </div>

      {/* Instagram icon no canto inferior direito */}
      {salon.instagram && (
        <div className="absolute bottom-6 right-6 z-50">
          <a href={`https://instagram.com/${salon.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gold transition-colors">
            <Instagram style={{
              width: 'clamp(1.5rem, 3vw, 2rem)',
              height: 'clamp(1.5rem, 3vw, 2rem)'
            }} />
          </a>
        </div>
      )}
    </div>;
};

export default MenuDigital;
