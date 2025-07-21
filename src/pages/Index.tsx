import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Scissors, Users, Map, Menu, Settings, MapPin } from "lucide-react";

interface Salon {
  id: string;
  name: string;
  slug: string;
  phone?: string;
  address?: string;
  instagram?: string;
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
        .eq('is_active', true)
        .order('name');

      if (error) {
        return;
      }

      setSalons(data || []);
    } catch (error) {
      
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
            <img src="/lovable-uploads/4645a4ff-beda-4f6f-90f1-ea6a54167f18.png" alt="ARO" className="h-12" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">ARO - Sistema de Menus</h1>
              <p className="text-muted-foreground">Conectando salões e clientes através de menus digitais</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Navigation Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/auth">
                <Users className="h-6 w-6" />
                <span className="text-sm">Login</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/admin">
                <Settings className="h-6 w-6" />
                <span className="text-sm">Admin</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/salon-panel">
                <Scissors className="h-6 w-6" />
                <span className="text-sm">Painel Salão</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/salon-finder">
                <MapPin className="h-6 w-6" />
                <span className="text-sm">Encontrar</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/menu-categories">
                <Menu className="h-6 w-6" />
                <span className="text-sm">Categorias</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/menu-app">
                <ExternalLink className="h-6 w-6" />
                <span className="text-sm">Menu App</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Salões Parceiros</h2>
          <p className="text-muted-foreground">
            Clique em um salão para ver seu menu digital
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
                    <Scissors className="h-6 w-6 text-primary" />
                    {salon.name}
                  </CardTitle>
                  <CardDescription className="space-y-1 md:space-y-0">
                    {salon.address && <div>📍 {salon.address}</div>}
                    {salon.phone && <div>📞 {salon.phone}</div>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link to={`/menu/${salon.slug}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Menu Digital
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/auth">
                      Acesso Painel
                    </Link>
                  </Button>
                </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t bg-card">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>© 2024 Appro - Sistema de Menus Digitais</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;