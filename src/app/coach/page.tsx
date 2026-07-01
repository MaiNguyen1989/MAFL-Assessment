"use client";

import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface CoacheeSubmission {
  id: string;
  name: string;
  email: string;
  stage: string;
  submittedAt: string;
  status: string;
  scores: { L: number; P: number; I: number; S: number };
  answers: {
    q1_q12: Record<number, number>;
    q13_opts: string[];
    q13_reason: string;
    q14_opts: string[];
    q14_reason: string;
    q15_commitment: string;
    q15_reason: string;
  };
  review: {
    q13: number;
    q14: number;
    q15: number;
    feedback: string;
  } | null;
}

const initialMockData: CoacheeSubmission[] = [
  {
    id: "sub_mock1",
    name: "Nguyễn Văn Hùng",
    email: "hung.nguyen@insurance.com",
    stage: "Giai đoạn 1",
    submittedAt: "01/07/2026, 10:15:20",
    status: "Chờ nhận xét",
    scores: { L: 7.3, P: 6.0, I: 4.7, S: 5.3 },
    answers: {
      q1_q12: { 1: 8, 2: 8, 3: 6, 4: 6, 5: 6, 6: 6, 7: 4, 8: 4, 9: 6, 10: 6, 11: 4, 12: 6 },
      q13_opts: ["Thay đổi tư duy vai trò người lãnh đạo", "Biết lập Roadmap & mục tiêu dài hạn", "Quản trị bằng KPI, Dashboard, PDCA"],
      q13_reason: "Tôi nhận ra trước đây mình làm hộ nhân viên quá nhiều dẫn đến bản thân luôn bận rộn còn đội ngũ thì thụ động. Sau khi học coaching, tôi chuyển sang giao việc rõ ràng kèm KPI và quan sát định kỳ.",
      q14_opts: ["Nâng cao năng lực Coaching", "Xây dựng đội ngũ tự vận hành", "Phát triển đội ngũ kế thừa"],
      q14_reason: "Mong muốn Coach giúp tôi cải thiện kỹ năng đặt câu hỏi gợi mở để hỗ trợ trưởng nhóm cấp dưới tự lập kế hoạch thay vì hỏi tôi liên tục.",
      q15_commitment: "Tôi cam kết thiết lập buổi họp coaching 1-1 hàng tuần với 3 trưởng nhóm kế cận và duy trì liên tục trong 3 tháng tới.",
      q15_reason: "Vì đây là cách duy nhất giúp họ tự chủ và giải phóng thời gian quản lý sự vụ của tôi."
    },
    review: null
  },
  {
    id: "sub_mock2",
    name: "Trần Thị Lan",
    email: "lan.tran@insurance.com",
    stage: "Giai đoạn 1",
    submittedAt: "30/06/2026, 16:30:10",
    status: "Đã hoàn thành",
    scores: { L: 8.5, P: 7.8, I: 8.0, S: 9.0 },
    answers: {
      q1_q12: { 1: 8, 2: 10, 3: 8, 4: 8, 5: 8, 6: 8, 7: 8, 8: 8, 9: 8, 10: 10, 11: 8, 12: 10 },
      q13_opts: ["Chuẩn hóa quy trình & kỷ luật hoạt động", "Quản trị bằng KPI, Dashboard, PDCA"],
      q13_reason: "Trước đây cuộc họp của văn phòng thường kéo dài lê thê và lan man. Hiện tại cuộc họp đã có agenda rõ ràng, tập trung giải quyết vấn đề bằng PDCA.",
      q14_opts: ["Xây dựng đội ngũ tự vận hành", "Ứng dụng công nghệ"],
      q14_reason: "Mong muốn ứng dụng công nghệ để tự động hóa việc đẩy báo cáo năng suất hàng ngày giúp tiết kiệm thời gian chuẩn bị số liệu.",
      q15_commitment: "Cam kết chuẩn hóa lại 100% tài liệu hướng dẫn công việc (SOP) cho các vị trí quản lý kinh doanh trong 30 ngày tới.",
      q15_reason: "Để mọi người chủ động đối chiếu công việc và làm chuẩn theo tài liệu ngay cả khi tôi đi thị trường."
    },
    review: {
      q13: 3,
      q14: 2,
      q15: 3,
      feedback: "Coachee Lan đã có những chuyển biến rõ nét và ứng dụng hiệu quả công cụ quản trị hệ thống vào văn phòng. SOP sắp tới cần được viết tối giản để tránh gây ngột ngạt."
    }
  }
];

const getMaturityLevel = (score: number) => {
  if (score >= 9.0) return { title: "Giải phóng", range: "9.0 - 10.0", index: 4, color: "bg-success", text: "text-success", desc: "Hệ thống tự vận hành ổn định, đội ngũ chủ động điều chỉnh và cải tiến liên tục." };
  if (score >= 7.0) return { title: "Chuẩn hóa", range: "7.0 - 8.9", index: 3, color: "bg-primary", text: "text-primary", desc: "Phát triển đội ngũ chủ động, áp dụng quy trình coaching và quản trị dựa trên số liệu." };
  if (score >= 5.0) return { title: "Thực thi", range: "5.0 - 6.9", index: 2, color: "bg-[#0284c7]", text: "text-[#0284c7]", desc: "Quy trình rõ ràng, giao việc bằng mục tiêu đầu ra và kiểm soát tiến độ định kỳ." };
  if (score >= 3.0) return { title: "Nhận thức", range: "3.0 - 4.9", index: 1, color: "bg-warning", text: "text-warning", desc: "Đã ý thức được các vấn đề cốt lõi nhưng quản trị hành vi vẫn cần giám sát trực tiếp." };
  return { title: "Bản năng", range: "1.0 - 2.9", index: 0, color: "bg-error", text: "text-error", desc: "Quản lý công việc theo thói quen tự thân, xử lý sự vụ phát sinh ngắn hạn." };
};

const renderMaturityLadder = (avgScore: number) => {
  const level = getMaturityLevel(avgScore);
  const steps = [
    { title: "Bản năng", range: "1.0 - 2.9", color: "bg-error", text: "text-error" },
    { title: "Nhận thức", range: "3.0 - 4.9", color: "bg-warning", text: "text-warning" },
    { title: "Thực thi", range: "5.0 - 6.9", color: "bg-[#0284c7]", text: "text-[#0284c7]" },
    { title: "Chuẩn hóa", range: "7.0 - 8.9", color: "bg-primary", text: "text-primary" },
    { title: "Giải phóng", range: "9.0 - 10.0", color: "bg-success", text: "text-success" }
  ];

  return (
    <div className="w-full p-6 border border-outline-variant bg-surface rounded-2xl shadow-sm text-left flex flex-col gap-4">
      <div className="flex justify-between items-center pb-2 border-b border-outline-variant">
        <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">
          Mức độ Trưởng thành Lãnh đạo
        </h3>
        <span className="text-xs font-bold px-2.5 py-1 bg-surface-container-high border border-outline-variant rounded-lg text-on-surface">
          Điểm TB: <strong className="text-primary">{avgScore.toFixed(1)}/10</strong>
        </span>
      </div>

      <div className="flex flex-col-reverse gap-2 mt-2">
        {steps.map((step, idx) => {
          const isActive = level.index === idx;
          return (
            <div
              key={step.title}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                isActive
                  ? `border-outline bg-surface-container-low shadow-sm scale-[1.01]`
                  : "border-transparent opacity-40 hover:opacity-60"
              }`}
              style={{
                marginLeft: `${idx * 12}px`,
              }}
            >
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${step.color}`} />
                <span className={`text-sm font-bold ${isActive ? step.text : "text-on-surface"}`}>
                  Bậc {idx + 1}: {step.title}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">({step.range})</span>
              </div>
              {isActive && (
                <span className={`text-xs px-2 py-0.5 rounded font-bold text-on-primary ${step.color}`}>
                  Hiện tại
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-surface-container-low border-l-4 border-primary rounded-r-lg mt-1">
        <p className="text-xs text-on-surface-variant leading-relaxed">
          <strong className="text-on-surface font-semibold">Mô tả hành vi:</strong> {level.desc}
        </p>
      </div>
    </div>
  );
};

const renderQualitativeInsights = (q13: number, q14: number, q15: number) => {
  const getRatingInfo = (type: "q13" | "q14" | "q15", stars: number) => {
    if (stars === 0) {
      return { label: "Chờ đánh giá...", desc: "Coach vui lòng chấm sao để xem phân tích hành vi.", pct: 0, color: "bg-surface-dim" };
    }
    if (type === "q13") {
      if (stars === 3) return { label: "Tác động rõ rệt (3★)", desc: "Đã tạo ra kết quả hoặc thay đổi rõ rệt trong đội ngũ.", pct: 100, color: "bg-success" };
      if (stars === 2) return { label: "Bước đầu áp dụng (2★)", desc: "Đã áp dụng vào thực tế và có thay đổi bước đầu.", pct: 66, color: "bg-[#0284c7]" };
      return { label: "Nhận biết kiến thức (1★)", desc: "Nhận biết được kiến thức đã học nhưng chưa áp dụng rõ rệt.", pct: 33, color: "bg-warning" };
    }
    if (type === "q14") {
      if (stars === 3) return { label: "Sẵn sàng cao (3★)", desc: "Xác định rõ mục tiêu, nhu cầu hỗ trợ và định hướng phát triển.", pct: 100, color: "bg-success" };
      if (stars === 2) return { label: "Có ưu tiên rõ (2★)", desc: "Xác định được lĩnh vực cần phát triển.", pct: 66, color: "bg-[#0284c7]" };
      return { label: "Chưa định hình (1★)", desc: "Chưa xác định rõ ưu tiên phát triển hoặc định hướng Giai đoạn 2.", pct: 33, color: "bg-warning" };
    }
    // q15
    if (stars === 3) return { label: "Cam kết mạnh mẽ (3★)", desc: "Có mục tiêu rõ ràng, hành động cụ thể và tiêu chí đo lường.", pct: 100, color: "bg-success" };
    if (stars === 2) return { label: "Có hành động rõ (2★)", desc: "Có mục tiêu và hành động cụ thể.", pct: 66, color: "bg-[#0284c7]" };
    return { label: "Cam kết chung chung (1★)", desc: "Cam kết còn chung chung, thiếu kế hoạch hành động cụ thể.", pct: 33, color: "bg-warning" };
  };

  const q13Info = getRatingInfo("q13", q13);
  const q14Info = getRatingInfo("q14", q14);
  const q15Info = getRatingInfo("q15", q15);

  return (
    <div className="w-full p-5 border border-outline-variant bg-surface-container-low rounded-2xl flex flex-col gap-4 text-left mb-6">
      <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant pb-2">
        Trực quan hóa Đánh giá chuyên sâu (Insights)
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Q13 */}
        <div className="p-3 border border-outline-variant bg-surface rounded-xl flex flex-col justify-between min-h-[125px]">
          <div>
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Learning Reflection
            </div>
            <div className="text-xs font-bold text-on-surface mb-1">{q13Info.label}</div>
            <p className="text-[10px] text-on-surface-variant leading-relaxed mb-2">{q13Info.desc}</p>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${q13Info.color}`} style={{ width: `${q13Info.pct}%` }} />
          </div>
        </div>

        {/* Q14 */}
        <div className="p-3 border border-outline-variant bg-surface rounded-xl flex flex-col justify-between min-h-[125px]">
          <div>
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Development Readiness
            </div>
            <div className="text-xs font-bold text-on-surface mb-1">{q14Info.label}</div>
            <p className="text-[10px] text-on-surface-variant leading-relaxed mb-2">{q14Info.desc}</p>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${q14Info.color}`} style={{ width: `${q14Info.pct}%` }} />
          </div>
        </div>

        {/* Q15 */}
        <div className="p-3 border border-outline-variant bg-surface rounded-xl flex flex-col justify-between min-h-[125px]">
          <div>
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Leadership Commitment
            </div>
            <div className="text-xs font-bold text-on-surface mb-1">{q15Info.label}</div>
            <p className="text-[10px] text-on-surface-variant leading-relaxed mb-2">{q15Info.desc}</p>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${q15Info.color}`} style={{ width: `${q15Info.pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CoachPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);

  const [submissions, setSubmissions] = useState<CoacheeSubmission[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Ratings for Q13, Q14, Q15
  const [ratings, setRatings] = useState({ q13: 0, q14: 0, q15: 0 });
  const [feedback, setFeedback] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async (id: string, name: string) => {
    setIsDownloading(true);
    try {
      const targetCoachee = submissions.find((c) => c.id === id);
      const payload: any = { assessmentId: id, download: true };

      if (targetCoachee) {
        payload.assessmentData = {
          name: targetCoachee.name,
          email: targetCoachee.email,
          stage: targetCoachee.stage,
          scores: targetCoachee.scores,
          review: targetCoachee.review || {
            q13: ratings.q13,
            q14: ratings.q14,
            q15: ratings.q15,
            feedback: feedback.trim()
          }
        };
      }

      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.pdf) {
        const link = document.createElement("a");
        link.href = data.pdf;
        link.download = `Bao_cao_MAFL_${name.replace(/\s+/g, "_")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("Không thể tạo file PDF báo cáo.");
      }
    } catch (e) {
      console.error("Download failed:", e);
      alert("Lỗi khi tải file PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const fetchSubmissions = async () => {
    if (isSupabaseConfigured) {
      try {
        const { data: assessmentsData, error: assessmentsError } = await supabase
          .from("assessments")
          .select("*, coach_reviews(*)")
          .order("submitted_at", { ascending: false });

        if (assessmentsError) throw assessmentsError;

        if (assessmentsData && assessmentsData.length > 0) {
          const formatted: CoacheeSubmission[] = assessmentsData.map((item: any) => ({
            id: item.id,
            name: item.coachee_name,
            email: item.coachee_email,
            stage: item.stage,
            submittedAt: new Date(item.submitted_at).toLocaleString("vi-VN"),
            status: item.status,
            scores: item.scores,
            answers: item.answers,
            review: item.coach_reviews && item.coach_reviews.length > 0 
              ? {
                  q13: item.coach_reviews[0].q13_stars,
                  q14: item.coach_reviews[0].q14_stars,
                  q15: item.coach_reviews[0].q15_stars,
                  feedback: item.coach_reviews[0].feedback,
                }
              : null
          }));
          setSubmissions(formatted);
          return;
        }
      } catch (err) {
        console.error("Supabase fetch failed, loading from localStorage:", err);
      }
    } else {
      console.log("Supabase is not configured, loading from localStorage.");
    }
    
    // Fallback to localStorage
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("lda_assessments");
      if (!existing) {
        localStorage.setItem("lda_assessments", JSON.stringify(initialMockData));
        setSubmissions(initialMockData);
      } else {
        setSubmissions(JSON.parse(existing));
      }
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "coach123") {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 3000);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
    setActiveId(null);
  };

  const handleSelectCoachee = (id: string) => {
    setActiveId(id);
    const coachee = submissions.find((c) => c.id === id);
    if (coachee) {
      if (coachee.review) {
        setRatings({
          q13: coachee.review.q13,
          q14: coachee.review.q14,
          q15: coachee.review.q15,
        });
        setFeedback(coachee.review.feedback);
      } else {
        setRatings({ q13: 0, q14: 0, q15: 0 });
        setFeedback("");
      }
    }
  };

  const handleSetStars = (target: "q13" | "q14" | "q15", count: number) => {
    const coachee = submissions.find((c) => c.id === activeId);
    if (coachee?.status === "Đã hoàn thành") return; // Read-only if completed
    setRatings((prev) => ({ ...prev, [target]: count }));
  };

  const getStarHint = (target: "q13" | "q14" | "q15") => {
    const val = ratings[target];
    if (val === 1) return { text: "★ - Cần cải thiện", color: "bg-error/10 text-error" };
    if (val === 2) return { text: "★★ - Đạt yêu cầu", color: "bg-secondary/10 text-secondary" };
    if (val === 3) return { text: "★★★ - Xuất sắc", color: "bg-success/10 text-success" };
    return { text: "Chọn sao...", color: "bg-surface-container-low text-primary" };
  };

  const activeCoachee = submissions.find((c) => c.id === activeId);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ratings.q13 === 0 || ratings.q14 === 0 || ratings.q15 === 0) {
      alert("Vui lòng chấm sao đánh giá đầy đủ cho cả 3 tiêu chí!");
      return;
    }
    if (!feedback.trim()) {
      alert("Vui lòng nhập nhận xét/khuyên nhủ chung!");
      return;
    }

    if (isSupabaseConfigured) {
      try {
        // 1. Insert review into coach_reviews
        const { error: reviewError } = await supabase
          .from("coach_reviews")
          .insert({
            assessment_id: activeId,
            q13_stars: ratings.q13,
            q14_stars: ratings.q14,
            q15_stars: ratings.q15,
            feedback: feedback.trim()
          });

        if (reviewError) throw reviewError;

        // 2. Update status in assessments
        const { error: assessmentError } = await supabase
          .from("assessments")
          .update({ status: "Đã hoàn thành" })
          .eq("id", activeId);

        if (assessmentError) throw assessmentError;

        // Trigger PDF and email send via serverless API
        try {
          await fetch("/api/send-report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ assessmentId: activeId }),
          });
        } catch (e) {
          console.error("Failed to trigger send-report API:", e);
        }

        // Reload
        await fetchSubmissions();
        setShowSuccessModal(true);
        return;
      } catch (err) {
        console.error("Supabase review submission failed, falling back to localStorage:", err);
      }
    } else {
      console.log("Supabase is not configured, falling back to localStorage.");
    }

    const updated = submissions.map((c) => {
      if (c.id === activeId) {
        return {
          ...c,
          status: "Đã hoàn thành",
          review: {
            q13: ratings.q13,
            q14: ratings.q14,
            q15: ratings.q15,
            feedback: feedback.trim(),
          },
        };
      }
      return c;
    });

    setSubmissions(updated);
    localStorage.setItem("lda_assessments", JSON.stringify(updated));

    // Trigger PDF and email send via serverless API (for local mock testing)
    try {
      await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId: activeId }),
      });
    } catch (e) {
      console.error("Failed to trigger send-report API:", e);
    }

    setShowSuccessModal(true);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setActiveId(null);
  };

  // Radar props
  const radarData = activeCoachee
    ? {
        labels: ["L (Lãnh đạo)", "P (Hiệu suất)", "I (Độc lập)", "S (Hệ thống)"],
        datasets: [
          {
            label: "Kết quả của Coachee",
            data: [
              activeCoachee.scores.L,
              activeCoachee.scores.P,
              activeCoachee.scores.I,
              activeCoachee.scores.S,
            ],
            fill: true,
            backgroundColor: "rgba(0, 88, 188, 0.15)",
            borderColor: "#0058bc",
            pointBackgroundColor: "#0058bc",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#0058bc",
          },
        ],
      }
    : null;

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 10,
        ticks: { stepSize: 2 },
      },
    },
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-background">
        <div className="w-full max-w-md text-center flex flex-col gap-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 text-2xl font-bold rounded-lg bg-primary text-on-primary shadow-lg shadow-primary/20">
              L
            </div>
            <span className="text-2xl font-bold text-primary tracking-tight">Leadership development assessment</span>
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-on-surface mb-1">Cổng thông tin Coach</h2>
            <p className="text-sm text-on-surface-variant">
              Đăng nhập bằng mã bảo mật để xem và nhận xét bài đánh giá.
            </p>
          </div>

          <div className="p-8 border bg-surface border-outline-variant rounded-2xl shadow-sm">
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2 text-left">
                <label className="text-sm font-semibold text-on-surface">Mật khẩu bảo mật</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu Coach..."
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface text-on-surface focus:border-primary focus:ring-3 focus:ring-primary/15 transition-all outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary-hover shadow-md shadow-primary/15 transition-all"
              >
                Đăng nhập
              </button>
            </form>
            {loginError && (
              <div className="mt-4 text-sm font-medium text-error text-center animate-pulse">
                Mật khẩu không chính xác. Vui lòng thử lại.
              </div>
            )}
          </div>
          
          <div className="text-xs text-on-surface-variant">
            Mật khẩu mô phỏng: <strong className="text-primary">coach123</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar */}
      <nav className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 px-6 md:px-8 py-4 border-b bg-surface border-outline-variant">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 font-bold rounded bg-primary text-on-primary">
            L
          </div>
          <span className="text-lg font-bold text-primary tracking-tight">
            Leadership development assessment
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-on-surface">Coach: Cô Hạnh</span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-error hover:underline"
          >
            Đăng xuất
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-7xl px-8 py-8 mx-auto">
        
        {/* DASHBOARD VIEW */}
        {!activeId ? (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-on-surface">Danh sách Đánh Giá Coachee</h2>
              <span className="text-sm font-semibold text-on-surface-variant">
                Tổng cộng: <strong className="text-primary">{submissions.length}</strong> coachee
              </span>
            </div>

            <div className="border bg-surface border-outline-variant rounded-xl overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[600px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Họ và tên</th>
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Giai đoạn</th>
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Ngày nộp</th>
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => handleSelectCoachee(c.id)}
                      className="border-b border-surface-container-high last:border-0 hover:bg-surface-container-low cursor-pointer transition-colors duration-150"
                    >
                      <td className="px-6 py-4 font-semibold text-primary">{c.name}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{c.email}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{c.stage}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{c.submittedAt}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full text-center ${
                            c.status === "Chờ nhận xét"
                              ? "bg-[#ffeeba] text-[#856404]"
                              : "bg-[#d4edda] text-[#155724]"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          
          /* DETAILED REVIEW PANEL */
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div>
              <button
                onClick={() => setActiveId(null)}
                className="px-4 py-2 border border-outline bg-surface text-secondary hover:bg-surface-container-low font-semibold rounded-lg text-sm transition-all"
              >
                ← Quay lại Dashboard
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
              
              {/* Left Column: Coachee info summary & radar chart */}
              <div className="flex flex-col gap-6">
                <div className="p-6 border bg-surface border-outline-variant rounded-2xl shadow-sm">
                  <h3 className="text-lg font-bold text-on-surface mb-4">Thông tin Coachee</h3>
                  
                  <div className="flex flex-col gap-3 pb-4 mb-4 border-b border-surface-container-high text-sm">
                    <div>
                      <span className="font-semibold text-on-surface-variant mr-2">Coachee:</span>
                      <span className="text-on-surface">{activeCoachee?.name}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-on-surface-variant mr-2">Email:</span>
                      <span className="text-on-surface">{activeCoachee?.email}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-on-surface-variant mr-2">Giai đoạn:</span>
                      <span className="text-on-surface">{activeCoachee?.stage}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-on-surface-variant mr-2">Ngày nộp:</span>
                      <span className="text-on-surface">{activeCoachee?.submittedAt}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-on-surface-variant mr-2">Trạng thái:</span>
                      <span
                        className={`inline-block px-3 py-0.5 text-xs font-semibold rounded-full ${
                          activeCoachee?.status === "Chờ nhận xét"
                            ? "bg-[#ffeeba] text-[#856404]"
                            : "bg-[#d4edda] text-[#155724]"
                        }`}
                      >
                        {activeCoachee?.status}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-primary mb-3">Biểu Đồ Trắc Nghiệm Tự Đánh Giá</h4>
                  <div className="w-[300px] h-[300px] mx-auto mb-4">
                    {radarData && <Radar data={radarData} options={radarOptions} />}
                  </div>

                  <div className="pt-4 border-t border-surface-container-high text-xs text-on-surface-variant leading-relaxed">
                    <strong>Chi tiết điểm trung bình 4 trục (thang điểm 10):</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Lãnh đạo (L): <span className="font-semibold text-on-surface">{activeCoachee?.scores.L}</span></li>
                      <li>Hiệu suất (P): <span className="font-semibold text-on-surface">{activeCoachee?.scores.P}</span></li>
                      <li>Độc lập (I): <span className="font-semibold text-on-surface">{activeCoachee?.scores.I}</span></li>
                      <li>Hệ thống (S): <span className="font-semibold text-on-surface">{activeCoachee?.scores.S}</span></li>
                    </ul>
                  </div>
                </div>

                {activeCoachee && renderMaturityLadder((activeCoachee.scores.L + activeCoachee.scores.P + activeCoachee.scores.I + activeCoachee.scores.S) / 4)}
              </div>

              {/* Right Column: Q13, Q14, Q15 and Form */}
              <div className="flex flex-col gap-6">
                <div className="p-6 border bg-surface border-outline-variant rounded-2xl shadow-sm">
                  <h3 className="text-lg font-bold text-on-surface mb-6 border-b border-surface-container-high pb-3">
                    Kết quả khảo sát & Đánh giá của Coach
                  </h3>

                  {renderQualitativeInsights(ratings.q13, ratings.q14, ratings.q15)}

                  {/* Essay elements Q13-15 */}
                  <div className="flex flex-col gap-6">
                    {/* Q13 */}
                    <div className="p-5 border border-outline-variant bg-background rounded-xl">
                      <h4 className="text-sm font-bold mb-3 flex items-center">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold mr-2">13</span>
                        Nhìn lại Giai đoạn 1, điều gì bạn học được từ chương trình coaching đã tạo ra thay đổi rõ nhất?
                      </h4>
                      <div className="text-xs font-semibold text-on-surface-variant mb-2">Lựa chọn tích chọn:</div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {activeCoachee?.answers.q13_opts.map((opt) => (
                          <span key={opt} className="px-2.5 py-1 text-xs bg-surface-container border border-outline-variant rounded-lg text-on-surface font-medium">
                            {opt}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs font-semibold text-on-surface-variant mb-1">Mô tả kết quả thực tế tạo ra cho khu vực:</div>
                      <div className="p-3 border-l-4 border-primary bg-surface rounded-r-md text-sm text-on-surface">
                        {activeCoachee?.answers.q13_reason}
                      </div>
                    </div>

                    {/* Q14 */}
                    <div className="p-5 border border-outline-variant bg-background rounded-xl">
                      <h4 className="text-sm font-bold mb-3 flex items-center">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold mr-2">14</span>
                        Bước sang Giai đoạn 2, bạn mong muốn phát triển mạnh nhất ở nội dung nào?
                      </h4>
                      <div className="text-xs font-semibold text-on-surface-variant mb-2">Nội dung ưu tiên cải thiện:</div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {activeCoachee?.answers.q14_opts.map((opt) => (
                          <span key={opt} className="px-2.5 py-1 text-xs bg-surface-container border border-outline-variant rounded-lg text-on-surface font-medium">
                            {opt}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs font-semibold text-on-surface-variant mb-1">Mong muốn Coach hỗ trợ nhất trong Giai đoạn 2:</div>
                      <div className="p-3 border-l-4 border-primary bg-surface rounded-r-md text-sm text-on-surface">
                        {activeCoachee?.answers.q14_reason}
                      </div>
                    </div>

                    {/* Q15 */}
                    <div className="p-5 border border-outline-variant bg-background rounded-xl">
                      <h4 className="text-sm font-bold mb-3 flex items-center">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold mr-2">15</span>
                        Nếu chỉ được chọn MỘT thay đổi tạo ra đột phá trong Giai đoạn 2, bạn sẽ cam kết điều gì?
                      </h4>
                      <div className="text-xs font-semibold text-on-surface-variant mb-1">Cam kết thay đổi:</div>
                      <div className="p-3 border-l-4 border-primary bg-surface rounded-r-md text-sm text-on-surface mb-3">
                        {activeCoachee?.answers.q15_commitment}
                      </div>
                      <div className="text-xs font-semibold text-on-surface-variant mb-1">Lý do chọn điều này:</div>
                      <div className="p-3 border-l-4 border-primary bg-surface rounded-r-md text-sm text-on-surface">
                        {activeCoachee?.answers.q15_reason}
                      </div>
                    </div>
                  </div>

                  {/* Rating & General Feedback Form */}
                  <form onSubmit={handleSubmitReview} className="mt-8 pt-8 border-t-2 border-dashed border-surface-container-highest flex flex-col gap-6">
                    <h4 className="text-base font-bold text-primary">Đánh Giá Sao & Nhận Xét Của Coach</h4>

                    {/* Q13 Rating */}
                    <div className="p-4 border border-outline-variant bg-surface-container-low rounded-xl flex flex-col gap-3">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <span className="text-sm font-bold">1. Tiêu chí: Phản hồi học tập (Dành cho Q13)</span>
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded ${getStarHint("q13").color}`}>
                          {getStarHint("q13").text}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleSetStars("q13", num)}
                            className={`text-3xl transition-transform hover:scale-115 ${
                              ratings.q13 >= num ? "text-warning" : "text-surface-dim"
                            }`}
                            disabled={activeCoachee?.status === "Đã hoàn thành"}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        Hướng dẫn: 1★ (Ít học hỏi/Áp dụng thấp) | 2★ (Đã ứng dụng/Có thay đổi vừa) | 3★ (Chuyển biến tư duy sâu sắc/Tác động lớn)
                      </div>
                    </div>

                    {/* Q14 Rating */}
                    <div className="p-4 border border-outline-variant bg-surface-container-low rounded-xl flex flex-col gap-3">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <span className="text-sm font-bold">2. Tiêu chí: Mức độ sẵn sàng (Dành cho Q14)</span>
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded ${getStarHint("q14").color}`}>
                          {getStarHint("q14").text}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleSetStars("q14", num)}
                            className={`text-3xl transition-transform hover:scale-115 ${
                              ratings.q14 >= num ? "text-warning" : "text-surface-dim"
                            }`}
                            disabled={activeCoachee?.status === "Đã hoàn thành"}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        Hướng dẫn: 1★ (Mơ hồ/Thiếu định hướng) | 2★ (Có ưu tiên rõ/Sẵn sàng vừa) | 3★ (Định hướng cực kỳ rõ ràng/Chủ động cao)
                      </div>
                    </div>

                    {/* Q15 Rating */}
                    <div className="p-4 border border-outline-variant bg-surface-container-low rounded-xl flex flex-col gap-3">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <span className="text-sm font-bold">3. Tiêu chí: Mức độ cam kết (Dành cho Q15)</span>
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded ${getStarHint("q15").color}`}>
                          {getStarHint("q15").text}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleSetStars("q15", num)}
                            className={`text-3xl transition-transform hover:scale-115 ${
                              ratings.q15 >= num ? "text-warning" : "text-surface-dim"
                            }`}
                            disabled={activeCoachee?.status === "Đã hoàn thành"}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        Hướng dẫn: 1★ (Cam kết chung chung/Hành động yếu) | 2★ (Có hành động & hạn mức/Khá cam kết) | 3★ (Cam kết mạnh mẽ/Đo lường rõ)
                      </div>
                    </div>

                    {/* General Feedback Text Area */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-on-surface">
                        Lời khuyên / Nhận xét chung của Coach dành cho Coachee
                      </label>
                      <textarea
                        placeholder="Viết lời khuyên chi tiết giúp coachee cải thiện tư duy & hệ thống quản trị của mình..."
                        className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface text-on-surface focus:border-primary focus:ring-3 focus:ring-primary/15 transition-all outline-none min-h-[120px] disabled:opacity-75 disabled:cursor-not-allowed"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        disabled={activeCoachee?.status === "Đã hoàn thành"}
                        required
                      />
                    </div>

                    <div className="flex gap-4 justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => setActiveId(null)}
                        className="px-5 py-2.5 border border-outline bg-surface text-secondary hover:bg-surface-container-low font-semibold rounded-lg text-sm transition-all"
                      >
                        Hủy bỏ
                      </button>
                      {activeCoachee?.status === "Đã hoàn thành" ? (
                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(activeCoachee.id, activeCoachee.name)}
                          className="px-5 py-2.5 bg-success text-on-primary font-semibold rounded-lg text-sm hover:bg-success/90 shadow-md shadow-success/15 transition-all disabled:opacity-50"
                          disabled={isDownloading}
                        >
                          {isDownloading ? "Đang tải..." : "📥 Tải báo cáo PDF"}
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-primary text-on-primary font-semibold rounded-lg text-sm hover:bg-primary-hover shadow-md shadow-primary/15 transition-all"
                        >
                          Hoàn thành đánh giá
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Success Dialog Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999] px-4 animate-fadeIn">
          <div className="bg-surface p-8 rounded-2xl max-w-md w-full border border-outline-variant shadow-lg text-center flex flex-col items-center">
            <div className="flex items-center justify-center w-14 h-14 bg-success/10 text-success text-2xl rounded-full mb-5">
              ✓
            </div>
            <h3 className="text-lg font-bold mb-3">Hoàn Thành Đánh Giá!</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              Báo cáo đánh giá (file PDF có biểu đồ mạng nhện kèm nhận xét chi tiết của Coach) đã được tạo tự động thành công. Bạn có thể tải file PDF báo cáo trực tiếp dưới đây.
            </p>
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => {
                  if (activeId && activeCoachee) {
                    handleDownloadPDF(activeId, activeCoachee.name);
                  }
                }}
                className="w-full py-2.5 bg-success text-on-primary font-semibold rounded-lg text-sm hover:bg-success/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={isDownloading}
              >
                {isDownloading ? "Đang tải..." : "📥 Tải báo cáo PDF ngay"}
              </button>
              <button
                onClick={closeSuccessModal}
                className="w-full py-2.5 border border-outline bg-surface text-secondary hover:bg-surface-container-low font-semibold rounded-lg text-sm transition-all"
              >
                Quay lại Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
