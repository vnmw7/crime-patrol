import React, { useState } from "react";

const sampleUsers = [
  {
    id: 1,
    name: "Juan Dela Cruz",
    email: "juan@example.com",
    registrationDate: "2024-01-01",
    lastLogin: "2025-06-10",
    reportCount: 3,
    status: "active",
    notes: "",
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@example.com",
    registrationDate: "2024-03-05",
    lastLogin: "2025-06-01",
    reportCount: 5,
    status: "suspended",
    notes: "",
  },
];

const Users = () => {
  const [users, setUsers] = useState(sampleUsers);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedNote, setEditedNote] = useState("");

  const filteredUsers = users.filter((user) => {
    const matchesFilter = filter === "all" || user.status === filter;
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAction = (id, action) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              status:
                action === "suspend"
                  ? "suspended"
                  : action === "ban"
                  ? "banned"
                  : action === "unban"
                  ? "active"
                  : user.status,
            }
          : user
      )
    );
  };

  const handleSaveNote = () => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === selectedUser.id ? { ...user, notes: editedNote } : user
      )
    );
    alert("Notes saved successfully.");
  };

  return (
    <div className="p-6 min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">User Management</h2>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 rounded bg-[#1f2a40] text-white border border-gray-600"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 rounded bg-[#1f2a40] text-white border border-gray-600"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-[#364153] text-gray-300 uppercase text-xs">
            <tr>
              <th className="py-3">User ID</th>
              <th className="py-3">Name</th>
              <th className="py-3">Email</th>
              <th className="py-3">Registration Date</th>
              <th className="py-3">Last Login</th>
              <th className="py-3">Report Count</th>
              <th className="py-3">Status</th>
              <th className="py-3">Action</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="bg-[#1e2a3a] cursor-pointer"
                onClick={() => {
                  setSelectedUser(user);
                  setEditedNote(user.notes || "");
                }}
              >
                <td className="py-3">{user.id}</td>
                <td className="py-3">{user.name}</td>
                <td className="py-3">{user.email}</td>
                <td className="py-3">{user.registrationDate}</td>
                <td className="py-3">{user.lastLogin}</td>
                <td className="py-3">{user.reportCount}</td>
                <td className="py-3 capitalize">{user.status}</td>
                <td className="py-3 space-y-1">
                  <div className="flex flex-wrap justify-center gap-1">
                    {user.status !== "banned" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(user.id, "ban");
                        }}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                      >
                        Ban
                      </button>
                    )}
                    {user.status !== "suspended" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(user.id, "suspend");
                        }}
                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                      >
                        Suspend
                      </button>
                    )}
                    {user.status !== "active" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(user.id, "unban");
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                      >
                        Unban
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Reset password triggered for ${user.name}`);
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Viewing activity log for ${user.name}`);
                      }}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded"
                    >
                      View Activity Log
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="mt-6 p-4 rounded bg-[#364153] border border-gray-600">
          <h3 className="text-xl font-semibold mb-2 text-blue-300">
            Admin Notes for {selectedUser.name}
          </h3>
          <p className="mb-2 text-gray-300">Email: {selectedUser.email}</p>
          <textarea
            value={editedNote}
            onChange={(e) => setEditedNote(e.target.value)}
            className="w-full p-2 border border-gray-600 rounded bg-[#0e1625] text-white"
            rows="4"
            placeholder="Write admin notes here..."
          />
          <button
            onClick={handleSaveNote}
            className="mt-3 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
          >
            Save Notes
          </button>
        </div>
      )}
    </div>
  );
};

export default Users;
