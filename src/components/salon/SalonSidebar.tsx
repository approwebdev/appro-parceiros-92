import { Home, Package, Settings, LogOut, Search, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface SalonSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const SalonSidebar = ({ activeTab, onTabChange }: SalonSidebarProps) => {
  const { profile, signOut } = useAuth();

  const menuItems = [
    { id: 'salon-info', label: 'Informações', icon: User },
    { id: 'menu-link', label: 'Link do Menu', icon: Home },
    { id: 'treatments', label: 'Tratamentos', icon: Package },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="w-64 bg-admin-sidebar text-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-admin-sidebar-hover">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-admin-sidebar-active rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ARO</span>
          </div>
          <h1 className="text-xl font-semibold">Painel do Salão</h1>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Buscar..."
            className="pl-10 bg-admin-sidebar-hover border-admin-sidebar-hover text-white placeholder-gray-400 focus:border-admin-sidebar-active"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-admin-sidebar-active text-white' 
                      : 'text-gray-300 hover:bg-admin-sidebar-hover hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-admin-sidebar-hover">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-admin-sidebar-active text-white text-sm">
              {profile?.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">{profile?.name}</p>
            <p className="text-gray-400 text-xs truncate">{profile?.email}</p>
          </div>
          <Badge variant="outline" className="bg-admin-sidebar-active/20 text-admin-sidebar-active border-admin-sidebar-active">
            Salão
          </Badge>
        </div>
        
        <Button 
          onClick={signOut}
          variant="outline"
          className="w-full bg-transparent border-admin-sidebar-hover text-gray-300 hover:bg-admin-sidebar-hover hover:text-white"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
};