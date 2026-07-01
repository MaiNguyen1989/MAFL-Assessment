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

// Register Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// 12 LEADERSHIP QUESTIONS DATA
const questions = [
  {
    id: 1,
    text: "Khi đội ngũ gặp vấn đề, cách bạn thường xử lý nhất là:",
    axis: "L" as const,
    options: [
      { key: "A", val: 2, text: "Tôi thường trực tiếp giải quyết hoặc làm thay để công việc hoàn thành nhanh." },
      { key: "B", val: 4, text: "Tôi giải thích cho họ biết vấn đề nhưng vẫn phải theo sát từng việc." },
      { key: "C", val: 6, text: "Tôi giao việc rõ ràng, quy định kết quả mong đợi rồi theo dõi định kỳ." },
      { key: "D", val: 8, text: "Tôi chủ yếu đặt câu hỏi để họ tự tìm giải pháp và chịu trách nhiệm." },
      { key: "E", val: 10, text: "Đội ngũ chủ động xử lý theo nguyên tắc chung mà không cần tôi can thiệp." }
    ]
  },
  {
    id: 2,
    text: "Phần lớn thời gian làm việc của bạn đang dành cho:",
    axis: "L" as const,
    options: [
      { key: "A", val: 2, text: "Làm việc chuyên môn và xử lý công việc cá nhân." },
      { key: "B", val: 4, text: "Giải quyết các sự vụ phát sinh trong ngày." },
      { key: "C", val: 6, text: "Theo dõi hoạt động và kiểm tra tiến độ đội ngũ." },
      { key: "D", val: 8, text: "Coaching và phát triển năng lực quản lý cấp dưới." },
      { key: "E", val: 10, text: "Xây dựng văn hóa và phát triển đội ngũ kế thừa." }
    ]
  },
  {
    id: 3,
    text: "Khi một quản lý cấp dưới chưa đạt kết quả, bạn thường:",
    axis: "L" as const,
    options: [
      { key: "A", val: 2, text: "Chỉ rõ họ cần làm gì." },
      { key: "B", val: 4, text: "Phân tích nguyên nhân rồi hướng dẫn." },
      { key: "C", val: 6, text: "Yêu cầu lập kế hoạch cải thiện và đánh giá định kỳ." },
      { key: "D", val: 8, text: "Coaching để họ tự xây giải pháp." },
      { key: "E", val: 10, text: "Để người cố vấn (mentor) hoặc quản lý trực tiếp coaching mà không cần tôi." }
    ]
  },
  {
    id: 4,
    text: "Khi doanh số không đạt kế hoạch, việc đầu tiên bạn làm là:",
    axis: "P" as const,
    options: [
      { key: "A", val: 2, text: "Thúc đội ngũ làm nhiều hơn." },
      { key: "B", val: 4, text: "Tìm nguyên nhân sau khi kết quả đã xảy ra." },
      { key: "C", val: 6, text: "Họp đánh giá và lập kế hoạch hành động." },
      { key: "D", val: 8, text: "Theo dõi biểu đồ cập nhật (dashboard) hằng tuần để điều chỉnh sớm." },
      { key: "E", val: 10, text: "Hệ thống tự cảnh báo và đội ngũ tự điều chỉnh." }
    ]
  },
  {
    id: 5,
    text: "Việc theo dõi KPI hiện nay của bạn là:",
    axis: "P" as const,
    options: [
      { key: "A", val: 2, text: "Chủ yếu nhìn kết quả cuối tháng." },
      { key: "B", val: 4, text: "Có xem giữa tháng nhưng chưa đều." },
      { key: "C", val: 6, text: "Đánh giá hằng tuần." },
      { key: "D", val: 8, text: "Theo dõi bằng biểu đồ cập nhật theo thời gian thực." },
      { key: "E", val: 10, text: "Biểu đồ cập nhật tự dự báo và hỗ trợ ra quyết định." }
    ]
  },
  {
    id: 6,
    text: "Sau mỗi cuộc họp đánh giá:",
    axis: "P" as const,
    options: [
      { key: "A", val: 2, text: "Ít có thay đổi cụ thể." },
      { key: "B", val: 4, text: "Có nhiều ý tưởng nhưng ít theo đến cùng." },
      { key: "C", val: 6, text: "Có kế hoạch hành động và người phụ trách." },
      { key: "D", val: 8, text: "Theo dõi tỷ lệ hoàn thành kế hoạch hành động định kỳ." },
      { key: "E", val: 10, text: "Đội ngũ tự tổ chức lập kế hoạch – thực hiện – kiểm tra – điều chỉnh (PDCA) mà không cần tôi." }
    ]
  },
  {
    id: 7,
    text: "Nếu bạn phải vắng mặt một tuần:",
    axis: "I" as const,
    options: [
      { key: "A", val: 2, text: "Công việc gần như dừng lại." },
      { key: "B", val: 4, text: "Chỉ xử lý được việc thường ngày." },
      { key: "C", val: 6, text: "Hoạt động vẫn diễn ra nhưng hiệu quả giảm." },
      { key: "D", val: 8, text: "Hầu hết công việc vẫn vận hành ổn định." },
      { key: "E", val: 10, text: "Hệ thống vẫn tăng trưởng gần như bình thường." }
    ]
  },
  {
    id: 8,
    text: "Khi cần ra quyết định:",
    axis: "I" as const,
    options: [
      { key: "A", val: 2, text: "Hầu hết đều phải hỏi tôi." },
      { key: "B", val: 4, text: "Một số việc họ tự làm, việc quan trọng vẫn chờ tôi." },
      { key: "C", val: 6, text: "Quản lý cấp dưới xử lý phần lớn công việc." },
      { key: "D", val: 8, text: "Họ chủ động xử lý và chỉ báo cáo những việc đặc biệt." },
      { key: "E", val: 10, text: "Các Quản lý kế cận hoàn toàn có thể thay tôi điều hành." }
    ]
  },
  {
    id: 9,
    text: "Điều gì khiến bạn bận nhất hiện nay?",
    axis: "I" as const,
    options: [
      { key: "A", val: 2, text: "Phải tự giải quyết mọi việc." },
      { key: "B", val: 4, text: "Phải nhắc việc liên tục." },
      { key: "C", val: 6, text: "Phải kiểm tra vì chưa yên tâm." },
      { key: "D", val: 8, text: "Chủ yếu coaching và phát triển lãnh đạo kế cận." },
      { key: "E", val: 10, text: "Chủ yếu suy nghĩ chiến lược vì đội ngũ đã tự vận hành." }
    ]
  },
  {
    id: 10,
    text: "Công việc hiện nay được quản lý bằng:",
    axis: "S" as const,
    options: [
      { key: "A", val: 2, text: "Chủ yếu trao đổi miệng." },
      { key: "B", val: 4, text: "Có biểu mẫu nhưng chưa thống nhất." },
      { key: "C", val: 6, text: "Có quy trình và biểu mẫu chung." },
      { key: "D", val: 8, text: "Có biểu đồ cập nhật và công cụ theo dõi." },
      { key: "E", val: 10, text: "Quy trình được số hóa và tự động hóa phần lớn." }
    ]
  },
  {
    id: 11,
    text: "Khi có người mới tiếp quản công việc:",
    axis: "S" as const,
    options: [
      { key: "A", val: 2, text: "Phải học trực tiếp từ tôi." },
      { key: "B", val: 4, text: "Chủ yếu hỏi người cũ." },
      { key: "C", val: 6, text: "Có tài liệu hướng dẫn." },
      { key: "D", val: 8, text: "Có quy trình chuẩn và danh mục đầu việc." },
      { key: "E", val: 10, text: "Chỉ cần học trên hệ thống là có thể làm việc." }
    ]
  },
  {
    id: 12,
    text: "Theo bạn, giá trị lớn nhất bạn tạo cho đội ngũ hiện nay là:",
    axis: "S" as const,
    options: [
      { key: "A", val: 2, text: "Tôi trực tiếp tạo doanh số." },
      { key: "B", val: 4, text: "Tôi giúp giải quyết vấn đề." },
      { key: "C", val: 6, text: "Tôi giúp mọi người hoàn thành công việc." },
      { key: "D", val: 8, text: "Tôi giúp đội ngũ phát triển năng lực." },
      { key: "E", val: 10, text: "Tôi xây dựng được hệ thống giúp mọi người thành công ngay cả khi tôi không có mặt." }
    ]
  }
];

const q13OptionsList = [
  "Thay đổi tư duy vai trò người lãnh đạo",
  "Biết lập Roadmap & mục tiêu dài hạn",
  "Quản trị bằng KPI, Dashboard, PDCA",
  "Coaching phát triển cấp dưới thay vì làm thay",
  "Chuẩn hóa quy trình & kỷ luật hoạt động",
  "Biết phân tích nguyên nhân gốc",
  "Xây dựng văn hóa chủ động"
];

const q14OptionsList = [
  "Nâng cao năng lực Coaching",
  "Xây dựng đội ngũ tự vận hành",
  "Nâng cao chất lượng tuyển dụng",
  "Chuẩn hóa hệ thống quản trị",
  "Phát triển đội ngũ kế thừa",
  "Nâng cao hiệu quả kinh doanh",
  "Xây dựng văn hóa tích cực",
  "Ứng dụng công nghệ"
];

export default function CoacheePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState("");

  // Quiz selections (Q1 - Q12)
  const [qAnswers, setQAnswers] = useState<Record<number, number>>({});

  // Q13 choices & text
  const [q13Opts, setQ13Opts] = useState<string[]>([]);
  const [q13Reason, setQ13Reason] = useState("");

  // Q14 choices & text
  const [q14Opts, setQ14Opts] = useState<string[]>([]);
  const [q14Reason, setQ14Reason] = useState("");

  // Q15 texts
  const [q15Commitment, setQ15Commitment] = useState("");
  const [q15Reason, setQ15Reason] = useState("");

  // Radar scores
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0]);
  const [showChart, setShowChart] = useState(false);

  const totalSteps = 5;

  const handleQAnswerChange = (qId: number, val: number) => {
    setQAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleQ13OptToggle = (opt: string) => {
    setQ13Opts((prev) =>
      prev.includes(opt) ? prev.filter((item) => item !== opt) : [...prev, opt]
    );
  };

  const handleQ14OptToggle = (opt: string) => {
    setQ14Opts((prev) => {
      if (prev.includes(opt)) {
        return prev.filter((item) => item !== opt);
      } else {
        if (prev.length >= 3) {
          alert("Bạn chỉ được chọn tối đa 3 nội dung ưu tiên.");
          return prev;
        }
        return [...prev, opt];
      }
    });
  };

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      return fullName.trim() !== "" && email.trim() !== "" && stage !== "";
    }
    if (currentStep === 2) {
      for (let i = 1; i <= 6; i++) {
        if (qAnswers[i] === undefined) return false;
      }
    }
    if (currentStep === 3) {
      for (let i = 7; i <= 12; i++) {
        if (qAnswers[i] === undefined) return false;
      }
    }
    if (currentStep === 4) {
      return (
        q13Opts.length > 0 &&
        q13Reason.trim() !== "" &&
        q14Opts.length > 0 &&
        q14Reason.trim() !== "" &&
        q15Commitment.trim() !== "" &&
        q15Reason.trim() !== ""
      );
    }
    return true;
  };

  const calculateRadarScores = () => {
    let totals = { L: 0, P: 0, I: 0, S: 0 };
    let counts = { L: 0, P: 0, I: 0, S: 0 };

    questions.forEach((q) => {
      const val = qAnswers[q.id];
      if (val !== undefined) {
        totals[q.axis] += val;
        counts[q.axis]++;
      }
    });

    const calculated = [
      counts.L > 0 ? totals.L / counts.L : 0,
      counts.P > 0 ? totals.P / counts.P : 0,
      counts.I > 0 ? totals.I / counts.I : 0,
      counts.S > 0 ? totals.S / counts.S : 0,
    ];
    setScores(calculated);
    return calculated;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      alert("Vui lòng điền đầy đủ tất cả thông tin yêu cầu trước khi tiếp tục.");
      return;
    }

    if (currentStep === totalSteps - 1) {
      const calculatedScores = calculateRadarScores();
      
      const assessmentData = {
        coachee_name: fullName,
        coachee_email: email,
        stage: stage,
        status: "Chờ nhận xét",
        scores: {
          L: Number(calculatedScores[0].toFixed(1)),
          P: Number(calculatedScores[1].toFixed(1)),
          I: Number(calculatedScores[2].toFixed(1)),
          S: Number(calculatedScores[3].toFixed(1)),
        },
        answers: {
          q1_q12: qAnswers,
          q13_opts: q13Opts,
          q13_reason: q13Reason,
          q14_opts: q14Opts,
          q14_reason: q14Reason,
          q15_commitment: q15Commitment,
          q15_reason: q15Reason,
        }
      };

      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase
            .from("assessments")
            .insert(assessmentData);

          if (error) throw error;
          console.log("Saved to Supabase successfully.");
        } catch (err) {
          console.error("Supabase insert failed, falling back to localStorage:", err);
          
          const newSubmission = {
            id: "sub_" + Date.now(),
            name: fullName,
            email: email,
            stage: stage,
            submittedAt: new Date().toLocaleString("vi-VN"),
            status: "Chờ nhận xét",
            scores: assessmentData.scores,
            answers: assessmentData.answers,
            review: null,
          };

          const existingSubmissions = JSON.parse(
            localStorage.getItem("lda_assessments") || "[]"
          );
          existingSubmissions.push(newSubmission);
          localStorage.setItem("lda_assessments", JSON.stringify(existingSubmissions));
        }
      } else {
        console.log("Supabase is not configured, falling back to localStorage.");
        const newSubmission = {
          id: "sub_" + Date.now(),
          name: fullName,
          email: email,
          stage: stage,
          submittedAt: new Date().toLocaleString("vi-VN"),
          status: "Chờ nhận xét",
          scores: assessmentData.scores,
          answers: assessmentData.answers,
          review: null,
        };

        const existingSubmissions = JSON.parse(
          localStorage.getItem("lda_assessments") || "[]"
        );
        existingSubmissions.push(newSubmission);
        localStorage.setItem("lda_assessments", JSON.stringify(existingSubmissions));
      }

      setCurrentStep(5);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const stepsInfo = [
    "Bước 1: Thông tin Coachee",
    "Bước 2: Phần 1 - Tư duy Lãnh đạo & Hiệu suất",
    "Bước 3: Phần 2 - Tự chủ & Hệ thống quản trị",
    "Bước 4: Phần 3 - Định hướng & Cam kết",
    "Bước 5: Hoàn tất đánh giá",
  ];

  const progressPercentage = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  // Radar chart props
  const radarData = {
    labels: ["L (Lãnh đạo)", "P (Hiệu suất)", "I (Độc lập)", "S (Hệ thống)"],
    datasets: [
      {
        label: "Kết quả đánh giá sơ bộ",
        data: scores,
        fill: true,
        backgroundColor: "rgba(0, 88, 188, 0.2)",
        borderColor: "#0058bc",
        pointBackgroundColor: "#0058bc",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#0058bc",
      },
    ],
  };

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

  return (
    <div className="flex flex-col items-center justify-start flex-grow w-full max-w-4xl px-4 py-8 mx-auto gap-8">
      {/* Header */}
      <header className="text-center">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 font-bold rounded-lg bg-primary text-on-primary shadow-md shadow-primary/20">
            L
          </div>
          <span className="text-xl font-bold text-primary tracking-tight">
            Leadership development assessment
          </span>
        </div>
        <h1 className="text-2xl font-bold md:text-3xl text-on-surface">
          {currentStep === 5 ? "Hoàn Tất Đánh Giá" : "Đánh Giá Tiến Triển Coachee"}
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {currentStep === 5
            ? "Cảm ơn bạn đã nộp bài!"
            : "Chương trình đo lường tư duy & năng lực lãnh đạo"}
        </p>
      </header>

      {/* Progress Bar */}
      {currentStep < 5 && (
        <div className="w-full p-5 border bg-surface border-outline-variant rounded-2xl shadow-sm">
          <div className="flex flex-wrap justify-between gap-2 mb-3">
            <span className="text-sm font-semibold text-primary">
              {stepsInfo[currentStep - 1]}
            </span>
            <span className="text-sm font-semibold text-on-surface-variant">
              {progressPercentage}% Hoàn thành
            </span>
          </div>
          <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="w-full p-6 md:p-10 border bg-surface border-outline-variant rounded-3xl shadow-sm min-h-[400px] flex flex-col justify-between">
        
        {/* STEP 1: Info */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold mb-1 text-on-surface">Thông tin Coachee</h2>
              <p className="text-sm text-on-surface-variant">
                Vui lòng cung cấp chính xác thông tin để lưu trữ dữ liệu và nhận báo cáo đánh giá qua email.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">Họ và tên của bạn</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn Hùng"
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface text-on-surface focus:border-primary focus:ring-3 focus:ring-primary/15 transition-all outline-none"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">Địa chỉ Email</label>
                <input
                  type="email"
                  placeholder="Ví dụ: hung.nguyen@insurance.com"
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface text-on-surface focus:border-primary focus:ring-3 focus:ring-primary/15 transition-all outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">
                  Giai đoạn đánh giá trong chương trình coaching
                </label>
                <select
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface text-on-surface focus:border-primary focus:ring-3 focus:ring-primary/15 transition-all outline-none"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  required
                >
                  <option value="" disabled>-- Chọn giai đoạn đánh giá --</option>
                  <option value="Giai đoạn 1">Giai đoạn 1</option>
                  <option value="Giai đoạn 2" disabled>Giai đoạn 2 (Chưa mở khóa)</option>
                  <option value="Giai đoạn 3" disabled>Giai đoạn 3 (Chưa mở khóa)</option>
                  <option value="Giai đoạn 4" disabled>Giai đoạn 4 (Chưa mở khóa)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: MCQ (Q1 - Q6) */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold mb-1 text-on-surface">
                Phần 1: Trắc nghiệm Tư duy Lãnh đạo & Hiệu suất
              </h2>
              <p className="text-sm text-on-surface-variant">
                Chọn phương án mô tả đúng nhất với tần suất hoặc thực tế hành động của bạn.
              </p>
            </div>

            <div className="flex flex-col gap-8 mt-2">
              {questions.slice(0, 6).map((q) => (
                <div key={q.id} className="pb-6 border-b border-surface-container-high last:border-0 last:pb-0">
                  <h3 className="text-base font-semibold mb-4 flex gap-3 text-on-surface">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-container-high text-xs font-bold text-on-surface-variant flex-shrink-0 mt-0.5">
                      {q.id}
                    </span>
                    <span>{q.text}</span>
                  </h3>
                  <div className="flex flex-col gap-3">
                    {q.options.map((opt) => (
                      <label
                        key={opt.key}
                        className={`flex items-center gap-3 p-3.5 border rounded-lg cursor-pointer transition-all duration-200 ${
                          qAnswers[q.id] === opt.val
                            ? "bg-secondary-container border-primary text-primary"
                            : "bg-background border-outline-variant hover:bg-surface-container-low hover:border-primary-container"
                        }`}
                        onClick={() => handleQAnswerChange(q.id, opt.val)}
                      >
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          className="hidden"
                          checked={qAnswers[q.id] === opt.val}
                          readOnly
                        />
                        <span
                          className={`flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold transition-all ${
                            qAnswers[q.id] === opt.val
                              ? "bg-primary border-primary text-on-primary"
                              : "bg-surface border-outline-variant"
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className="text-sm font-medium">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: MCQ (Q7 - Q12) */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold mb-1 text-on-surface">
                Phần 2: Trắc nghiệm Tự chủ & Phát triển hệ thống
              </h2>
              <p className="text-sm text-on-surface-variant">
                Tiếp tục chọn phương án mô tả đúng nhất với thực tế quản trị của bạn.
              </p>
            </div>

            <div className="flex flex-col gap-8 mt-2">
              {questions.slice(6, 12).map((q) => (
                <div key={q.id} className="pb-6 border-b border-surface-container-high last:border-0 last:pb-0">
                  <h3 className="text-base font-semibold mb-4 flex gap-3 text-on-surface">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-container-high text-xs font-bold text-on-surface-variant flex-shrink-0 mt-0.5">
                      {q.id}
                    </span>
                    <span>{q.text}</span>
                  </h3>
                  <div className="flex flex-col gap-3">
                    {q.options.map((opt) => (
                      <label
                        key={opt.key}
                        className={`flex items-center gap-3 p-3.5 border rounded-lg cursor-pointer transition-all duration-200 ${
                          qAnswers[q.id] === opt.val
                            ? "bg-secondary-container border-primary text-primary"
                            : "bg-background border-outline-variant hover:bg-surface-container-low hover:border-primary-container"
                        }`}
                        onClick={() => handleQAnswerChange(q.id, opt.val)}
                      >
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          className="hidden"
                          checked={qAnswers[q.id] === opt.val}
                          readOnly
                        />
                        <span
                          className={`flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold transition-all ${
                            qAnswers[q.id] === opt.val
                              ? "bg-primary border-primary text-on-primary"
                              : "bg-surface border-outline-variant"
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className="text-sm font-medium">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Essay (Q13 - Q15) */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold mb-1 text-on-surface">
                Phần 3: Định hướng & Cam kết Hành động
              </h2>
              <p className="text-sm text-on-surface-variant">
                Hãy chia sẻ sâu sắc hơn về các bài học và định hướng hành động của bạn.
              </p>
            </div>

            <div className="flex flex-col gap-8 mt-2">
              
              {/* Q13 */}
              <div className="pb-6 border-b border-surface-container-high">
                <h3 className="text-base font-semibold mb-4 flex gap-3 text-on-surface">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex-shrink-0 mt-0.5">
                    13
                  </span>
                  <span>Nhìn lại Giai đoạn 1, điều gì bạn học được từ chương trình coaching đã tạo ra thay đổi rõ nhất? (Chọn nhiều ý)</span>
                </h3>
                
                <div className="grid gap-3 md:grid-cols-2 mb-4">
                  {q13OptionsList.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-start gap-3 p-3.5 border rounded-lg cursor-pointer transition-all ${
                        q13Opts.includes(opt)
                          ? "bg-secondary-container border-primary text-primary"
                          : "bg-background border-outline-variant hover:bg-surface-container-low"
                      }`}
                      onClick={() => handleQ13OptToggle(opt)}
                    >
                      <input
                        type="checkbox"
                        checked={q13Opts.includes(opt)}
                        className="mt-1"
                        readOnly
                      />
                      <span className="text-sm font-medium">{opt}</span>
                    </label>
                  ))}
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-xs font-bold text-on-surface-variant uppercase">
                    Theo bạn, thay đổi này đã tạo ra kết quả gì cho khu vực?
                  </label>
                  <textarea
                    placeholder="Mô tả kết quả thực tế cụ thể..."
                    className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface text-on-surface focus:border-primary focus:ring-3 focus:ring-primary/15 transition-all outline-none min-h-[100px]"
                    value={q13Reason}
                    onChange={(e) => setQ13Reason(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Q14 */}
              <div className="pb-6 border-b border-surface-container-high">
                <h3 className="text-base font-semibold mb-4 flex gap-3 text-on-surface">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex-shrink-0 mt-0.5">
                    14
                  </span>
                  <span>Bước sang Giai đoạn 2, bạn mong muốn phát triển mạnh nhất ở nội dung nào? (Chọn tối đa 03 nội dung)</span>
                </h3>

                <div className="grid gap-3 md:grid-cols-2 mb-4">
                  {q14OptionsList.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-start gap-3 p-3.5 border rounded-lg cursor-pointer transition-all ${
                        q14Opts.includes(opt)
                          ? "bg-secondary-container border-primary text-primary"
                          : "bg-background border-outline-variant hover:bg-surface-container-low"
                      }`}
                      onClick={() => handleQ14OptToggle(opt)}
                    >
                      <input
                        type="checkbox"
                        checked={q14Opts.includes(opt)}
                        className="mt-1"
                        readOnly
                      />
                      <span className="text-sm font-medium">{opt}</span>
                    </label>
                  ))}
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-xs font-bold text-on-surface-variant uppercase">
                    Bạn mong muốn Coach hỗ trợ mình điều gì nhiều nhất trong Giai đoạn 2?
                  </label>
                  <textarea
                    placeholder="Nêu rõ các mong đợi được Coach đồng hành, hướng dẫn..."
                    className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface text-on-surface focus:border-primary focus:ring-3 focus:ring-primary/15 transition-all outline-none min-h-[100px]"
                    value={q14Reason}
                    onChange={(e) => setQ14Reason(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Q15 */}
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-semibold flex gap-3 text-on-surface">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex-shrink-0 mt-0.5">
                    15
                  </span>
                  <span>Nếu chỉ được chọn MỘT thay đổi quan trọng nhất để tạo ra bước đột phá cho khu vực trong Giai đoạn 2, bạn sẽ cam kết thay đổi điều gì trước tiên?</span>
                </h3>

                <div className="flex flex-col gap-2">
                  <textarea
                    placeholder="Cam kết hành động cụ thể..."
                    className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface text-on-surface focus:border-primary focus:ring-3 focus:ring-primary/15 transition-all outline-none min-h-[100px]"
                    value={q15Commitment}
                    onChange={(e) => setQ15Commitment(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase">
                    Vì sao bạn chọn điều này?
                  </label>
                  <textarea
                    placeholder="Nêu động lực hoặc tầm quan trọng của thay đổi này..."
                    className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface text-on-surface focus:border-primary focus:ring-3 focus:ring-primary/15 transition-all outline-none min-h-[100px]"
                    value={q15Reason}
                    onChange={(e) => setQ15Reason(e.target.value)}
                    required
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 5: Success & Radar Display */}
        {currentStep === 5 && (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-fadeIn">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success text-3xl mb-6">
              ✓
            </div>
            <h2 className="text-2xl font-bold mb-3 text-on-surface">Nộp bài thành công!</h2>
            <p className="text-base text-on-surface-variant max-w-lg mb-8">
              Kết quả trắc nghiệm của bạn đã được ghi nhận vào hệ thống. Vui lòng đợi coach nhận xét và phản hồi.
            </p>

            <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container text-[11px] font-bold rounded uppercase tracking-wider mb-4">
              Phiên bản thử nghiệm (Prototype Only)
            </span>
            
            <div className="mb-4">
              {!showChart && (
                <button
                  type="button"
                  className="px-6 py-3 border border-dashed border-outline bg-surface-container-highest text-on-surface font-semibold rounded-lg hover:bg-surface-container-high transition-all"
                  onClick={() => setShowChart(true)}
                >
                  👁 Xem nhanh biểu đồ đánh giá trắc nghiệm sơ bộ
                </button>
              )}
            </div>

            {showChart && (
              <div className="w-full max-w-md p-5 border border-outline-variant rounded-2xl bg-surface-container-low text-left">
                <h3 className="text-sm font-bold mb-4 text-primary text-center">
                  Biểu Đồ Trắc Nghiệm Sơ Bộ (12 Câu)
                </h3>
                
                <div className="w-[300px] h-[300px] mx-auto">
                  <Radar data={radarData} options={radarOptions} />
                </div>

                <div className="mt-6 text-xs text-on-surface-variant leading-relaxed">
                  <strong>Chú thích 4 trục:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>L (Leadership):</strong> Tầm nhìn & Phát triển đội ngũ.</li>
                    <li><strong>P (Performance):</strong> Hiệu suất & KPIs kinh doanh.</li>
                    <li><strong>I (Independence):</strong> Tự chủ & Ra quyết định độc lập.</li>
                    <li><strong>S (System):</strong> Hệ thống hóa quy trình quản trị.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Buttons Nav */}
        {currentStep < 5 && (
          <div className="flex gap-4 justify-between mt-10">
            <button
              type="button"
              className="px-6 py-3 bg-transparent border border-outline text-secondary font-semibold rounded-lg hover:bg-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              onClick={handlePrev}
              disabled={currentStep === 1}
            >
              ← Quay lại
            </button>
            
            <button
              type="button"
              className="px-6 py-3 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary-hover shadow-md shadow-primary/15 transition-all"
              onClick={handleNext}
            >
              {currentStep === totalSteps - 1 ? "Nộp bài ✔" : "Tiếp tục →"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
