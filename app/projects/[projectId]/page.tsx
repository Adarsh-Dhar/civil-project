'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, MapPin, Users, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProjectOverviewPage({ params }: { params: { projectId: string } }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-6">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-2">Progress</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">65%</p>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: '65%' }}></div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-2">Total Tasks</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">48</p>
          <p className="text-xs sm:text-sm text-gray-600">32 completed</p>
        </Card>

        <Card className="p-4 sm:p-6">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-2">Team Size</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">8</p>
          <div className="flex items-center gap-1 -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <Avatar key={i} className="w-6 h-6 border-2 border-white">
                <AvatarImage src={`https://avatar.vercel.sh/user${i}`} />
                <AvatarFallback className="text-xs">U{i}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-2">Issues</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">3</p>
          <p className="text-xs sm:text-sm text-gray-600">Need attention</p>
        </Card>
      </div>

      {/* Project Details & Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Location</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900">Downtown District, Center City</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Timeline</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900">Jan 15, 2024 - Jun 30, 2025</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Project Manager</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900">Alice Morgan</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <Avatar className="w-8 h-8 mt-0.5">
                    <AvatarImage src={`https://avatar.vercel.sh/user${i}`} />
                    <AvatarFallback className="text-xs">U{i}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-900">
                      <span className="font-medium">User {i}</span> completed Foundation Pouring task
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Issues */}
        <div>
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Open Issues</h3>
            <div className="space-y-3">
              <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-red-900">Missing Inspection Proof</p>
                    <p className="text-xs text-red-700 mt-1">Electrical wiring inspection - Due today</p>
                  </div>
                </div>
              </div>

              <div className="p-3 border border-amber-200 bg-amber-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-amber-900">Delayed Delivery</p>
                    <p className="text-xs text-amber-700 mt-1">Steel beams - Expected 2 days late</p>
                  </div>
                </div>
              </div>

              <div className="p-3 border border-amber-200 bg-amber-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-amber-900">Approval Pending</p>
                    <p className="text-xs text-amber-700 mt-1">Foundation inspection - Awaiting government approval</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
