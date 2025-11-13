// import axios from "axios";

// const API_BASE = "http://localhost:8000"; // Replace with your backend URL

// export const fetchQuestion = async (domain) => {
//     const res = await axios.get(`${API_BASE}/question/${domain}`);
//     return res.data;
// };

// export const submitInterview = async (domain, audioBlob) => {
//     const formData = new FormData();
//     formData.append("file", audioBlob, "recording.wav");

//     const res = await axios.post(`${API_BASE}/interview/${domain}`, formData, {
//         headers: {
//             "Content-Type": "multipart/form-data",
//         },
//     });
//     return res.data;
// };

// export const downloadReport = (interview_id) => {
//     window.open(`${API_BASE}/download_report/${interview_id}`, "_blank");
// };
