import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, 
  MapPin, 
  Menu, 
  Lock, 
  Shield, 
  Settings,
  AlertTriangle
} from "lucide-react";

const Navigation = () => {
  const pages = [
    {
      title: "Página Principal",
      description: "Homepage do sistema",
      path: "/",
      icon: Home,
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Buscar Salões",
      description: "Encontre salões próximos",
      path: "/salons",
      icon: MapPin,
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Menu Digital",
      description: "Exemplo: /menu/exemplo-salon",
      path: "/menu/exemplo-salon",
      icon: Menu,
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Autenticação",
      description: "Login e registro",
      path: "/auth",
      icon: Lock,
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "Painel Admin",
      description: "Área administrativa",
      path: "/admin",
      icon: Shield,
      color: "bg-red-500 hover:bg-red-600"
    },
    {
      title: "Painel do Salão",
      description: "Área do salão",
      path: "/salon-panel",
      icon: Settings,
      color: "bg-indigo-500 hover:bg-indigo-600"
    },
    {
      title: "Página 404",
      description: "Página não encontrada",
      path: "/pagina-inexistente",
      icon: AlertTriangle,
      color: "bg-gray-500 hover:bg-gray-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Navegação do Sistema
          </h1>
          <p className="text-gray-600 text-lg">
            Acesse todas as páginas do sistema para testes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => {
            const Icon = page.icon;
            
            return (
              <Card key={page.path} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${page.color.split(' ')[0]} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{page.title}</CardTitle>
                  </div>
                  <p className="text-gray-600 text-sm">{page.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link to={page.path}>
                    <Button 
                      className={`w-full ${page.color} text-white`}
                      variant="default"
                    >
                      Acessar Página
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    {page.path}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Informações para Teste</CardTitle>
            </CardHeader>
            <CardContent className="text-left space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">Autenticação:</h4>
                <p className="text-gray-600 text-sm">
                  Crie uma conta ou faça login para acessar as áreas restritas (Admin e Salão)
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Menu Digital:</h4>
                <p className="text-gray-600 text-sm">
                  O slug "exemplo-salon" é apenas um exemplo. Salões reais terão slugs únicos.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Responsividade:</h4>
                <p className="text-gray-600 text-sm">
                  Teste as páginas em diferentes tamanhos de tela para verificar a responsividade.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Navigation;