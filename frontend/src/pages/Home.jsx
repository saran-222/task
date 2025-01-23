import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext'; 

const ImportUsers = ({ onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file first!');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://localhost:5000/api/v1/uploadusers', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (response.status === 200) {
        onImportSuccess(response.data.users);
        alert('File uploaded successfully');
      } else {
        alert('Server processed the file but encountered an issue.');
      }
    } catch (error) {
      if (error.response) {
        alert(`Error uploading file: ${error.response.data.message || 'Unknown error'}`);
      } else {
        alert(`Error uploading file: ${error.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload} className="bg-blue-500 text-white py-2 px-4 rounded">Upload Users</button>
    </div>
  );
};

const ExportUsersButton = () => {
  const handleExport = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/exportusers', {
        responseType: 'blob', 
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      const file = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileURL = window.URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = 'users_export.xlsx'
      link.click();
    } catch (error) {
      alert('Error exporting file');
    }
  };
  return (
    <button onClick={handleExport} className="bg-blue-500 text-white py-2 px-4 rounded">Export Users</button>

  );
};

const UserTable = ({ users, onEdit, onDelete }) => {
  return (
    <div className="overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.length > 0 ? (
            users.map((user, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.first_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.last_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.gender}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.city}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.state}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.dob}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded" onClick={() => onEdit(user)}>
                    Edit
                  </button>
                  <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded ml-2" onClick={() => onDelete(user._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const EditModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    city: user.city,
    state: user.state,
    dob: user.dob
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onClose(); 

    try {
      await axios.put(`http://localhost:5000/api/v1/updateuser/${user._id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      onSave(formData);
      onClose(); 
      alert('User updated successfully!');
      
    } catch (error) {
      alert('Error updating user');
    }
  };

  return (
    <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="modal-content bg-white p-8 rounded shadow-lg">
        <button className="absolute top-0 right-0 p-2" onClick={onClose}>X</button>
        <form onSubmit={handleSubmit}>
          <div>
            <label className="block">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded mt-2"
            />
          </div>
          <div className="mt-4">
            <label className="block">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded mt-2"
            />
          </div>
          <div className="mt-4">
            <label className="block">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded mt-2"
            />
          </div>
          <div className="mt-4">
            <label className="block">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded mt-2"
            />
          </div>
          <div className="mt-4">
            <label className="block">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded mt-2"
            />
          </div>
          <div className="mt-4 flex justify-between">
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">Save</button>
            <button type="button" className="bg-gray-500 text-white py-2 px-4 rounded" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Home = () => {
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/v1/getallusers', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        setUsers(response.data.result);
      } catch (error) {
        alert('Error fetching users');
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await axios.delete(`http://localhost:5000/api/v1/deleteuser/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (response.status === 200) {
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
        alert('User deleted successfully');
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      alert('Error deleting user');
    }
    setLoading(false);
  };

  const handleImportSuccess = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/v1/getallusers', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      const newUsers = response.data.result.filter((newUser) => 
        !users.some((existingUser) => existingUser.email === newUser.email)
      );
      setUsers((prevUsers) => [...prevUsers, ...newUsers]);
    } catch (error) {
      alert('Error fetching users');
    }
    setLoading(false);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true); 
  };
  const handleModalClose = () => {
    setIsModalOpen(false); 
  };
const handleSave = (updatedUserData) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === updatedUserData._id ? { ...user, ...updatedUserData } : user
      )
    );
    setIsModalOpen(false);
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/v1/getallusers', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        setUsers(response.data.result);
      } catch (error) {
        alert('Error fetching users');
      }
      setLoading(false);
    };

    fetchUsers();
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Users</h2>
        <button className="bg-red-500 text-white py-2 px-4 rounded" onClick={logout}>
          Logout
        </button>
      </div>

      <ImportUsers onImportSuccess={handleImportSuccess} />

      <ExportUsersButton />

      {loading ? (
        <div>Loading...</div>
      ) : (
        <UserTable users={users} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {isModalOpen && selectedUser && (
        <EditModal user={selectedUser} onClose={handleModalClose} onSave={handleSave} />
      )}
    </div>
  );
};

export default Home;
