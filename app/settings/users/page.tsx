'use client';

import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, ChevronLeft } from 'lucide-react';

const USERS = [
  {
    id: '1',
    name: 'Alice Morgan',
    email: 'alice@company.com',
    role: 'Owner',
    status: 'Active',
    joinedDate: '2024-01-15',
  },
  {
    id: '2',
    name: 'Bob Collins',
    email: 'bob@company.com',
    role: 'Project Manager',
    status: 'Active',
    joinedDate: '2024-01-20',
  },
  {
    id: '3',
    name: 'Charlie Davis',
    email: 'charlie@company.com',
    role: 'Contractor',
    status: 'Active',
    joinedDate: '2024-02-01',
  },
  {
    id: '4',
    name: 'Engineer A',
    email: 'engineer@company.com',
    role: 'Engineer',
    status: 'Active',
    joinedDate: '2024-02-15',
  },
  {
    id: '5',
    name: 'Sarah Williams',
    email: 'sarah@company.com',
    role: 'Project Manager',
    status: 'Inactive',
    joinedDate: '2024-03-01',
  },
];

const getRoleColor = (role: string) => {
  switch (role) {
    case 'Owner':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Project Manager':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Contractor':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Engineer':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export default function UsersPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Users & Roles</h1>
          <p className="text-gray-600 text-sm mt-1">Manage team members and permissions</p>
        </div>
      </div>

      {/* Add User Button */}
      <div className="mb-6">
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Invite User
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-900">User</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-900 hidden sm:table-cell">Role</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-900 hidden md:table-cell">Status</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-900 hidden lg:table-cell">Joined</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {USERS.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                        <AvatarImage src={`https://avatar.vercel.sh/${user.name.split(' ')[0].toLowerCase()}`} />
                        <AvatarFallback className="text-xs">{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                    <span className={`text-xs font-medium ${user.status === 'Active' ? 'text-emerald-700' : 'text-gray-500'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-xs text-gray-600 hidden lg:table-cell">
                    {new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <button className="p-1 hover:bg-gray-100 rounded-lg transition">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
