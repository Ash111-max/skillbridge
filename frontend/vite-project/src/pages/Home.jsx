import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [domain, setDomain] = useState("");
    const navigate = useNavigate();

    const startInterview = () => {
        if (domain) navigate(`/interview/${domain}`);
    };

    return (
        <div>
            <h1>Welcome to SkillBridge</h1>
            <input 
                type="text" 
                placeholder="Enter domain (e.g., javascript)" 
                value={domain} 
                onChange={(e) => setDomain(e.target.value)}
            />
            <button onClick={startInterview}>Start Interview</button>
        </div>
    );
};

export default Home;
