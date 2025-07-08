import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Menu, MapPin, Phone, List, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Salon {
  id: string;
  name: string;
  slug: string;
  phone?: string;
  address?: string;
  instagram?: string;
  distance?: string;
}

const SalonFinder = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState<'list' | 'map'>('list');

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    try {
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erro ao buscar salões:', error);
        return;
      }

      setSalons(data || []);
    } catch (error) {
      console.error('Erro ao buscar salões:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSalons = salons.filter(salon =>
    salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salon.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const openWhatsApp = (phone: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-menu-dark">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-menu-dark text-menu-white">
      {/* Header */}
      <header className="bg-menu-dark border-b border-gold/20 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold">
            A<span className="text-gold">RO</span>
          </div>
          <Button variant="ghost" size="icon" className="text-menu-white">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="px-4 py-8 max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">
            Encontre o Salão mais
          </h1>
          <h2 className="text-2xl font-bold text-gold mb-6">
            próximo de você.
          </h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <Input
              type="text"
              placeholder="Digite seu endereço"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white text-black pl-4 pr-12 py-3 rounded-lg w-full"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={viewType === 'list' ? 'default' : 'outline'}
              onClick={() => setViewType('list')}
              className="flex items-center gap-2 flex-1"
            >
              <List className="h-4 w-4" />
              Lista
            </Button>
            <Button
              variant={viewType === 'map' ? 'default' : 'outline'}
              onClick={() => setViewType('map')}
              className="flex items-center gap-2 flex-1"
            >
              <Map className="h-4 w-4" />
              Mapa
            </Button>
          </div>
        </div>

        {/* Salons List */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold">Salões mais próximo de você</h3>
          
          {filteredSalons.map((salon, index) => (
            <Card key={salon.id} className="bg-white text-black">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold flex-shrink-0">
                    {salon.name.charAt(0)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-lg">{salon.name}</h4>
                      <span className="bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap ml-2">
                        Parceiro
                      </span>
                    </div>
                    
                    {salon.phone && (
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="h-4 w-4 text-green-600" />
                        <button
                          onClick={() => openWhatsApp(salon.phone!)}
                          className="text-green-600 hover:underline"
                        >
                          {formatPhone(salon.phone)}
                        </button>
                      </div>
                    )}
                    
                    {salon.address && (
                      <div className="flex items-start gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{salon.address}</span>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      A {Math.floor(Math.random() * 10) + 1}km de você
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Informativo Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Informativo para você</h3>
          <Card className="bg-gradient-to-r from-orange-400 to-yellow-500 overflow-hidden">
            <CardContent className="p-0 relative h-48">
              <img
                src="/lovable-uploads/63155ad2-ae8d-41f6-8e01-774a09edeb0a.png"
                alt="Tratamento capilar"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded">
                <span className="text-2xl font-bold">02</span>
                <br />
                <span className="text-xs">2024</span>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4 text-center">
            <p className="text-sm mb-2">
              <strong>Atenção:</strong>
            </p>
            <p className="text-xs text-gray-300 mb-4">
              Este site apenas indica onde utilizam os produtos
              AP Professional. A responsabilidade pelos serviços prestados é
              exclusivamente do salão listado acima.
            </p>
            <Button className="bg-white text-black hover:bg-gray-100 w-full">
              Saiba mais
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-center py-6 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-white mb-2">
            <span className="text-2xl">📷</span>
          </div>
          <p className="text-xs text-gray-400">
            A.R.P COSMETICA LTDA - CNPJ: 38.730.230.0001-41
          </p>
          <p className="text-xs text-gray-400">
            RUA VISCONDE DE ITAORNA, 1503 - SAO CAETANO DO SUL
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SalonFinder;