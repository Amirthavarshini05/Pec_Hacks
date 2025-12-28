// src/Dashboard.js
import React, { useEffect, useState } from "react";
import { Users, GraduationCap, Building2, FileText } from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = ({ adminName = "Admin" }) => {
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem("profileBasic"));
    if (profile?.role === "ministry" || profile?.role === "secretary") {
      setDepartment("all"); // ministry & secretary see all by default
      setRole(profile.role);
    } else if (profile?.department) {
      setDepartment(profile.department);
      setRole(profile.role || "admin");
    }
  }, []);

  // ✅ Expanded mock users across departments
  const allUsers = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Student", department: "engineering" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Student", department: "arts-science" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "Teacher", department: "medical" },
    { id: 4, name: "Priya Sharma", email: "priya@example.com", role: "Student", department: "arts-science" },
    { id: 5, name: "Arun Kumar", email: "arun@example.com", role: "Professor", department: "engineering" },
    { id: 6, name: "Fatima Ali", email: "fatima@example.com", role: "Student", department: "medical" },
    { id: 7, name: "Rahul Mehta", email: "rahul@example.com", role: "Student", department: "engineering" },
    { id: 8, name: "Sophia Thomas", email: "sophia@example.com", role: "Teacher", department: "arts-science" },
  ];

  // Career distribution
  const careerDataByDept = {
    "arts-science": [
      { name: "BA English", value: 20 },
      { name: "BSc Physics", value: 30 },
      { name: "BCom", value: 25 },
      { name: "Others", value: 25 },
    ],
    engineering: [
      { name: "CSE", value: 35 },
      { name: "ECE", value: 25 },
      { name: "Mechanical", value: 20 },
      { name: "Civil", value: 20 },
    ],
    medical: [
      { name: "MBBS", value: 50 },
      { name: "BDS", value: 20 },
      { name: "Nursing", value: 15 },
      { name: "Pharmacy", value: 15 },
    ],
  };

  // Stats by department
  const statsByDept = {
    "arts-science": [
      { title: "Total Users", value: 350, icon: <Users className="h-10 w-10 text-blue-600" /> },
      { title: "Careers", value: 15, icon: <FileText className="h-10 w-10 text-green-600" /> },
      { title: "Colleges", value: 45, icon: <Building2 className="h-10 w-10 text-indigo-600" /> },
      { title: "Scholarships", value: 12, icon: <GraduationCap className="h-10 w-10 text-yellow-600" /> },
    ],
    engineering: [
      { title: "Total Users", value: 500, icon: <Users className="h-10 w-10 text-blue-600" /> },
      { title: "Careers", value: 20, icon: <FileText className="h-10 w-10 text-green-600" /> },
      { title: "Colleges", value: 80, icon: <Building2 className="h-10 w-10 text-indigo-600" /> },
      { title: "Scholarships", value: 15, icon: <GraduationCap className="h-10 w-10 text-yellow-600" /> },
    ],
    medical: [
      { title: "Total Users", value: 250, icon: <Users className="h-10 w-10 text-blue-600" /> },
      { title: "Careers", value: 10, icon: <FileText className="h-10 w-10 text-green-600" /> },
      { title: "Colleges", value: 30, icon: <Building2 className="h-10 w-10 text-indigo-600" /> },
      { title: "Scholarships", value: 8, icon: <GraduationCap className="h-10 w-10 text-yellow-600" /> },
    ],
  };

  // Chart colors
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1"];

  // Merge stats for all departments
  const getAllStats = () => {
    const merged = {};
    Object.values(statsByDept).forEach((deptStats) => {
      deptStats.forEach((s) => {
        if (!merged[s.title]) {
          merged[s.title] = { ...s, value: s.value };
        } else {
          merged[s.title].value += s.value;
        }
      });
    });
    return Object.values(merged);
  };

  // Merge career distributions
  const getAllCareerDistribution = () => {
    const merged = {};
    Object.values(careerDataByDept).forEach((deptData) => {
      deptData.forEach((c) => {
        if (!merged[c.name]) {
          merged[c.name] = { ...c, value: c.value };
        } else {
          merged[c.name].value += c.value;
        }
      });
    });
    return Object.values(merged);
  };

  // Final data
  const usersTable =
    department === "all" ? allUsers : allUsers.filter((u) => u.department === department);

  const stats =
    department === "all" ? getAllStats() : statsByDept[department] || [];

  const careerDistribution =
    department === "all" ? getAllCareerDistribution() : careerDataByDept[department] || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 px-8 py-6">
        {/* Greeting */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 mb-6 shadow-md flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-indigo-700">
              Welcome back, {adminName} 👋
            </h2>
            {department && (
              <p className="text-gray-600 capitalize">
                {department === "all"
                  ? `Role: ${role} (All Departments)`
                  : `Department: ${department.replace("-", " ")}`}
              </p>
            )}
            <p className="text-gray-600">Here are the latest statistics and updates</p>
          </div>

          {/* Dropdown only for ministry & secretary */}
          {(role === "ministry" || role === "secretary") && (
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-4 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-300"
            >
              <option value="all">All Departments</option>
              <option value="arts-science">Arts & Science</option>
              <option value="engineering">Engineering</option>
              <option value="medical">Medical</option>
            </select>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-md flex items-center justify-between hover:shadow-xl transition"
            >
              <div>
                <h4 className="text-gray-500 text-sm">{s.title}</h4>
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              </div>
              {s.icon}
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Growth Line Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-4 text-gray-800">User Growth</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={[
                  { month: "Jan", users: 50 },
                  { month: "Feb", users: 100 },
                  { month: "Mar", users: 150 },
                  { month: "Apr", users: 200 },
                ]}
              >
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Career Distribution Pie Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-4 text-gray-800">Career Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={careerDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {careerDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">
            Manage Users ({department === "all" ? "All Departments" : department.replace("-", " ")})
          </h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersTable.length > 0 ? (
                usersTable.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{u.id}</td>
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.role}</td>
                    <td className="p-3 flex space-x-2">
                      <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-3 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <footer className="bg-gray-100 text-gray-600 text-center py-4 border-t border-gray-200 shadow-inner">
        &copy; 2025 Career Admin Panel. All rights reserved.
      </footer>
    </div>
  );
};

export default Dashboard;
