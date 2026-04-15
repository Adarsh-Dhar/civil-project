'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ChevronRight, Users, Bell, Palette, Database, Key } from 'lucide-react';

const SETTINGS_SECTIONS = [
  {
    id: 'team',
    title: 'Team & Users',
    description: 'Manage team members and permissions',
    icon: Users,
    href: '/settings/users',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configure notification preferences',
    icon: Bell,
    href: '/settings/notifications',
  },
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Customize theme and display',
    icon: Palette,
    href: '/settings/appearance',
  },
  {
    id: 'data',
    title: 'Data & Export',
    description: 'Export projects and archives',
    icon: Database,
    href: '/settings/data',
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Manage passwords and access',
    icon: Key,
    href: '/settings/security',
  },
];

export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-2">Manage your account and organization</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.id} href={section.href}>
              <Card className="p-4 sm:p-6 cursor-pointer bg-card border border-border shadow-sm hover:border-primary/40 hover:shadow-lg transition h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{section.title}</h3>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
