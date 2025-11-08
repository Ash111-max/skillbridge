export async function fetchDomains() {
  const res = await fetch("http://127.0.0.1:8000/domains");
  if (!res.ok) throw new Error("Failed to fetch domains");
  return res.json();
}

export async function fetchQuestion(domain) {
  const res = await fetch(`http://127.0.0.1:8000/question/${domain}`);
  if (!res.ok) throw new Error("Failed to fetch question");
  return res.json();
}

export async function submitInterview(domain, audioBlob) {
  console.log("📤 Submitting interview:", { domain, audioBlob });
  
  const formData = new FormData();
  formData.append("audio_file", audioBlob, "response.wav");

  const res = await fetch(`http://127.0.0.1:8000/interview/${domain}`, {
    method: "POST",
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
  const res = await fetch(`http://127.0.0.1:8000/download_report/${interviewId}`);
  if (!res.ok) throw new Error("Failed to download report");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `MockInterview_${interviewId}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
}