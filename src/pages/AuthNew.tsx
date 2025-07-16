import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
const AuthNew = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [wantsSalon, setWantsSalon] = useState(false);
  const [salonName, setSalonName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const {
    signIn,
    signUpWithDetails,
    signOut,
    user,
    profile
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();

  // Handle authentication states
  useEffect(() => {
    // Only check for profile error if loading is complete and user exists for more than 2 seconds
    if (user && !profile && !loading) {
      const timer = setTimeout(() => {
        // Double check if profile is still null after loading completed
        if (user && !profile && !loading) {
          toast({
            title: "Erro de autenticação",
            description: "Perfil não encontrado. Faça login novamente.",
            variant: "destructive"
          });
          signOut();
        }
      }, 2000); // Wait 2 seconds after loading completes

      return () => clearTimeout(timer);
    }
  }, [user, profile, loading, toast, signOut]);

  // Redirect if already authenticated and approved
  if (user && profile) {
    if (profile.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (profile.status === 'approved') {
      return <Navigate to="/salon-panel" replace />;
    } else if (profile.status === 'pending') {
      // Show pending message
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md text-center">
            <img src="/lovable-uploads/4645a4ff-beda-4f6f-90f1-ea6a54167f18.png" alt="ARO" className="h-12 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso em Análise</h2>
            <p className="text-gray-600 mb-6">
              Seu cadastro foi recebido e está sendo analisado pela nossa equipe. 
              Você receberá uma confirmação por email assim que for aprovado.
            </p>
            <Button 
              onClick={async () => {
                await signOut();
                window.location.reload();
              }}
              variant="outline"
              className="w-full"
            >
              Sair
            </Button>
          </div>
        </div>
      );
    } else if (profile.status === 'rejected') {
      // Show rejected message
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md text-center">
            <img src="/lovable-uploads/4645a4ff-beda-4f6f-90f1-ea6a54167f18.png" alt="ARO" className="h-12 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h2>
            <p className="text-gray-600 mb-6">
              Infelizmente seu cadastro não foi aprovado pela nossa equipe.
              Entre em contato para mais informações.
            </p>
            <Button 
              onClick={async () => {
                await signOut();
                window.location.reload();
              }}
              variant="outline"
              className="w-full"
            >
              Sair
            </Button>
          </div>
        </div>
      );
    }
  }
  const handlePostalCodeBlur = async () => {
    if (postalCode.length === 8) {
      setLoadingAddress(true);
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${postalCode}/json/`);
        if (response.data && !response.data.erro) {
          setAddress(`${response.data.logradouro}, ${response.data.bairro}, ${response.data.localidade} - ${response.data.uf}`);
        } else {
          toast({
            title: "CEP não encontrado",
            description: "Verifique o CEP digitado.",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Erro ao buscar CEP",
          description: "Não foi possível buscar o endereço.",
          variant: "destructive"
        });
      } finally {
        setLoadingAddress(false);
      }
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const {
          error
        } = await signIn(email, password);
        if (error) {
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta."
          });
        }
      } else {
        const signUpData = {
          name,
          email,
          password,
          phone,
          wants_salon: wantsSalon,
          salon_name: wantsSalon ? salonName : undefined,
          postal_code: wantsSalon ? postalCode : undefined,
          address: wantsSalon ? address : undefined,
          address_number: wantsSalon ? addressNumber : undefined,
          address_complement: wantsSalon ? addressComplement : undefined
        };
        const {
          error
        } = await signUpWithDetails(signUpData);
        if (error) {
          toast({
            title: "Erro no cadastro",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Cadastro realizado com sucesso!",
            description: "Seu acesso está em análise pela nossa equipe."
          });
          // Switch to login mode after successful registration
          setIsLogin(true);
          setPassword(''); // Clear password for security
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-black flex">
      {/* Lado esquerdo - Imagem */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
        <img src="/lovable-uploads/c3cd9e4a-b3d4-4156-a87a-797c0fcb0e19.png" alt="Salon Professionals" className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-8 left-8 text-white">
          
          
        </div>
      </div>
      
      {/* Lado direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src="/lovable-uploads/4645a4ff-beda-4f6f-90f1-ea6a54167f18.png" alt="ARO" className="h-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Entrar na sua conta' : 'Criar nova conta'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isLogin ? 'Bem-vindo de volta!' : 'Junte-se à nossa plataforma'}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
              </div>}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            
            {!isLogin && <>
                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp</Label>
                  <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="(00) 00000-0000" />
                </div>
                
                
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <Switch id="wants-salon" checked={wantsSalon} onCheckedChange={setWantsSalon} />
                  <Label htmlFor="wants-salon" className="text-sm">
                    Eu já possuo um salão
                  </Label>
                </div>
                
                {wantsSalon && <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium">Dados do Salão</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="salon-name">Nome do Salão</Label>
                      <Input id="salon-name" type="text" value={salonName} onChange={e => setSalonName(e.target.value)} required placeholder="Ex: Salão Beleza & Cia" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="postal-code">CEP</Label>
                      <Input id="postal-code" type="text" value={postalCode} onChange={e => setPostalCode(e.target.value.replace(/\D/g, ''))} onBlur={handlePostalCodeBlur} maxLength={8} placeholder="00000000" required />
                    </div>
                    
                    {loadingAddress && <p className="text-sm text-muted-foreground">Buscando endereço...</p>}
                    
                    {address && <div className="space-y-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Input id="address" type="text" value={address} onChange={e => setAddress(e.target.value)} required />
                      </div>}
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="address-number">Número</Label>
                        <Input id="address-number" type="text" value={addressNumber} onChange={e => setAddressNumber(e.target.value)} required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address-complement">Complemento</Label>
                        <Input id="address-complement" type="text" value={addressComplement} onChange={e => setAddressComplement(e.target.value)} placeholder="Sala, andar..." />
                      </div>
                    </div>
                  </div>}
              </>}
            
            <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg text-base font-medium" disabled={loading}>
              {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="text-gray-600 hover:text-gray-900">
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default AuthNew;