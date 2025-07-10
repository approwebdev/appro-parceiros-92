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
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'verificado_dourado':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case 'verificado_azul':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'basico':
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'verificado_dourado':
        return 'Verificado Dourado';
      case 'verificado_azul':
        return 'Verificado Azul';
      case 'basico':
      default:
        return 'Básico';
    }
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg border-2 ${
      salon.is_active 
        ? 'bg-gradient-to-br from-menu-gray to-menu-dark border-menu-gold/30 shadow-md' 
        : 'bg-gray-800 border-gray-600 opacity-75'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <div className="relative">
              {salon.photo_url ? (
                <img 
                  src={salon.photo_url} 
                  alt={salon.name}
                  className="w-20 h-20 rounded-xl object-cover border-2 border-menu-gold/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-menu-gold/20 to-menu-gold/10 border-2 border-menu-gold/20 flex items-center justify-center">
                  <span className="text-menu-gold text-2xl font-bold">
                    {salon.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {salon.is_active && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-menu-dark animate-pulse"></div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className={`text-lg ${salon.is_active ? 'text-menu-white' : 'text-gray-400'}`}>
                  {salon.name}
                </CardTitle>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlanColor(salon.plan_type)}`}>
                  {getPlanLabel(salon.plan_type)}
                </span>
              </div>
              <p className="text-menu-gold font-mono text-sm">/{salon.slug}</p>
              {salon.address && (
                <div className="flex items-center mt-2 text-gray-400">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm line-clamp-1">{salon.address}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold text-center ${
              salon.is_active 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {salon.is_active ? '● Ativo' : '○ Inativo'}
            </span>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(salon)}
                className="border-menu-gold/30 text-menu-gold hover:bg-menu-gold/10"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(salon.id)}
                className="bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm">
            {salon.phone && (
              <div className="flex items-center text-gray-300 hover:text-menu-gold transition-colors">
                <Phone className="h-4 w-4 mr-2" />
                <span>{salon.phone}</span>
              </div>
            )}
            {salon.instagram && (
              <div className="flex items-center text-gray-300 hover:text-menu-gold transition-colors">
                <Instagram className="h-4 w-4 mr-2" />
                <span>@{salon.instagram}</span>
              </div>
            )}
          </div>
          {salon.is_active && (
            <div className="text-xs text-menu-gold/70 font-medium">
              Online
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};