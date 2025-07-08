import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Scissors } from "lucide-react";

interface Salon {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url?: string;
}

const Index = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    try {
      const { data, error } = await supabase
        .from('salons')
        .select('*')
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Scissors className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Cardápios Digitais</h1>
              <p className="text-muted-foreground">Encontre os melhores salões de beleza</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Salões Disponíveis</h2>
          <p className="text-muted-foreground">
            Explore os cardápios de serviços dos nossos parceiros
          </p>
        </div>

        {salons.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <Scissors className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum salão encontrado no momento</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salons.map((salon) => (
              <Card key={salon.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {salon.logo_url ? (
                      <img 
                        src={salon.logo_url} 
                        alt={`Logo ${salon.name}`}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <Scissors className="h-6 w-6 text-primary" />
                    )}
                    {salon.name}
                  </CardTitle>
                  {salon.description && (
                    <CardDescription>{salon.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to={`/salon/${salon.slug}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Cardápio
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t bg-card">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>© 2024 Cardápios Digitais - Conectando você aos melhores salões</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;