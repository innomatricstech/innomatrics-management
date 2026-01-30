import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { 
  HiFilter, 
  HiCalendar, 
  HiUser, 
  HiDocumentText,
  HiOutlineSparkles,
  HiArrowDown,
  HiOutlineSearch,
  HiOutlineX,
  HiEye
} from "react-icons/hi";

const DailyReportPage = () => {
  const [reports, setReports] = useState([]);
  const [selectedName, setSelectedName] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ FETCH ALL REPORTS
  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(data);
    });
    return () => unsubscribe();
  }, []);

  // ✅ GET UNIQUE EMPLOYEE NAMES
  const uniqueNames = [
    "ALL",
    ...new Set(reports.map(r => r.name).filter(Boolean))
  ];

  // ✅ FORMAT DATE FOR FILTERING
  const formatDateForFilter = (timestamp) => {
    if (!timestamp?.toDate) return "";
    const date = timestamp.toDate();
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // ✅ ENHANCED FILTER LOGIC WITH DATE FILTER
  const filteredReports = reports.filter(report => {
    const matchesName = selectedName === "ALL" || report.name === selectedName;
    
    const matchesSearch = 
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || 
      formatDateForFilter(report.createdAt) === dateFilter;

    return matchesName && matchesSearch && matchesDate;
  });

  // ✅ GROUP FILTERED REPORTS (Only when "ALL" is selected)
  const getDisplayReports = () => {
    if (selectedName === "ALL") {
      // Group by name when viewing all
      return filteredReports.reduce((acc, report) => {
        const key = report.name || "Unknown";
        if (!acc[key]) acc[key] = [];
        acc[key].push(report);
        return acc;
      }, {});
    } else {
      // Return as a single group when specific name is selected
      return { [selectedName]: filteredReports };
    }
  };

  const groupedReports = getDisplayReports();

  // ✅ FORMAT DATE FOR DISPLAY
  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "-";
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ HANDLE VIEW DETAILS
  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  // ✅ CLEAR FILTERS
  const clearFilters = () => {
    setSelectedName("ALL");
    setSearchTerm("");
    setDateFilter("");
  };

  // ✅ REPORT DETAILS MODAL
  const ReportModal = ({ report, onClose }) => {
    if (!report) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Report Details</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <HiOutlineX className="text-xl text-gray-500" />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">
                  {report.name?.split(' ').map(n => n[0]).join('').toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{report.name || "Unknown"}</h4>
                <p className="text-gray-500 text-sm">{report.employeeId}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Title</h4>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{report.title}</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Description</h4>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-xl whitespace-pre-wrap">
                {report.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Submitted Date</h4>
                <p className="text-gray-800">{formatDate(report.createdAt)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                <p className="text-gray-800">{report.loginEmail || "N/A"}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 lg:px-8">
      
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
              <HiDocumentText className="text-2xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Team End-of-Day Reports
              </h2>
              <p className="text-gray-500 text-sm mt-1">Track daily progress and updates from your team</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full">
            <HiOutlineSparkles className="text-blue-500" />
            <span className="text-sm font-semibold text-blue-700">
              {filteredReports.length} Reports
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <HiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports by title, description, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <HiOutlineX />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex gap-3">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <HiUser className="text-gray-400" />
                </div>
                <select
                  value={selectedName}
                  onChange={(e) => setSelectedName(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {uniqueNames.map(name => (
                    <option key={name} value={name} className="py-2">
                      {name}
                    </option>
                  ))}
                </select>
                <HiArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <HiCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>

              {(selectedName !== "ALL" || searchTerm || dateFilter) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <HiOutlineX />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <HiDocumentText className="text-3xl text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Reports Found</h3>
          <p className="text-gray-500">Try changing your filters or check back later</p>
        </div>
      ) : (
        Object.entries(groupedReports).map(([userName, userReports]) => (
          <div key={userName} className="mb-12">
            
            {/* Show user header only when viewing ALL */}
            {selectedName === "ALL" && (
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{userName}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <HiDocumentText className="text-blue-500" />
                      {userReports.length} reports
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <HiCalendar className="text-green-500" />
                      Latest: {formatDate(userReports[0]?.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Reports Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userReports.map(report => (
                <div
                  key={report.id}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Report Header */}
                  <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {report.title}
                      </h4>
                      <span className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-full text-gray-600">
                        {report.employeeId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <HiCalendar className="text-blue-500" />
                      {formatDate(report.createdAt)}
                    </div>
                  </div>

                  {/* Report Body */}
                  <div className="p-5">
                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {report.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-lg">
                        EOD Report
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-lg">
                        Daily Update
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      {selectedName === "ALL" && (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                            <HiUser className="text-white text-sm" />
                          </div>
                          <span className="text-sm text-gray-500">{report.name}</span>
                        </div>
                      )}
                      <button 
                        onClick={() => handleViewDetails(report)}
                        className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors flex items-center gap-1"
                      >
                        <HiEye className="text-base" />
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Report Details Modal */}
      {isModalOpen && selectedReport && (
        <ReportModal 
          report={selectedReport} 
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReport(null);
          }} 
        />
      )}
    </div>
  );
};

export default DailyReportPage;