
import React from "react";
import ModernCard from "@/components/ui/modern-card";
import { ShoppingBag, Users, Package, AlertCircle, Clock } from "lucide-react";

export type ActivityType = 'order' | 'user' | 'product' | 'support';

export interface Activity {
  id: number;
  type: ActivityType;
  description: string;
  time: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <ModernCard title="Recent Activity" className="h-full overflow-hidden">
      <div className="space-y-4 max-h-[220px] overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
              activity.type === 'order' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' :
              activity.type === 'user' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' :
              activity.type === 'product' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300' :
              'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
            }`}>
              {activity.type === 'order' && <ShoppingBag className="h-5 w-5" />}
              {activity.type === 'user' && <Users className="h-5 w-5" />}
              {activity.type === 'product' && <Package className="h-5 w-5" />}
              {activity.type === 'support' && <AlertCircle className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{activity.description}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ModernCard>
  );
};

export default RecentActivity;
