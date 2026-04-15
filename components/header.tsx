'use client';

import { Search, Bell, Plus, Menu, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  breadcrumbs?: string[];
  onMenuClick?: () => void;
}

export function Header({ breadcrumbs = ['Dashboard', 'Overview'], onMenuClick }: HeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-background border-b border-border px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Breadcrumbs - Hidden on Mobile */}
        <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          {breadcrumbs.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && <span>/</span>}
              <span className={idx === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''}>
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {/* Search Bar - Hidden on Mobile, shown as icon only */}
          <div className="relative hidden sm:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-input border border-border rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Search Icon for Mobile */}
          <button className="sm:hidden p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors">
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Add New Project Button - Full on Desktop, Icon on Mobile */}
          <Button
            onClick={() => router.push('/projects/add')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full px-3 sm:px-6 py-2 sm:py-2 flex items-center gap-2 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Project</span>
          </Button>

          {/* Logout Button */}
          <button
            onClick={() => signOut({ redirect: true, redirectUrl: '/auth/login' })}
            className="p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
