import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where
} from "firebase/firestore";
import {
  HiUsers,
  HiCheckCircle,
  HiClock,
  HiPause,
  HiSun,
  HiChartBar,
  HiCalendar,
  HiFilter,
  HiEye,
  HiDocumentDownload,
  HiRefresh,
  HiUserGroup,
  HiChartPie,
} from "react-icons/hi";
import {
  HiArrowTrendingDown,
  HiArrowTrendingUp,
  HiTableCells
} from "react-icons/hi2";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AdminAnalytics = () => {
  const [workSessions, setWorkSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("today");
  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ FETCH WORK SESSIONS
  useEffect(() => {
    const q = query(
      collection(db, "workSessions"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWorkSessions(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching work sessions:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ CONVERT WORK SESSIONS TO ATTENDANCE FORMAT
  const convertToAttendanceFormat = (sessions) => {
    return sessions.map(session => {
      const loginDate = session.loginTime?.toDate ? session.loginTime.toDate() : new Date(session.loginTime);
      const logoutDate = session.logoutTime?.toDate ? session.logoutTime.toDate() : new Date(session.logoutTime);
      
      return {
        id: session.id,
        name: session.employeeName,
        employeeId: session.employeeId,
        loginTime: loginDate ? loginDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
        logoutTime: logoutDate ? logoutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
        breakStart: session.breakStart?.toDate ? session.breakStart.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : session.breakStart || "",
        breakEnd: session.breakEnd?.toDate ? session.breakEnd.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : session.breakEnd || "",
        lunchStart: session.lunchStart?.toDate ? session.lunchStart.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : session.lunchStart || "",
        lunchEnd: session.lunchEnd?.toDate ? session.lunchEnd.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : session.lunchEnd || "",
        totalHours: session.totalHours || "",
        workStatus: session.status || "idle",
        status: session.status || "idle",
        date: loginDate ? loginDate.toDateString() : new Date().toDateString(),
        createdAt: session.createdAt || new Date(),
        employeeEmail: session.employeeEmail
      };
    });
  };

  // ✅ DATE FILTERING
  const getFilteredAttendance = () => {
    const attendanceData = convertToAttendanceFormat(workSessions);
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    switch (dateFilter) {
      case "today":
        return attendanceData.filter(a => a.date === today);
      case "yesterday":
        return attendanceData.filter(a => a.date === yesterdayStr);
      case "last7days":
        return attendanceData.filter(a => {
          const sessionDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          return sessionDate > last7Days;
        });
      default:
        return attendanceData;
    }
  };

  // ✅ STATUS FILTERING
  const getStatusFilteredData = (data) => {
    if (statusFilter === "all") return data;
    return data.filter(emp => emp.workStatus === statusFilter || emp.status === statusFilter);
  };

  const filteredAttendance = getStatusFilteredData(getFilteredAttendance());

  // ✅ HELPER FUNCTIONS
  const parseHoursToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatMinutesToHours = (minutes) => {
    if (!minutes) return "0:00";
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hrs}:${mins.toString().padStart(2, '0')}`;
  };

  const calculateTotalHours = (loginTime, logoutTime) => {
    if (!loginTime || !logoutTime) return "";
    
    try {
      const login = new Date(`1970-01-01 ${loginTime}`);
      const logout = new Date(`1970-01-01 ${logoutTime}`);
      const diffMs = logout - login;
      const hrs = Math.floor(diffMs / 3600000);
      const mins = Math.floor((diffMs % 3600000) / 60000);
      return `${hrs}:${mins.toString().padStart(2, '0')}`;
    } catch (e) {
      return "";
    }
  };

  // ✅ ANALYTICS COUNTS
  const calculateAnalytics = () => {
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const todayData = getFilteredAttendance().filter(a => a.date === today);
    const yesterdayData = getFilteredAttendance().filter(a => a.date === yesterdayStr);

    const totalEmployeesToday = todayData.length;
    const totalEmployeesYesterday = yesterdayData.length;

    const presentToday = todayData.filter(a => a.loginTime).length;
    const presentYesterday = yesterdayData.filter(a => a.loginTime).length;

    const workingNow = todayData.filter(a => a.workStatus === "working").length;
    const breakNow = todayData.filter(a => a.workStatus === "break").length;
    const lunchNow = todayData.filter(a => a.workStatus === "lunch").length;
    const completedToday = todayData.filter(a => a.status === "completed" || a.workStatus === "completed").length;

    // Calculate average hours for today
    const todaySessionsWithHours = todayData.filter(a => a.loginTime && a.logoutTime);
    const todayTotalMinutes = todaySessionsWithHours.reduce((acc, curr) => {
      const hours = calculateTotalHours(curr.loginTime, curr.logoutTime);
      return acc + parseHoursToMinutes(hours);
    }, 0);
    
    const todayAvgHours = todaySessionsWithHours.length > 0 
      ? todayTotalMinutes / todaySessionsWithHours.length 
      : 0;

    const productivityScore = Math.round((workingNow / Math.max(presentToday, 1)) * 100);

    const attendanceRate = Math.round((presentToday / Math.max(totalEmployeesToday, 1)) * 100);
    const yesterdayAttendanceRate = Math.round((presentYesterday / Math.max(totalEmployeesYesterday, 1)) * 100);
    const attendanceTrend = attendanceRate - yesterdayAttendanceRate;

    return {
      totalEmployeesToday,
      presentToday,
      workingNow,
      breakNow,
      lunchNow,
      completedToday,
      todayAvgHours: formatMinutesToHours(todayAvgHours),
      productivityScore,
      attendanceRate,
      attendanceTrend,
      totalSessions: workSessions.length
    };
  };

  const analytics = calculateAnalytics();

  // ✅ CHARTS DATA
  const getStatusDistributionData = () => {
    const statusCounts = {
      working: 0,
      break: 0,
      lunch: 0,
      completed: 0,
      idle: 0
    };

    filteredAttendance.forEach(emp => {
      const status = emp.workStatus || emp.status || "idle";
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    });

    return {
      labels: Object.keys(statusCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [
          '#10B981', // green for working
          '#FBBF24', // yellow for break
          '#F87171', // red for lunch
          '#8B5CF6', // purple for completed
          '#6B7280'  // gray for idle
        ],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }]
    };
  };

  const getAttendanceTrendData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    }).reverse();

    const dailyCounts = last7Days.map(day => {
      return getFilteredAttendance().filter(a => a.date === day).length;
    });

    return {
      labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [{
        label: 'Attendance',
        data: dailyCounts,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "working": return "bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-200";
      case "break": return "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border-yellow-200";
      case "lunch": return "bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 border-orange-200";
      case "completed": return "bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border-purple-200";
      default: return "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200";
    }
  };

  const exportToCSV = () => {
    const headers = ['Employee Name', 'Employee ID', 'Login Time', 'Break Start', 'Break End', 'Lunch Start', 'Lunch End', 'Logout Time', 'Total Hours', 'Status', 'Date'];
    const csvData = filteredAttendance.map(emp => [
      emp.name || 'N/A',
      emp.employeeId || 'N/A',
      emp.loginTime || '-',
      emp.breakStart || '-',
      emp.breakEnd || '-',
      emp.lunchStart || '-',
      emp.lunchEnd || '-',
      emp.logoutTime || '-',
      emp.totalHours || calculateTotalHours(emp.loginTime, emp.logoutTime) || '-',
      emp.workStatus || emp.status || 'Present',
      emp.date
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${dateFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <HiChartBar className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Admin Analytics Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  {workSessions.length} total work sessions tracked • Real-time updates
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:opacity-90 transition-opacity"
              >
                <HiDocumentDownload />
                Export CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <HiCalendar className="text-gray-400" />
                  </div>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="last7days">Last 7 Days</option>
                    <option value="all">All Time</option>
                  </select>
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <HiFilter className="text-gray-400" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="working">Working</option>
                    <option value="break">On Break</option>
                    <option value="lunch">Lunch</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="col-span-2 flex items-center gap-3">
                  <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Sessions</span>
                      <span className="font-bold text-blue-700">{workSessions.length}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    title="Refresh Data"
                  >
                    <HiRefresh className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Employees Today" 
              value={analytics.totalEmployeesToday} 
              icon={<HiUsers className="text-2xl" />}
              color="blue"
              trend={analytics.attendanceTrend}
              subtitle="Active for work"
            />
            <StatCard 
              title="Present Today" 
              value={analytics.presentToday} 
              icon={<HiCheckCircle className="text-2xl" />}
              color="green"
              percentage={analytics.attendanceRate}
              subtitle="Attendance Rate"
            />
            <StatCard 
              title="Working Now" 
              value={analytics.workingNow} 
              icon={<HiClock className="text-2xl" />}
              color="emerald"
              percentage={analytics.productivityScore}
              subtitle="Productivity Score"
            />
            <StatCard 
              title="Avg. Work Hours" 
              value={analytics.todayAvgHours} 
              icon={<HiChartBar className="text-2xl" />}
              color="purple"
              subtitle="Today's average"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <HiPause className="text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">On Break</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{analytics.breakNow}</p>
                  <p className="text-sm text-gray-600 mt-1">Employees taking break</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <HiSun className="text-orange-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Lunch Time</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{analytics.lunchNow}</p>
                  <p className="text-sm text-gray-600 mt-1">Employees at lunch</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <HiCheckCircle className="text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Completed Today</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{analytics.completedToday}</p>
                  <p className="text-sm text-gray-600 mt-1">Finished sessions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

       

        {/* Employee List Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Employee Work Sessions</h3>
              <span className="text-sm text-gray-500">{filteredAttendance.length} records</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Employee</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Login</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Break</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Lunch</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Logout</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Hours</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <HiUserGroup className="text-2xl text-gray-400" />
                      </div>
                      <p className="text-lg font-medium">No work sessions found</p>
                      <p className="text-sm">Try changing your filters or check if data exists</p>
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((emp) => {
                    const totalHours = emp.totalHours || calculateTotalHours(emp.loginTime, emp.logoutTime);
                    
                    return (
                      <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {emp.name?.split(' ').map(n => n[0]).join('').toUpperCase() || "U"}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">{emp.name || "N/A"}</div>
                              <div className="text-xs text-gray-500">{emp.employeeId || "N/A"}</div>
                              <div className="text-xs text-gray-400">{emp.employeeEmail || ""}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-700">{emp.loginTime || "-"}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-600">
                            {emp.breakStart || "-"}
                            {emp.breakEnd && (
                              <span className="block text-xs text-gray-500">→ {emp.breakEnd}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-600">
                            {emp.lunchStart || "-"}
                            {emp.lunchEnd && (
                              <span className="block text-xs text-gray-500">→ {emp.lunchEnd}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-700">{emp.logoutTime || "-"}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-gray-800">
                            {totalHours || "-"}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(emp.workStatus || emp.status)}`}>
                            {emp.workStatus || emp.status || "Present"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-600">
                            {emp.date ? new Date(emp.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            }) : "-"}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

       
      </div>
    </div>
  );
};

// ✅ Enhanced Stat Card Component
const StatCard = ({ title, value, icon, color, percentage, trend, subtitle }) => {
  const colors = {
    blue: "from-blue-500 to-indigo-600",
    green: "from-green-500 to-emerald-600",
    emerald: "from-emerald-500 to-teal-600",
    purple: "from-purple-500 to-indigo-600",
    yellow: "from-yellow-500 to-orange-600",
    red: "from-red-500 to-pink-600"
  };

  const bgColors = {
    blue: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100",
    green: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100",
    emerald: "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100",
    purple: "bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100"
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <HiArrowTrendingUp className="text-green-500" />;
    if (trend < 0) return <HiArrowTrendingDown className="text-red-500" />;
    return null;
  };

  return (
    <div className={`rounded-2xl border p-6 ${bgColors[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colors[color]}`}>
          <div className="text-white">{icon}</div>
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1">
            {getTrendIcon(trend)}
            <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 mb-2">{value}</p>
        {percentage !== undefined && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">{percentage}%</span>
          </div>
        )}
        {subtitle && (
          <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;