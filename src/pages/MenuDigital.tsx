import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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

const MenuDigital = ({ onEnter }: MenuDigitalProps) => {
  const { slug } = useParams<{ slug: string }>();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchSalon();
    }
  }, [slug]);

  const fetchSalon = async () => {
    try {
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Erro ao buscar salão:', error);
        return;
      }

      setSalon(data);
    } catch (error) {
      console.error('Erro ao buscar salão:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="menu-container bg-menu-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="menu-container bg-menu-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Salão não encontrado</h2>
          <p className="text-gray-400">Verifique o link e tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-container bg-black relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-6">
        {/* Logo Appro */}
        <div className="flex items-center">
          <img src="/lovable-uploads/f77b22c2-a495-423a-bce4-4ddc7b37074d.png" alt="ARO" className="h-8" />
        </div>

        {/* Ícones superiores */}
        <div className="flex items-center gap-4">
          {salon.phone && (
            <a 
              href={`https://wa.me/${salon.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gold transition-colors"
            >
              <Phone className="h-6 w-6" />
            </a>
          )}
          <div className="text-white">
            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-white"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="h-full flex">
        {/* Lado Esquerdo - Texto */}
        <div className="flex-1 flex flex-col justify-center pl-16">
          <div className="mb-8">
            <h1 className="flex items-center gap-4 mb-4">
              <span className="text-8xl font-black bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400" style={{ backgroundImage: 'linear-gradient(135deg, #F8E7BF, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Menu
              </span>
              <span className="text-7xl font-bold text-white">Digital</span>
            </h1>
            
            {/* Informações do Salão */}
            <div className="space-y-2 mb-8">
              {salon.address && (
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{salon.address}</span>
                </div>
              )}
              {salon.phone && (
                <div className="flex items-center gap-2 text-white/80">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{salon.phone}</span>
                </div>
              )}
            </div>

            {/* Botão Entrar */}
            <Button 
              onClick={onEnter}
              className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-full"
            >
              Entrar
            </Button>
          </div>
        </div>

        {/* Lado Direito - Modelo */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/20"></div>
          <img 
            src="/lovable-uploads/7b0ce177-78db-44ee-9a51-a94e3561d5cd.png"
            alt="Profissional de beleza"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 right-6">
        {salon.instagram && (
          <a 
            href={`https://instagram.com/${salon.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gold transition-colors"
          >
            <Instagram className="h-6 w-6" />
          </a>
        )}
      </div>
    </div>
  );
};

export default MenuDigital;