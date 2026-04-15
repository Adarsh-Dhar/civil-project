'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { LayoutGrid, FolderOpen, Settings, BarChart3 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SidebarProps {
  activeNav?: string;
  onNavChange?: (nav: string) => void;
}

export function Sidebar({ activeNav = 'overview', onNavChange }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [resolvedRole, setResolvedRole] = useState<string | null>(null);
  const [resolvedImage, setResolvedImage] = useState<string | null>(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, href: '/dashboard' },
    { id: 'projects', label: 'Projects', icon: FolderOpen, href: '/projects' },
    { id: 'reports', label: 'Reports', icon: BarChart3, href: '/reports' },
  ];

  useEffect(() => {
    let cancelled = false;

    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (!cancelled && data?.user) {
          setResolvedName(data.user.name || null);
          setResolvedRole(data.user.role || null);
          setResolvedImage(data.user.image || null);
        }
      } catch (error) {
        console.error('Failed to fetch current user profile:', error);
      }
    };

    fetchCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const userName = resolvedName || session?.user?.name || 'User';
  const userRole = resolvedRole || (session?.user as any)?.role || 'Member';
  const userImage = resolvedImage || session?.user?.image || `https://avatar.vercel.sh/${encodeURIComponent(userName.toLowerCase())}`;
  const userInitials = userName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isNavActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-screen shadow-lg">
      {/* Logo */}
      <Link href="/dashboard" className="p-4 sm:p-6 border-b border-sidebar-border hover:bg-sidebar-accent transition">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
            L
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-sidebar-foreground">LoopBuild</h1>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors text-sm sm:text-base ${
                active
                  ? 'bg-primary/15 text-primary'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-3 sm:p-4 border-t border-sidebar-border space-y-3 sm:space-y-4">
        <Link href="/settings" className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent rounded-lg transition-colors">
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium text-sm hidden sm:inline">Settings</span>
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-3 p-2 sm:p-3 bg-sidebar-accent rounded-lg">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={userImage} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 hidden sm:block">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">{userRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
