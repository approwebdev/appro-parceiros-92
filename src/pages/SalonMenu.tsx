import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Scissors } from "lucide-react";

interface Treatment {
  id: string;
  name: string;
  description: string;
  category: string;
  duration_minutes: number;
  custom_price: number;
}

interface Salon {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url?: string;
}

const SalonMenu = () => {
  const { slug } = useParams<{ slug: string }>();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchSalonData();
    }
  }, [slug]);

  const fetchSalonData = async () => {
    try {
      // Buscar dados do salão
      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .select('*')
        .eq('slug', slug)
        .single();

      if (salonError) {
        console.error('Erro ao buscar salão:', salonError);
        return;
      }

      setSalon(salonData);

      // Buscar tratamentos do salão
      const { data: treatmentsData, error: treatmentsError } = await supabase
        .from('salon_treatments')
        .select(`
          *,
          treatments (
            id,
            name,
            description,
            category,
            duration_minutes
          )
        `)
        .eq('salon_id', salonData.id)
        .eq('is_active', true)
        .order('treatments(category)', { ascending: true });

      if (treatmentsError) {
        console.error('Erro ao buscar tratamentos:', treatmentsError);
        return;
      }

      // Transformar dados para o formato necessário
      const formattedTreatments = treatmentsData?.map(item => ({
        id: item.treatments.id,
        name: item.treatments.name,
        description: item.treatments.description,
        category: item.treatments.category,
        duration_minutes: item.treatments.duration_minutes,
        custom_price: item.custom_price
      })) || [];

      setTreatments(formattedTreatments);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
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

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours}h ${remainingMinutes}min`
        : `${hours}h`;
    }
    return `${minutes}min`;
  };

  // Agrupar tratamentos por categoria
  const treatmentsByCategory = treatments.reduce((acc, treatment) => {
    if (!acc[treatment.category]) {
      acc[treatment.category] = [];
    }
    acc[treatment.category].push(treatment);
    return acc;
  }, {} as Record<string, Treatment[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4">Salão não encontrado</h2>
            <p className="text-muted-foreground mb-6">
              O salão que você está procurando não existe ou foi removido.
            </p>
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            {salon.logo_url ? (
              <img 
                src={salon.logo_url} 
                alt={`Logo ${salon.name}`}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Scissors className="h-8 w-8 text-primary" />
              </div>
            )}
            
            <div>
              <h1 className="text-3xl font-bold text-foreground">{salon.name}</h1>
              {salon.description && (
                <p className="text-muted-foreground mt-1">{salon.description}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Nossos Serviços</h2>
          <p className="text-muted-foreground">
            Confira todos os tratamentos disponíveis com preços e duração
          </p>
        </div>

        {Object.keys(treatmentsByCategory).length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <Scissors className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Este salão ainda não possui serviços cadastrados
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(treatmentsByCategory).map(([category, categoryTreatments]) => (
              <div key={category}>
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  {category}
                </h3>
                
                <div className="grid gap-4">
                  {categoryTreatments.map((treatment) => (
                    <Card key={treatment.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{treatment.name}</CardTitle>
                            {treatment.description && (
                              <CardDescription className="mt-1">
                                {treatment.description}
                              </CardDescription>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-primary">
                              {formatPrice(treatment.custom_price)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {treatment.duration_minutes && (
                        <CardContent className="pt-0">
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <Clock className="h-3 w-3" />
                            {formatDuration(treatment.duration_minutes)}
                          </Badge>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t bg-card">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>© 2024 {salon.name} - Cardápio Digital</p>
        </div>
      </footer>
    </div>
  );
};

export default SalonMenu;