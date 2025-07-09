import { Package, Users, Grid3x3, Image, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
interface AdminSidebarNewProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
export const AdminSidebarNew = ({
  activeTab,
  onTabChange
}: AdminSidebarNewProps) => {
  const {
    profile,
    signOut
  } = useAuth();
  const {
    state
  } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const menuItems = [{
    id: 'treatments',
    label: 'Tratamentos',
    icon: Package
  }, {
    id: 'salons',
    label: 'Salões',
    icon: Users
  }, {
    id: 'categories',
    label: 'Categorias',
    icon: Grid3x3
  }, {
    id: 'banners',
    label: 'Banners',
    icon: Image
  }];
  return <Sidebar className="bg-admin-sidebar text-white border-r-0">
      <SidebarHeader className="p-6 border-b border-admin-sidebar-hover bg-black">
        <div className="flex items-center gap-3 bg-[#0bac00]/0">
          <div className="w-8 h-8 bg-admin-sidebar-active rounded-lg flex items-center justify-center flex-shrink-0 bg-zinc-950">
            <img src="/lovable-uploads/d0d82eec-20d9-4476-bebc-9f78f7816775.png" alt="Logo" className="w-6 h-6 object-contain" />
          </div>
          {!isCollapsed && <h1 className="text-xl font-semibold text-white">Admin Panel</h1>}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-admin-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 px-3">
            {!isCollapsed && 'Navegação'}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-4">
            <SidebarMenu className="space-y-2">
              {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton onClick={() => onTabChange(item.id)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-admin-sidebar-active text-white' : 'text-gray-300 hover:bg-admin-sidebar-hover hover:text-white'}`} tooltip={isCollapsed ? item.label : undefined}>
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>;
            })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-admin-sidebar-hover bg-admin-sidebar">
        <div className={`flex items-center gap-3 mb-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src="" />
            <AvatarFallback className="bg-admin-sidebar-active text-white text-sm">
              {profile?.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && <>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{profile?.name}</p>
                <p className="text-gray-400 text-xs truncate">{profile?.email}</p>
              </div>
              <Badge variant="outline" className="bg-admin-sidebar-active/20 text-admin-sidebar-active border-admin-sidebar-active">
                Admin
              </Badge>
            </>}
        </div>
        
        <Button onClick={signOut} variant="outline" className={`bg-transparent border-admin-sidebar-hover text-gray-300 hover:bg-admin-sidebar-hover hover:text-white ${isCollapsed ? 'w-8 h-8 p-0' : 'w-full'}`}>
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>;
};