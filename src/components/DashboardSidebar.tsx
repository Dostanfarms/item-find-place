import { Users, Store, Truck, ChevronDown, BarChart3, Settings, FileText } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const menuItems = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: BarChart3,
    type: "single"
  },
  {
    title: "Management",
    icon: Settings,
    type: "group",
    items: [
      { title: "Users", url: "/dashboard/users", icon: Users },
      { title: "Sellers", url: "/dashboard/sellers", icon: Store },
      { title: "Orders", url: "/dashboard/orders", icon: FileText },
      { title: "Delivery Partners", url: "/dashboard/delivery-partners", icon: Truck },
    ]
  }
];

export function DashboardSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar variant="sidebar" className="border-r border-border">
      <SidebarContent className="p-0">
        <div className="p-4 border-b border-border">
          <h2 className={`font-semibold text-foreground transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}>
            Admin Panel
          </h2>
        </div>

        <div className="p-2">
          {menuItems.map((item, index) => (
            <div key={index} className="mb-2">
              {item.type === "single" ? (
                <SidebarMenuButton asChild className="w-full">
                  <NavLink 
                    to={item.url} 
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full ${
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {open && <span className="truncate">{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              ) : (
                <Collapsible defaultOpen={true}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full hover:bg-muted text-muted-foreground hover:text-foreground">
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {open && (
                        <>
                          <span className="truncate flex-1 text-left">{item.title}</span>
                          <ChevronDown className="h-4 w-4 transition-transform ui-state-open:rotate-180" />
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  
                  {open && (
                    <CollapsibleContent className="ml-6 mt-1 space-y-1">
                      {item.items?.map((subItem) => (
                        <SidebarMenuButton key={subItem.title} asChild>
                          <NavLink 
                            to={subItem.url} 
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${
                                isActive 
                                  ? "bg-primary text-primary-foreground" 
                                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
                              }`
                            }
                          >
                            <subItem.icon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{subItem.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      ))}
                    </CollapsibleContent>
                  )}
                </Collapsible>
              )}
            </div>
          ))}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}