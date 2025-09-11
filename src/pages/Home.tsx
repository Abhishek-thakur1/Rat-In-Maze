import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Home</h1>
            <button
                onClick={() => navigate("/dfs")}
                style={{
                    padding: "8px 16px",
                    marginTop: "12px",
                    cursor: "pointer",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    backgroundColor: "#f5f5f5",
                }}
            >
                Go to DFS
            </button>
        </div>
    );
}
