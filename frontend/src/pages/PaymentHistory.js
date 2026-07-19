import Sidebar from "../components/Sidebar";
import SOSButton from "../components/SOSButton";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
    FaSearch,
    FaDownload,
    FaEye,
    FaCalendarAlt,
} from "react-icons/fa";

import "./paymentHistory.css";
import { useUser, getPhotoUrl } from "../context/UserContext";

const ROWS_PER_PAGE = 7;

function PaymentHistory() {
    const navigate = useNavigate();

    // ✅ user now comes from shared UserContext — no local fetch needed
    const { user } = useUser();

    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [invoiceQuery, setInvoiceQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewPayment, setViewPayment] = useState(null);

    const notifications =
        JSON.parse(localStorage.getItem("notifications")) || [];

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/buspass/payment-history`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setPayments(res.data.data || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    // ---- filtering (same logic, just applied to table) ----
    const filteredPayments = useMemo(() => {
        return payments.filter((p) => {
            const idText = (p.paymentId || p._id || "").toLowerCase();
            const matchesInvoice =
                !invoiceQuery || idText.includes(invoiceQuery.toLowerCase());

            const paidDate = new Date(p.createdAt);

            const matchesStart =
                !startDate || paidDate >= new Date(startDate);

            const matchesEnd =
                !endDate || paidDate <= new Date(endDate + "T23:59:59");

            return matchesInvoice && matchesStart && matchesEnd;
        });
    }, [payments, invoiceQuery, startDate, endDate]);

    // ---- pagination ----
    const totalPages = Math.max(
        1,
        Math.ceil(filteredPayments.length / ROWS_PER_PAGE)
    );

    const paginatedPayments = filteredPayments.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [invoiceQuery, startDate, endDate]);

    // ---- selection ----
    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedPayments.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedPayments.map((p) => p._id));
        }
    };

    // ---- export ----
    const handleExport = () => {
        const rows = filteredPayments.map((p) => ({
            InvoiceID: p.paymentId || p._id,
            Date: new Date(p.createdAt).toLocaleDateString("en-IN"),
            Passenger: p.fullName || "-",
            Route: p.source && p.destination ? `${p.source} -> ${p.destination}` : "-",
            Amount: p.amount,
            Status: p.paymentStatus || "Success",
        }));

        const header = Object.keys(rows[0] || {}).join(",");
        const csvBody = rows
            .map((r) => Object.values(r).join(","))
            .join("\n");
        const csv = header + "\n" + csvBody;

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "payment-history.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const getStatusClass = (status) => {
        const s = status || "Success";
        if (s === "Failed") return "failed";
        if (s === "Refunded") return "refunded";
        if (s === "Pending") return "pending";
        return "success";
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="main-content">
                {/* ---- Navbar ---- */}
                <div className="topbar">
                    <h2>Payment History</h2>
                    <div className="user-box">
                        <div
                            className="notification-icon"
                            onClick={() => navigate("/notifications")}
                        >
                            🔔
                            <span className="notification-badge">
                                {notifications.length}
                            </span>
                        </div>
                        <div
                            className="profile-box"
                            onClick={() => navigate("/profile")}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="profile-circle nav-avatar">
                                {user?.photo ? (
                                    <img src={getPhotoUrl(user.photo)} alt="" />
                                ) : (
                                    user?.name?.charAt(0) || "U"
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ---- Admin-style panel ---- */}
                <div className="payment-panel">
                    <div className="payment-panel-header">
                        <h3>My Payment List</h3>
                    </div>

                    {/* Filters */}
                    <div className="payment-filter-bar">
                        <div className="filter-field">
                            <label>Invoice ID</label>
                            <input
                                type="text"
                                placeholder="SB-63215615263"
                                value={invoiceQuery}
                                onChange={(e) => setInvoiceQuery(e.target.value)}
                            />
                        </div>

                        <div className="filter-field">
                            <label>Start Date</label>
                            <div className="filter-date-input">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <FaCalendarAlt size={13} />
                            </div>
                        </div>

                        <div className="filter-field">
                            <label>End Date</label>
                            <div className="filter-date-input">
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                                <FaCalendarAlt size={13} />
                            </div>
                        </div>

                        <button className="filter-search-btn">
                            <FaSearch />
                        </button>
                    </div>

                    {/* Table toolbar */}
                    <div className="payment-table-toolbar">
                        <span className="entries-text">
                            Showing {paginatedPayments.length} of{" "}
                            {filteredPayments.length} entries
                        </span>

                        <button
                            className="export-btn"
                            onClick={handleExport}
                            disabled={filteredPayments.length === 0}
                        >
                            <FaDownload size={12} /> Export
                        </button>
                    </div>

                    {/* Table */}
                    <div className="payment-table-wrapper">
                        {loading ? (
                            <div className="payment-loading">
                                <div className="payment-loading-spinner"></div>
                                <p>Loading payment history...</p>
                            </div>
                        ) : filteredPayments.length === 0 ? (
                            <div className="no-payment">
                                <h3>No Payments Found</h3>
                                <p>Try adjusting your filters.</p>
                            </div>
                        ) : (
                            <table className="payment-table">
                                <thead>
                                    <tr>
                                        <th className="checkbox-col">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    selectedIds.length === paginatedPayments.length &&
                                                    paginatedPayments.length > 0
                                                }
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th>Sl</th>
                                        <th>Invoice ID</th>
                                        <th>Date</th>
                                        <th>Route</th>
                                        <th>Pass Type</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedPayments.map((payment, index) => (
                                        <tr key={payment._id}>
                                            <td className="checkbox-col">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(payment._id)}
                                                    onChange={() => toggleSelect(payment._id)}
                                                />
                                            </td>
                                            <td>
                                                {(currentPage - 1) * ROWS_PER_PAGE + index + 1}
                                            </td>
                                            <td className="invoice-cell">
                                                #{payment.paymentId || payment._id.slice(-8)}
                                            </td>
                                            <td>
                                                {new Date(payment.createdAt).toLocaleDateString(
                                                    "en-IN",
                                                    { day: "2-digit", month: "short", year: "numeric" }
                                                )}
                                            </td>
                                            <td>
                                                {payment.source && payment.destination
                                                    ? `${payment.source} → ${payment.destination}`
                                                    : "-"}
                                            </td>
                                            <td>{payment.passType || "-"}</td>
                                            <td className="amount-cell">₹{payment.amount}</td>
                                            <td>
                                                <span
                                                    className={`table-status-badge ${getStatusClass(
                                                        payment.paymentStatus
                                                    )}`}
                                                >
                                                    {payment.paymentStatus || "Success"}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="row-action-btn"
                                                    onClick={() => setViewPayment(payment)}
                                                >
                                                    <FaEye size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {!loading && filteredPayments.length > 0 && (
                        <div className="payment-pagination">
                            <button
                                className="page-nav-btn"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            >
                                ← Previous
                            </button>

                            <div className="page-numbers">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .slice(0, 6)
                                    .map((num) => (
                                        <button
                                            key={num}
                                            className={`page-number ${currentPage === num ? "active" : ""
                                                }`}
                                            onClick={() => setCurrentPage(num)}
                                        >
                                            {num}
                                        </button>
                                    ))}
                            </div>

                            <button
                                className="page-nav-btn"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                                }
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>

                <SOSButton />
            </div>

            {/* ---- View details modal ---- */}
            {viewPayment && (
                <div className="sos-overlay" onClick={() => setViewPayment(null)}>
                    <div
                        className="payment-view-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Payment Details</h3>

                        <div className="view-row">
                            <span>Invoice ID</span>
                            <strong>{viewPayment.paymentId || viewPayment._id}</strong>
                        </div>
                        <div className="view-row">
                            <span>Amount</span>
                            <strong>₹{viewPayment.amount}</strong>
                        </div>
                        <div className="view-row">
                            <span>Route</span>
                            <strong>
                                {viewPayment.source} → {viewPayment.destination}
                            </strong>
                        </div>
                        <div className="view-row">
                            <span>Pass Type</span>
                            <strong>{viewPayment.passType}</strong>
                        </div>
                        <div className="view-row">
                            <span>Date</span>
                            <strong>
                                {new Date(viewPayment.createdAt).toLocaleString("en-IN")}
                            </strong>
                        </div>
                        <div className="view-row">
                            <span>Status</span>
                            <strong
                                className={`table-status-badge ${getStatusClass(
                                    viewPayment.paymentStatus
                                )}`}
                            >
                                {viewPayment.paymentStatus || "Success"}
                            </strong>
                        </div>

                        <button
                            className="view-close-btn"
                            onClick={() => setViewPayment(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaymentHistory;