import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Layout/AdminMenu";
import Layout from "./../../components/Layout/Layout";
import axios from "axios";
import { useAuth } from "../../context/auth";
import moment from "moment";
import { Select } from "antd";
import { toast } from "react-hot-toast";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [auth] = useAuth();

  // Get all users
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get("/api/v1/auth/all-users", {
        headers: {
          Authorization: auth?.token,
        },
      });
      if (data?.success) {
        setUsers(data?.users);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching users");
    }
  };

  // Lifecycle method
  useEffect(() => {
    getAllUsers();
  }, []);

  // Function to handle role updates
  const handleRoleUpdate = async (userId, newRole) => {
    try {
      const { data } = await axios.put(
        `/api/v1/auth/update-user-role/${userId}`,
        { role: newRole },
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );
      if (data?.success) {
        toast.success("User role updated successfully");
        getAllUsers(); // Refresh the users list
      }
    } catch (error) {
      console.log(error);
      toast.error("Error updating user role");
    }
  };

  return (
    <Layout title={"Dashboard - All Users"}>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h1 className="text-center mb-4">All Users</h1>
            <div className="table-responsive">
              <table className="table table-bordered table-striped">
                <thead className="thead-dark">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <Select
                          defaultValue={user.role === 1 ? "Admin" : "User"}
                          style={{ width: 120 }}
                          onChange={(value) => 
                            handleRoleUpdate(user._id, value === "Admin" ? 1 : 0)
                          }
                          options={[
                            { value: "User", label: "User" },
                            { value: "Admin", label: "Admin" },
                          ]}
                        />
                      </td>
                      <td>{moment(user.createdAt).format("YYYY-MM-DD")}</td>
                      <td>
                        <button 
                          className="btn btn-danger"
                          onClick={async () => {
                            try {
                              const { data } = await axios.delete(
                                `/api/v1/auth/delete-user/${user._id}`,
                                {
                                  headers: {
                                    Authorization: auth?.token,
                                  },
                                }
                              );
                              if (data?.success) {
                                toast.success("User deleted successfully");
                                getAllUsers(); // Refresh the users list
                              }
                            } catch (error) {
                              console.log(error);
                              toast.error("Error deleting user");
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Users;