const API_BASE_URL = "http://127.0.0.1:8000";

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// ============ AUTH APIs ============

export async function signup(name, email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Signup failed");
  }

  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Login failed");
  }

  return res.json();
}

export async function getMe() {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch user info");
  return res.json();
}

// ============ INTERVIEW APIs ============

export async function fetchDomains() {
  const res = await fetch(`${API_BASE_URL}/domains`);
  if (!res.ok) throw new Error("Failed to fetch domains");
  return res.json();
}

export async function fetchQuestion(domain) {
  const res = await fetch(`${API_BASE_URL}/question/${domain}`);
  if (!res.ok) throw new Error("Failed to fetch question");
  return res.json();
}

export async function submitInterview(domain, audioBlob) {
  console.log("📤 Submitting interview:", { domain, audioBlob });
  
  const formData = new FormData();
  formData.append("audio_file", audioBlob, "response.wav");

  const res = await fetch(`${API_BASE_URL}/interview/${domain}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  console.log("📥 Response status:", res.status, res.statusText);

  if (!res.ok) {
    const msg = await res.text();
    console.error("❌ Error response:", msg);
    throw new Error(`Submission failed: ${msg}`);
  }

  const jsonData = await res.json();
  console.log("📥 Response JSON:", jsonData);
  return jsonData;
}

export async function downloadReport(interviewId) {
  const res = await fetch(`${API_BASE_URL}/download_report/${interviewId}`, {
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) throw new Error("Failed to download report");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `MockInterview_${interviewId}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
}

// ============ DASHBOARD APIs ============

export async function getDashboard() {
  const res = await fetch(`${API_BASE_URL}/dashboard`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch dashboard");
  return res.json();
}

export async function getHistory(limit = 10, offset = 0) {
  const res = await fetch(`${API_BASE_URL}/history?limit=${limit}&offset=${offset}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}