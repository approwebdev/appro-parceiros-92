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
    return <div className="menu-container bg-menu-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>;
  }

  if (!salon) {
    return <div className="menu-container bg-menu-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Salão não encontrado</h2>
          <p className="text-gray-400">Verifique o link e tente novamente.</p>
        </div>
      </div>;
  }

  return <div className="menu-container bg-black relative min-h-screen">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-4 md:p-6">
        {/* Logo Appro */}
        <div className="flex items-center z-50">
          <img src="/lovable-uploads/f77b22c2-a495-423a-bce4-4ddc7b37074d.png" alt="ARO" className="h-6 md:h-8" />
        </div>

        {/* Ícones superiores */}
        <div className="flex items-center gap-3 md:gap-4 z-50">
          {salon.phone && <a href={`https://wa.me/${salon.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gold transition-colors">
              <Phone className="h-5 w-5 md:h-6 md:w-6" />
            </a>}
          {salon.instagram && <a href={`https://instagram.com/${salon.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gold transition-colors">
              <Instagram className="h-5 w-5 md:h-6 md:w-6" />
            </a>}
          {salon.address && <LocationDialog address={salon.address}>
              <button className="text-white hover:text-gold transition-colors">
                <MapPin className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </LocationDialog>}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="h-screen flex flex-col md:flex-row">
        {/* Lado Esquerdo - Texto */}
        <div className="flex-1 flex flex-col justify-center px-4 py-20 md:pl-16 md:py-0 order-2 md:order-1 relative z-30">
          <div className="mb-8 text-center md:text-left">
            <h1 className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 mb-6 md:mb-4">
              
              <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                <span className="text-4xl md:text-8xl font-black bg-gradient-to-r from-[#FBD18F] to-[#FFDDA6]" style={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                  Menu
                </span>
                <span className="text-3xl md:text-7xl font-bold text-white">Digital</span>
              </div>
            </h1>
            
            {/* Nome do Salão */}
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">
              {salon.name}
            </h2>
            

            {/* Botão Entrar */}
            <Button onClick={onEnter} className="bg-white text-black hover:bg-gray-100 px-6 py-4 md:px-8 md:py-6 text-base md:text-lg font-semibold rounded-full w-full md:w-auto relative z-40">
              Entrar
            </Button>
          </div>
        </div>

        {/* Lado Direito - Modelo */}
        <div className="flex-1 relative h-64 md:h-full order-1 md:order-2">
          <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-l from-black/20 via-transparent to-black/60 md:to-black/20 z-0"></div>
          <img 
            src="/lovable-uploads/7b0ce177-78db-44ee-9a51-a94e3561d5cd.png" 
            alt="Profissional de beleza" 
            className="w-full h-full object-cover object-[center_top] sm:object-[70%_center] md:object-center relative z-10 pointer-events-none" 
          />
        </div>
      </div>

    </div>;
};

export default MenuDigital;
