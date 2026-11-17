import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  MessageSquare, 
  Calendar, 
  User, 
  LogOut, 
  Lock,
  FileText,
  Cpu,
  Receipt,
  BookOpen,
  Layers,
  ShieldCheck,
  Video,
  Server,
  Globe,
  Boxes,
  HardDrive,
  Activity
} from 'lucide-react';
import Tooltip from './Tooltip';

interface SidebarProps {
  role: 'admin' | 'customer';
  displayName: string;
  companyName?: string;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  unreadCount?: number;
  syncStatus?: 'saved' | 'saving' | 'error';
  lastSaved?: Date | null;
}

export default function Sidebar({
  role,
  displayName,
  companyName,
  currentTab,
  onTabChange,
  onLogout,
  unreadCount = 0,
  syncStatus = 'saved',
  lastSaved = null
}: SidebarProps) {
  const isAdmin = role === 'admin';

  const adminNavItems = [
    { id: 'dashboard', label: 'Management Dashboard', icon: LayoutDashboard },
    { id: 'auditlogs', label: 'Benutzer-Aktionen', icon: Activity },
    { id: 'customers', label: 'Kundenverwaltung', icon: Users },
    { id: 'projects', label: 'Kunden-Projekte', icon: Server },
    { id: 'inventory', label: 'Warenwirtschaft (WWS)', icon: Boxes },
    { id: 'files', label: 'Dokumenten-Zentrale', icon: FolderOpen },
    { id: 'messages', label: 'DMs', icon: MessageSquare, badge: unreadCount },
    { id: 'appointments', label: 'Termine & Planung', icon: Calendar },
    { id: 'invoices', label: 'Finanzen & Rechnungen', icon: Receipt },
    { id: 'bottraining', label: 'KI-Bot Training', icon: Cpu },
    { id: 'documentation', label: 'Handbuch & Dokus', icon: BookOpen },
  ];

  const customerNavItems = [
    { id: 'dashboard', label: 'Kunden-Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Warenbestand (WWS)', icon: Boxes },
    { id: 'contracts', label: 'Vertragsübersicht', icon: ShieldCheck },
    { id: 'files', label: 'Dokumente & Uploads', icon: FolderOpen },
    { id: 'messages', label: 'DMs', icon: MessageSquare, badge: unreadCount },
    { id: 'appointments', label: 'Termine & Planung', icon: Calendar },
    { id: 'invoices', label: 'Meine Rechnungen', icon: Receipt },
    { id: 'profile', label: 'Profil & Stammdaten', icon: User },
    { id: 'documentation', label: 'Hilfe & Handbuch', icon: BookOpen },
  ];

  const items = isAdmin ? adminNavItems : customerNavItems;

  // Visual Styling customized by User Role (High Density Admin, High Density Customer)
  const roleStyles = isAdmin 
    ? {
        bg: 'bg-slate-900 border-r border-slate-800',
        activeItem: 'bg-indigo-600 text-white shadow-sm rounded-md',
        hoverItem: 'hover:bg-slate-800 text-slate-400 hover:text-white rounded-md',
        border: 'border-slate-800',
        logoText: 'text-indigo-400',
        logoBg: 'bg-indigo-500',
        roleBadge: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
      }
    : {
        bg: 'bg-slate-900 border-r border-slate-800', // Keeping coherent workspace colors for customers too per spec or emerald theme
        activeItem: 'bg-emerald-600 text-white shadow-sm rounded-md',
        hoverItem: 'hover:bg-slate-800 text-slate-400 hover:text-white rounded-md',
        border: 'border-slate-800',
        logoText: 'text-emerald-400',
        logoBg: 'bg-emerald-600',
        roleBadge: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
      };

  return (
    <aside className={`w-64 ${roleStyles.bg} text-white flex flex-col h-screen select-none`}>
      {/* Brand & Corporate Header */}
      <div className={`p-5 border-b ${roleStyles.border} flex items-center gap-3`}>
        <div className={`w-8 h-8 ${roleStyles.logoBg} rounded-md flex items-center justify-center font-bold text-white flex-shrink-0`}>
          C
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold tracking-tight text-slate-100 leading-none truncate uppercase">{companyName || 'CRM Portal'}</h2>
          <span className="text-[10px] text-slate-500 font-mono tracking-wider mt-0.5 block">LOCAL CRM v1.0</span>
        </div>
      </div>

      {/* User Information Display Card - High Density Compact */}
      <div className={`p-3.5 mx-3.5 my-3 bg-slate-800/40 rounded-lg border ${roleStyles.border}`}>
        <p className="text-[9px] text-slate-500 uppercase font-mono font-bold tracking-wider leading-none">Angemeldet als</p>
        <p className="text-xs font-semibold text-slate-200 mt-1 leading-tight truncate">{displayName}</p>
        {companyName && (
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{companyName}</p>
        )}
        <div className="mt-2 flex items-center">
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold tracking-wide uppercase ${roleStyles.roleBadge}`}>
            {isAdmin ? 'Inhaber (Admin)' : 'Mandant (Aktiv)'}
          </span>
        </div>
      </div>

      {/* Navigation Options List */}
      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <Tooltip key={item.id} content={`Wechseln zu ${item.label}`} className="w-full" position="right">
              <button
                id={`nav-tab-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 transition-all duration-200 group text-sm font-medium ${
                  isActive ? roleStyles.activeItem : roleStyles.hoverItem
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'scale-105' : 'opacity-70 group-hover:opacity-100 transition-opacity'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="bg-rose-500 text-white font-bold font-mono text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            </Tooltip>
          );
        })}
      </nav>

      {/* LOCAL TO SERVER PERSISTENCE STATUS BAR */}
      <div className={`mx-3 mb-3 p-2.5 rounded-lg border bg-slate-950/40 text-[10px] ${roleStyles.border}`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 font-mono uppercase tracking-wider text-slate-400 font-bold">
            <HardDrive className="h-3.5 w-3.5 text-indigo-400" />
            <span>CRM-Sicherung</span>
          </div>
          {syncStatus === 'saved' && (
            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1 py-0.5 rounded font-mono font-bold uppercase tracking-wide">
              SQLite-Sync
            </span>
          )}
          {syncStatus === 'saving' && (
            <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/25 px-1 py-0.5 rounded font-mono font-bold uppercase tracking-wide animate-pulse">
              Sichern...
            </span>
          )}
          {syncStatus === 'error' && (
            <span className="text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/25 px-1 py-0.5 rounded font-mono font-bold uppercase tracking-wide animate-bounce">
              Sync-Fehler
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1.5">
          <div className="relative flex h-2 w-2">
            {syncStatus === 'saving' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            )}
            {syncStatus === 'error' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              syncStatus === 'saved' ? 'bg-emerald-500' :
              syncStatus === 'saving' ? 'bg-amber-500' :
              'bg-rose-500'
            }`}></span>
          </div>

          <div className="flex-1 min-w-0 font-mono text-slate-350 select-text leading-tight">
            <div className="flex justify-between text-[8px] text-slate-500">
              <span>SQLite-DB:</span>
              <span className="text-slate-300 font-semibold truncate hover:text-white" title="/data/crm.db">/data/crm.db</span>
            </div>
            <div className="flex justify-between text-[8px] text-slate-500 mt-0.5">
              <span>Zeitstempel:</span>
              <span className="text-indigo-300 font-bold">
                {lastSaved ? lastSaved.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Nie'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Footer Section */}
      <div className={`p-3 border-t ${roleStyles.border} bg-black/10`}>
        <Tooltip content="Sitzung sicher beenden und abmelden" className="w-full" position="right">
          <button
            id="btn-logout"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-slate-400 hover:text-rose-200 hover:bg-rose-500/10 rounded-md transition-all duration-200 text-left font-medium"
          >
            <LogOut className="h-4 w-4 opacity-70 group-hover:opacity-100" />
            <span>Abmelden</span>
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
