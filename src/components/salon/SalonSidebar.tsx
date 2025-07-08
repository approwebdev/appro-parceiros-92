import { Home, Package, Settings, LogOut, Search, User, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';

interface SalonSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const SalonSidebar = ({ activeTab, onTabChange }: SalonSidebarProps) => {
  const { profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'salon-info', label: 'Informações', icon: User },
    { id: 'menu-link', label: 'Link do Menu', icon: Home },
    { id: 'treatments', label: 'Tratamentos', icon: Package },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        onClick={() => setIsMobileMenuOpen(true)}
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 text-admin-text"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-admin-sidebar text-white 
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col min-h-screen
      `}>
        {/* Close Button for Mobile */}
        <div className="lg:hidden flex justify-end p-4">
          <Button
            onClick={() => setIsMobileMenuOpen(false)}
            variant="ghost"
            size="icon"
            className="text-white"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Header */}
        <div className="p-6 border-b border-admin-sidebar-hover">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-admin-success rounded-lg flex items-center justify-center">
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
                    onClick={() => {
                      onTabChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
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
              <AvatarFallback className="bg-admin-success text-white text-sm">
                {profile?.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{profile?.name}</p>
              <p className="text-gray-400 text-xs truncate">{profile?.email}</p>
            </div>
            <Badge variant="outline" className="bg-admin-success/20 text-admin-success border-admin-success">
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
    </>
  );
};