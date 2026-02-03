'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 text-sm mt-2">Manage your account and organization</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.id} href={section.href}>
              <Card className="p-4 sm:p-6 cursor-pointer bg-white border border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-lg transition h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{section.title}</h3>
                <p className="text-sm text-gray-600">{section.description}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
