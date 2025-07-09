import { Home, Package, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';

interface SalonSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const SalonSidebar = ({ activeTab, onTabChange }: SalonSidebarProps) => {
  const { profile, signOut } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home
    },
    {
      id: 'treatments',
      label: 'Tratamentos',
      icon: Package
    },
    {
      id: 'profile',
      label: 'Meu Perfil',
      icon: User
    }
  ];

  return (
    <Sidebar className="bg-admin-sidebar text-white border-r-0">
      <SidebarHeader className="p-6 border-b border-admin-sidebar-hover bg-black">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-admin-sidebar-active rounded-lg flex items-center justify-center flex-shrink-0 bg-zinc-950">
            <img 
              src="/lovable-uploads/d0d82eec-20d9-4476-bebc-9f78f7816775.png" 
              alt="Logo" 
              className="w-6 h-6 object-contain" 
            />
          </div>
          {!isCollapsed && (
            <h1 className="text-xl font-semibold text-white">Painel Salão</h1>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-admin-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-admin-sidebar-muted text-xs uppercase tracking-wider px-6 py-2">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    className={`w-full justify-start gap-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-admin-sidebar-active text-white'
                        : 'text-admin-sidebar-muted hover:bg-admin-sidebar-hover hover:text-white'
                    }`}
                    onClick={() => onTabChange(item.id)}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${
                      activeTab === item.id ? 'text-white' : 'text-admin-sidebar-muted'
                    }`} />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-admin-sidebar-hover bg-admin-sidebar">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src="" />
            <AvatarFallback className="bg-admin-sidebar-active text-white text-sm">
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {profile?.name || 'Usuário'}
              </p>
              <Badge variant="outline" className="bg-admin-sidebar-active/20 text-admin-sidebar-active border-admin-sidebar-active">
                Parceiro
              </Badge>
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="w-full justify-start gap-2 border-admin-sidebar-hover text-admin-sidebar-muted hover:bg-admin-sidebar-hover hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};