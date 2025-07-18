
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
        {/* Logo Appro */}
        <div className="flex items-center z-50">
          <img src="/lovable-uploads/f77b22c2-a495-423a-bce4-4ddc7b37074d.png" alt="ARO" style={{
            height: 'clamp(1.5rem, 3vw, 2rem)'
          }} />
        </div>

        {/* Ícones superiores */}
        <div className="flex items-center z-50" style={{
          gap: 'clamp(0.75rem, 1.5vw, 1rem)'
        }}>
          {salon.phone && <a href={`https://wa.me/${salon.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gold transition-colors">
              <Phone style={{
                width: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                height: 'clamp(1.25rem, 2.5vw, 1.5rem)'
              }} />
            </a>}
          {salon.instagram && <a href={`https://instagram.com/${salon.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gold transition-colors">
              <Instagram style={{
                width: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                height: 'clamp(1.25rem, 2.5vw, 1.5rem)'
              }} />
            </a>}
          {salon.address && <LocationDialog address={salon.address}>
              <button className="text-white hover:text-gold transition-colors">
                <MapPin style={{
                  width: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                  height: 'clamp(1.25rem, 2.5vw, 1.5rem)'
                }} />
              </button>
            </LocationDialog>}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="h-full flex flex-col-reverse md:flex-row">
        {/* Lado Esquerdo - Texto */}
        <div className="flex-1 flex flex-col justify-center order-2 md:order-1 relative z-30" style={{
          paddingLeft: 'clamp(1rem, 4vw, 4rem)',
          paddingRight: 'clamp(1rem, 2vw, 2rem)',
          paddingTop: 'clamp(2rem, 5vh, 5rem)', // Reduzido no mobile
          paddingBottom: 'clamp(1rem, 2vh, 2rem)' // Reduzido no mobile
        }}>
          <div className="text-center md:text-left">
            <h1 className="flex flex-col md:flex-row md:items-baseline md:gap-4" style={{
              marginBottom: 'clamp(1.5rem, 3vh, 2.5rem)'
            }}>
              <span className="font-black bg-gradient-to-r from-[#D4B08A] to-[#E6C7A3]" style={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
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
                  padding: 'clamp(1.5rem, 3vw, 1.5rem) clamp(3rem, 6vw, 3rem)',
                  fontSize: 'clamp(1.25rem, 3vw, 1.25rem)'
                }}
              >
                Entrar
              </Button>
            </div>
          </div>
        </div>

        {/* Lado Direito - Modelo */}
        <div className="flex-1 relative h-1/2 md:h-full order-1 md:order-2">
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-black/60 via-transparent to-transparent md:from-black/20 md:to-black/20 z-0"></div>
          <img 
            src="/lovable-uploads/7b0ce177-78db-44ee-9a51-a94e3561d5cd.png" 
            alt="Profissional de beleza" 
            className="w-full h-full object-cover object-[center_bottom] md:object-center relative z-10 pointer-events-none" 
          />
        </div>
      </div>
    </div>;
};

export default MenuDigital;
