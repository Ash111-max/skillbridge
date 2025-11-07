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
  const formData = new FormData();
  formData.append("audio_file", audioBlob, "response.wav");

  const res = await fetch(`http://127.0.0.1:8000/interview/${domain}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Submission failed: ${msg}`);
  }

  return res.json();
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
