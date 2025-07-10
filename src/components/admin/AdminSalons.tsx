import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useSalons } from '@/hooks/useSalons';
import { SalonForm } from './SalonForm';
import { SalonCard } from './SalonCard';

interface Salon {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  instagram: string;
  photo_url: string;
  plan_type: string;
  is_active: boolean;
  user_id: string;
}

export const AdminSalons = () => {
  const { salons, loading, generateSlug, saveSalon, deleteSalon } = useSalons();
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    address_number: '',
    address_complement: '',
    instagram: '',
    photo_url: '',
    plan_type: 'basico',
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveSalon(formData, editingSalon);
    if (success) {
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const openEditDialog = (salon: Salon) => {
    setEditingSalon(salon);
    setFormData({
      name: salon.name,
      slug: salon.slug,
      phone: salon.phone || '',
      address: salon.address || '',
      city: salon.city || '',
      state: salon.state || '',
      postal_code: salon.postal_code || '',
      address_number: '',
      address_complement: '',
      instagram: salon.instagram || '',
      photo_url: salon.photo_url || '',
      plan_type: salon.plan_type || 'basico',
      is_active: salon.is_active
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSalon(null);
    setFormData({
      name: '',
      slug: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      address_number: '',
      address_complement: '',
      instagram: '',
      photo_url: '',
      plan_type: 'basico',
      is_active: true
    });
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Salões</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-menu-gold text-menu-dark hover:bg-menu-gold/80">
              <Plus className="h-4 w-4 mr-2" />
              Novo Salão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSalon ? 'Editar Salão' : 'Novo Salão'}
              </DialogTitle>
            </DialogHeader>
            
            <SalonForm
              formData={formData}
              setFormData={setFormData}
              editingSalon={editingSalon}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              generateSlug={generateSlug}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {salons.map((salon) => (
          <SalonCard
            key={salon.id}
            salon={salon}
            onEdit={openEditDialog}
            onDelete={deleteSalon}
          />
        ))}
      </div>
    </div>
  );
};