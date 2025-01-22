import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AdminMenu from "../../components/Layout/AdminMenu";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/auth";
import moment from "moment";
import { Select } from "antd";
const { Option } = Select;

const AdminOrders = () => {
  const [status] = useState([
    "Not Processed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled"
  ]);
  const [orders, setOrders] = useState([]);
  const [auth] = useAuth();
  const [loading, setLoading] = useState(false);

  // Get all orders
  const getOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:8081/api/v1/auth/all-orders", {
        headers: {
          Authorization: auth?.token,
        },
      });
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Error fetching orders");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  // Handle status change
  const handleChange = async (orderId, value) => {
    try {
      const { data } = await axios.put(
        `http://localhost:8081/api/v1/auth/order-status/${orderId}`,
        { status: value },
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );
      if (data.success) {
        toast.success("Order status updated");
        getOrders();
      }
    } catch (error) {
      console.log(error);
      toast.error("Error updating order status");
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount?.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    }) || '';
  };

  return (
    <Layout title={"All Orders Data"}>
      <div className="row dashboard">
        <div className="col-md-3">
          <AdminMenu />
        </div>
        <div className="col-md-9">
          <h1 className="text-center mb-4">All Orders</h1>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : orders?.length === 0 ? (
            <div className="text-center">No orders found</div>
          ) : (
            orders?.map((order, index) => (
              <div className="border shadow mb-4 rounded" key={order._id}>
                <div className="card-header bg-primary text-white p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Order #{index + 1}</h5>
                    <span>Order Date: {moment(order?.createdAt).format("DD-MM-YYYY HH:mm")}</span>
                  </div>
                </div>
                <div className="p-3">
                  <table className="table table-bordered">
                    <thead className="bg-light">
                      <tr>
                        <th>Status</th>
                        <th>Buyer</th>
                        <th>Order Date</th>
                        <th>Payment</th>
                        <th>Items</th>
                        <th>Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <Select
                            className="w-100"
                            bordered={true}
                            onChange={(value) => handleChange(order._id, value)}
                            defaultValue={order?.status}
                            status={
                              order?.status === "Delivered" 
                                ? "success" 
                                : order?.status === "Cancelled" 
                                  ? "error" 
                                  : "processing"
                            }
                          >
                            {status.map((s, i) => (
                              <Option key={i} value={s}>
                                {s}
                              </Option>
                            ))}
                          </Select>
                        </td>
                        <td>
                          <strong>{order?.buyer?.name}</strong>
                          <br />
                          <small>{order?.buyer?.email}</small>
                        </td>
                        <td>{moment(order?.createdAt).format("DD-MM-YYYY")}</td>
                        <td>
                          <span className={`badge ${order?.payment?.success ? 'bg-success' : 'bg-danger'}`}>
                            {order?.payment?.success ? "Success" : "Failed"}
                          </span>
                        </td>
                        <td>{order?.products?.length}</td>
                        <td>{formatCurrency(order?.payment?.transaction?.amount)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="products-container mt-4">
                    <h6 className="mb-3">Order Items</h6>
                    <div className="row">
                      {order?.products?.map((p) => (
                        <div className="col-md-6 mb-3" key={p._id}>
                          <div className="card h-100">
                            <div className="row g-0">
                              <div className="col-md-4">
                                <img
                                  src={`http://localhost:8081/api/v1/product/product-photo/${p._id}`}
                                  className="img-fluid rounded-start"
                                  alt={p.name}
                                  style={{ height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                              <div className="col-md-8">
                                <div className="card-body">
                                  <h6 className="card-title">{p.name}</h6>
                                  <p className="card-text small">
                                    {p.description.substring(0, 60)}...
                                  </p>
                                  <p className="card-text">
                                    <strong>Price: </strong>
                                    {formatCurrency(p.price)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order?.buyer?.address && (
                    <div className="mt-4">
                      <h6>Shipping Address</h6>
                      <p className="mb-0">{order.buyer.address}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminOrders;