import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function VerifyPass() {

    const { id } = useParams();
    const [pass, setPass] = useState(null);

    useEffect(() => {
        console.log("ID:", id);
        fetchPass();
    }, []);

    const fetchPass = async () => {
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/buspass/verify/${id}`
            );

            console.log("Response:", res.data);
            setPass(res.data.data);
            console.log(res.data);

            setPass(res.data.data);

        } catch (error) {
            console.log(error.response);
        }
    };

    if (!pass) {
        return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
    }

    return (
        <div style={{ padding: "30px" }}>

            <h2>🚌 Bus Pass Verification</h2>

            <hr />

            <p><b>Name:</b> {pass.fullName}</p>

            <p><b>Pass Number:</b> {pass.passNumber}</p>

            <p><b>Route:</b> {pass.source} → {pass.destination}</p>

            <p><b>Pass Type:</b> {pass.passType}</p>

            <p><b>Category:</b> {pass.category}</p>

            <p><b>Status:</b> {pass.status}</p>

            <p><b>Issue Date:</b> {new Date(pass.issueDate).toLocaleDateString()}</p>

            <p><b>Expiry Date:</b> {new Date(pass.expiryDate).toLocaleDateString()}</p>

        </div>
    );
}

export default VerifyPass;