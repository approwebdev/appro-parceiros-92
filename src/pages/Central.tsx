import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useSalons } from "@/hooks/useSalons";
import { Loader2, Calendar, MapPin, Phone, Instagram } from "lucide-react";

const Central = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { salons, loading } = useSalons();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'AP4867@@@') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Acesso à Central</CardTitle>
            <CardDescription>Digite a senha para acessar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-accent/20">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Central de Controle</h1>
          <p className="text-muted-foreground">Gerencie todos os aspectos da plataforma</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Localizador de Salões
              </CardTitle>
              <CardDescription>
                Encontre salões próximos a você
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/salon-finder">
                <Button className="w-full">Acessar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Painel Administrativo
              </CardTitle>
              <CardDescription>
                Gerencie usuários, salões e configurações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin">
                <Button className="w-full">Acessar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Painel do Salão
              </CardTitle>
              <CardDescription>
                Área para gerenciamento de salões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/salon-panel">
                <Button className="w-full">Acessar</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="h-5 w-5" />
              Salões Cadastrados ({salons?.length || 0})
            </CardTitle>
            <CardDescription>
              Lista de todos os salões ativos na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {salons && salons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {salons.map((salon) => (
                  <Card key={salon.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{salon.name}</h3>
                      {salon.phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {salon.phone}
                        </p>
                      )}
                      {salon.address && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {salon.address}
                        </p>
                      )}
                      <Link 
                        to={`/menu/${salon.slug}`}
                        className="inline-block mt-3"
                      >
                        <Button size="sm" variant="outline">
                          Ver Menu Digital
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Nenhum salão encontrado.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Central;