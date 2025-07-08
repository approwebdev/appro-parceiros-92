import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('salon');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, user, profile } = useAuth();
  const { toast } = useToast();

  // Redirect if already authenticated
  if (user && profile) {
    if (profile.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/salon-panel" replace />;
    }
  }

  const createTestUser = async (email: string, password: string, name: string, role: string) => {
    try {
      const { error } = await signUp(email, password, name, role);
      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Usuário já existe",
            description: "Este usuário já foi criado. Tente fazer login.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao criar usuário",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Usuário criado com sucesso!",
          description: `${name} foi criado. Confirme o email se necessário.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar usuário de teste.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta.",
          });
        }
      } else {
        const { error } = await signUp(email, password, name, role);
        if (error) {
          toast({
            title: "Erro no cadastro",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Cadastro realizado com sucesso!",
            description: "Verifique seu email para confirmar a conta.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-menu-dark flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {isLogin ? 'Login' : 'Cadastro'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="role">Tipo de Conta</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salon">Salão</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
            </Button>
          </div>
          
          {/* Usuários de teste */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Criar Usuários de Teste:</h4>
            <div className="space-y-2">
              <Button
                onClick={() => createTestUser('admin@teste.com', '123456', 'Admin Teste', 'admin')}
                variant="outline"
                className="w-full text-sm"
              >
                Criar Admin (admin@teste.com / 123456)
              </Button>
              <Button
                onClick={() => createTestUser('salao@teste.com', '123456', 'Salão Teste', 'salon')}
                variant="outline"
                className="w-full text-sm"
              >
                Criar Salão (salao@teste.com / 123456)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;