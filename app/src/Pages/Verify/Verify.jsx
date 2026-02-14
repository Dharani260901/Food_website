import React, { useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import './Verify.css';

const Verify = () => {
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");
    const { url } = useContext(StoreContext);
    const navigate = useNavigate();

    const verifyPayment = async () => {
        try {
            const response = await axios.post(url + "/api/orders/verify", { success, orderId });
            if (response.data.success) {
                // ✅ If payment is verified, go to tracking
                navigate(`/track-order/${orderId}`);
            } else {
                // ❌ If payment failed, go back to home/cart
                alert("Payment Failed. Please try again.");
                navigate("/");
            }
        } catch (error) {
            console.error("Verification Error:", error);
            navigate("/");
        }
    }

    useEffect(() => {
        verifyPayment();
    }, []);

    return (
        <div className='verify'>
            <div className="spinner"></div>
            <p>Verifying your payment, please do not refresh...</p>
        </div>
    )
}

export default Verify;