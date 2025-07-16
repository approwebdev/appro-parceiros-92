import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, User, Phone, Instagram, Mail } from 'lucide-react';
import * as z from 'zod';

interface User {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'salon' | 'collaborator';
  phone?: string;
  instagram?: string;
  has_salon: boolean;
  wants_salon: boolean;
  created_at: string;
}

// Validation schemas for security
const userCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email format").max(255, "Email too long"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  role: z.enum(['admin', 'salon', 'collaborator']),
  phone: z.string().max(20, "Phone too long").optional(),
  instagram: z.string().max(50, "Instagram handle too long").optional(),
});

const userUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email format").max(255, "Email too long"),
  role: z.enum(['admin', 'salon', 'collaborator']),
  phone: z.string().max(20, "Phone too long").optional(),
  instagram: z.string().max(50, "Instagram handle too long").optional(),
});

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'salon' as 'admin' | 'salon' | 'collaborator',
    phone: '',
    password: ''
  });

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers((data || []) as User[]);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Validate update data
        const validatedData = userUpdateSchema.parse({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          role: formData.role,
          phone: formData.phone?.trim() || undefined,
        });

        // Use secure admin function to update user
        const { error } = await supabase.rpc('admin_update_user_profile', {
          target_user_id: editingUser.user_id,
          new_name: validatedData.name,
          new_email: validatedData.email,
          new_role: validatedData.role,
          new_phone: validatedData.phone || null,
        });

        if (error) throw error;
        toast({ title: "Usuário atualizado com sucesso!" });
      } else {
        // Validate creation data
        const validatedData = userCreateSchema.parse({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role,
          phone: formData.phone?.trim() || undefined,
        });

        // Create new user with validated data
        const { error } = await supabase.auth.signUp({
          email: validatedData.email,
          password: validatedData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              name: validatedData.name,
              role: validatedData.role,
              phone: validatedData.phone,
            }
          }
        });
        
        if (error) throw error;
        toast({ title: "Usuário criado com sucesso!" });
      }
      
      fetchUsers();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Dados inválidos",
          description: error.issues[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: error.message || "Erro ao salvar usuário",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async (userId: string) => {
    // Check if trying to delete own account
    const currentUser = await supabase.auth.getUser();
    if (userId === currentUser.data.user?.id) {
      toast({
        title: "Erro",
        description: "Você não pode deletar sua própria conta",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      // Delete from profiles table first
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);
      
      if (profileError) throw profileError;
      
      // Then delete from auth (requires service role)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.warn('Failed to delete user from auth:', authError);
      }
      
      toast({ title: "Usuário excluído com sucesso!" });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir usuário",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      password: ''
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'salon',
      phone: '',
      password: ''
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
      case 'collaborator':
        return <Badge className="bg-blue-100 text-blue-800">Colaborador</Badge>;
      case 'salon':
        return <Badge className="bg-green-100 text-green-800">Parceiro</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-admin-success hover:bg-admin-success-hover text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required={!editingUser}
                    disabled={!!editingUser}
                    className={editingUser ? "bg-gray-100" : ""}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Cargo</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'admin' | 'salon' | 'collaborator') => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="collaborator">Colaborador</SelectItem>
                      <SelectItem value="salon">Parceiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {!editingUser && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingUser ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="bg-admin-card border-admin-border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <User className="h-8 w-8 text-admin-text-muted" />
                  <div>
                    <CardTitle className="text-admin-text">{user.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-admin-text-muted" />
                      <span className="text-admin-text-muted text-sm">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      {user.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-admin-text-muted" />
                          <span className="text-admin-text-muted text-sm">{user.phone}</span>
                        </div>
                      )}
                      {user.instagram && (
                        <div className="flex items-center gap-1">
                          <Instagram className="h-4 w-4 text-admin-text-muted" />
                          <span className="text-admin-text-muted text-sm">{user.instagram}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getRoleBadge(user.role)}
                  {user.has_salon && (
                    <Badge className="bg-purple-100 text-purple-800">
                      Com Salão
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(user.user_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};