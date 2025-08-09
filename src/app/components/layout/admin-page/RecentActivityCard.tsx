import React from "react";

type HourlyTrend = {
  hour: number;
  date: string;
  activeUsers: number;
  cpu: number;
  memory: number;
  temperature: number;
};

type DashboardData = {
  trends: {
    hourly: HourlyTrend[];
  };
};

type Props = {
  dashboardData: DashboardData;
};

function formatHour(hour: number): string {
  return `${hour?.toString().padStart(2, '0')}:00`;
}

export function RecentActivityCard({ dashboardData }: Props) {
  const hourlyData = dashboardData?.trends?.hourly || [];

  const activities = hourlyData.map((entry) => {
    const timeLabel = `${entry.date} @ ${formatHour(entry.hour)}`;
    return [
      {
        type: 'user',
        message: `${entry.activeUsers} user${entry.activeUsers !== 1 ? 's' : ''} active`,
        time: timeLabel
      },
      {
        type: 'cpu',
        message: `CPU usage: ${entry.cpu?.toFixed(1)}%`,
        time: timeLabel
      },
      {
        type: 'memory',
        message: `Memory usage: ${entry.memory?.toFixed(1)}%`,
        time: timeLabel
      }
    ];
  }).flat(); // Flatten array of arrays into a single activity list

  return (
    <div className="bg-black rounded-xl shadow-sm p-6 border border-gray-500/25">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">System Activity (Hourly)</h3>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-300">No recent system activity recorded.</p>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'cpu' && parseFloat(activity.message?.split(': ')[1]) > 80
                  ? 'bg-red-500'
                  : 'bg-green-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm text-gray-100">{activity?.message}</p>
                <p className="text-xs text-gray-300">{activity?.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
