'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, FolderOpen, Users, Shield, Lock, Settings, BarChart3, FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeNav?: string;
  onNavChange?: (nav: string) => void;
}

export function Sidebar({ activeNav = 'overview', onNavChange }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, href: '/dashboard' },
    { id: 'projects', label: 'Projects', icon: FolderOpen, href: '/projects' },
    { id: 'reports', label: 'Reports', icon: BarChart3, href: '/reports' },
  ];

  const isNavActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen shadow-lg">
      {/* Logo */}
      <Link href="/dashboard" className="p-4 sm:p-6 border-b border-gray-200 hover:bg-gray-50 transition">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
            L
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">LoopBuild</h1>
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
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-3 sm:p-4 border-t border-gray-200 space-y-3 sm:space-y-4">
        <Link href="/settings" className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium text-sm hidden sm:inline">Settings</span>
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src="https://avatar.vercel.sh/alice" />
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 hidden sm:block">
            <p className="text-sm font-medium text-gray-900 truncate">Alice Morgan</p>
            <p className="text-xs text-gray-600 truncate">Project Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}
