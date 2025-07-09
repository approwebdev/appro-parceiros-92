import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Phone, MapPin, Instagram } from 'lucide-react';

interface Salon {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  instagram: string;
  photo_url: string;
  plan_type: string;
  is_active: boolean;
  user_id: string;
}

interface SalonCardProps {
  salon: Salon;
  onEdit: (salon: Salon) => void;
  onDelete: (id: string) => void;
}

export const SalonCard = ({ salon, onEdit, onDelete }: SalonCardProps) => {
  return (
    <Card className="bg-menu-gray">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-4">
            {salon.photo_url && (
              <img 
                src={salon.photo_url} 
                alt={salon.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <CardTitle className="text-menu-white">{salon.name}</CardTitle>
              <p className="text-menu-gold">/{salon.slug}</p>
              <p className="text-blue-400 text-sm">Plano: {salon.plan_type}</p>
              {salon.address && (
                <div className="flex items-center mt-1 text-gray-400">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{salon.address}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(salon)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(salon.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 text-sm">
          {salon.phone && (
            <div className="flex items-center text-gray-300">
              <Phone className="h-4 w-4 mr-1" />
              {salon.phone}
            </div>
          )}
          {salon.instagram && (
            <div className="flex items-center text-gray-300">
              <Instagram className="h-4 w-4 mr-1" />
              {salon.instagram}
            </div>
          )}
          <span className={`px-2 py-1 rounded text-xs ${salon.is_active ? 'bg-green-600' : 'bg-red-600'}`}>
            {salon.is_active ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};