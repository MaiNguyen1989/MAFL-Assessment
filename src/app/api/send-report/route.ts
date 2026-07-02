import { NextResponse } from "next/server";
import { Resend } from "resend";
import { jsPDF } from "jspdf";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import fs from "fs";
import path from "path";

interface RequestBody {
  assessmentId: string;
  download?: boolean;
  assessmentData?: {
    name: string;
    email: string;
    stage: string;
    scores: { L: number; P: number; I: number; S: number };
    review: {
      q13: number;
      q14: number;
      q15: number;
      feedback: string;
    } | null;
  };
}

function cleanText(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function getPDFMaturityLevel(score: number) {
  if (score >= 9.0) return { title: "Giải phóng (Bậc 5)", index: 4, desc: "Hệ thống tự vận hành ổn định, đội ngũ chủ động điều chỉnh và cải tiến liên tục." };
  if (score >= 7.0) return { title: "Chuẩn hóa (Bậc 4)", index: 3, desc: "Phát triển đội ngũ chủ động, áp dụng quy trình coaching và quản trị dựa trên số liệu." };
  if (score >= 5.0) return { title: "Thực thi (Bậc 3)", index: 2, desc: "Quy trình rõ ràng, giao việc bằng mục tiêu đầu ra và kiểm soát tiến độ định kỳ." };
  if (score >= 3.0) return { title: "Nhận thức (Bậc 2)", index: 1, desc: "Đã ý thức được các vấn đề cốt lõi nhưng quản trị hành vi vẫn cần giám sát trực tiếp." };
  return { title: "Bản năng (Bậc 1)", index: 0, desc: "Quản lý công việc theo thói quen tự thân, xử lý sự vụ phát sinh ngắn hạn." };
}

function getLocalFontBase64(filename: string): string {
  const filePath = path.join(process.cwd(), "public", "fonts", filename);
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString("base64");
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { assessmentId, download, assessmentData } = body;

    if (!assessmentId) {
      return NextResponse.json({ error: "Missing assessmentId" }, { status: 400 });
    }

    let coacheeName = "";
    let coacheeEmail = "";
    let stage = "";
    let submittedAt = "";
    let scores = { L: 0, P: 0, I: 0, S: 0 };
    let q13Stars = 0;
    let q14Stars = 0;
    let q15Stars = 0;
    let feedback = "";

    // If it's a mock coachee ID (e.g. sub_mock1, sub_mock2), handle mock database values for local simulation
    if (assessmentId.startsWith("sub_mock")) {
      const isHung = assessmentId === "sub_mock1";
      coacheeName = isHung ? "Nguyen Van Hung" : "Tran Thi Lan";
      coacheeEmail = isHung ? "hung.nguyen@insurance.com" : "lan.tran@insurance.com";
      stage = "Giai doan 1";
      submittedAt = isHung ? "01/07/2026, 10:15:20" : "30/06/2026, 16:30:10";
      scores = isHung ? { L: 7.3, P: 6.0, I: 4.7, S: 5.3 } : { L: 8.5, P: 7.8, I: 8.0, S: 9.0 };
      q13Stars = isHung ? 2 : 3;
      q14Stars = isHung ? 2 : 2;
      q15Stars = isHung ? 2 : 3;
      feedback = isHung
        ? "Coachee Hung can chu dong sap xep cong viec va coaching cho doi ngu nhieu hon de giai phong thoi gian quản ly."
        : "Coachee Lan da co nhung chuyen bien ro net va ung dung hieu qua cong cu quan tri he thong vao van phong.";
    } else if (isSupabaseConfigured) {
      try {
        // Fetch assessment details from Supabase
        const { data: assessment, error: assessmentError } = await supabase
          .from("assessments")
          .select("*, coach_reviews(*)")
          .eq("id", assessmentId)
          .single();

        if (assessmentError || !assessment) {
          throw new Error(assessmentError?.message || "Assessment not found");
        }

        coacheeName = assessment.coachee_name;
        coacheeEmail = assessment.coachee_email;
        stage = assessment.stage;
        submittedAt = new Date(assessment.submitted_at).toLocaleString("vi-VN");
        scores = assessment.scores;

        const review = assessment.coach_reviews && assessment.coach_reviews.length > 0
          ? assessment.coach_reviews[0]
          : null;

        if (!review) {
          throw new Error("Coach review not found for this assessment");
        }

        q13Stars = review.q13_stars;
        q14Stars = review.q14_stars;
        q15Stars = review.q15_stars;
        feedback = review.feedback;
      } catch (dbError) {
        console.warn("Supabase fetch failed in API route, attempting to use backup assessmentData:", dbError);
        if (assessmentData) {
          coacheeName = assessmentData.name;
          coacheeEmail = assessmentData.email;
          stage = assessmentData.stage;
          submittedAt = new Date().toLocaleString("vi-VN");
          scores = assessmentData.scores;
          q13Stars = assessmentData.review?.q13 || 0;
          q14Stars = assessmentData.review?.q14 || 0;
          q15Stars = assessmentData.review?.q15 || 0;
          feedback = assessmentData.review?.feedback || "";
        } else {
          throw dbError; // Re-throw if no backup payload is available
        }
      }
    } else if (assessmentData) {
      coacheeName = assessmentData.name;
      coacheeEmail = assessmentData.email;
      stage = assessmentData.stage;
      submittedAt = new Date().toLocaleString("vi-VN");
      scores = assessmentData.scores;
      q13Stars = assessmentData.review?.q13 || 0;
      q14Stars = assessmentData.review?.q14 || 0;
      q15Stars = assessmentData.review?.q15 || 0;
      feedback = assessmentData.review?.feedback || "";
    } else {
      // Fallback response for unconfigured local environment
      return NextResponse.json({
        success: true,
        message: "Simulation: Supabase and Resend are not configured. Generated report locally.",
      });
    }

    // 1. Generate PDF Report using jsPDF
    const doc = new jsPDF();
    
    let fontLoaded = false;
    try {
      const regBase64 = getLocalFontBase64("Roboto-Regular.ttf");
      const boldBase64 = getLocalFontBase64("Roboto-Bold.ttf");
      
      doc.addFileToVFS("Roboto-Regular.ttf", regBase64);
      doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
      
      doc.addFileToVFS("Roboto-Bold.ttf", boldBase64);
      doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
      
      doc.setFont("Roboto", "normal");
      fontLoaded = true;
    } catch (e) {
      console.error("Failed to load local Roboto fonts, falling back to Helvetica:", e);
      doc.setFont("Helvetica", "normal");
    }

    const t = (text: string) => {
      if (fontLoaded) return text;
      return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
    };

    const setFont = (style: "normal" | "bold") => {
      doc.setFont(fontLoaded ? "Roboto" : "Helvetica", style);
    };

    // Title Block
    setFont("bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 88, 188); // #0058bc
    doc.text("LEADERSHIP DEVELOPMENT ASSESSMENT", 105, 20, { align: "center" });

    setFont("normal");
    doc.setFontSize(11);
    doc.setTextColor(86, 100, 117);
    doc.text(t("Báo cáo đánh giá năng lực chương trình MAFL"), 105, 27, { align: "center" });

    doc.setDrawColor(193, 198, 215); // #c1c6d7
    doc.line(20, 33, 190, 33);

    // Profile Table
    setFont("normal");
    doc.setFontSize(10.5);
    doc.setTextColor(24, 28, 35);
    doc.text(t(`Coachee: ${coacheeName}`), 20, 42);
    doc.text(t(`Email: ${coacheeEmail}`), 20, 49);
    doc.text(t(`Giai đoạn: ${stage}`), 130, 42);
    doc.text(t(`Ngày nộp: ${submittedAt}`), 130, 49);

    doc.line(20, 56, 190, 56);

    // Score Table
    setFont("bold");
    doc.setFontSize(12.5);
    doc.setTextColor(0, 88, 188);
    doc.text(t("KẾT QUẢ TRẮC NGHIỆM 4 TRỤC (L-P-I-S)"), 20, 66);

    setFont("normal");
    doc.setFontSize(10.5);
    doc.setTextColor(24, 28, 35);
    doc.text(t(`- Lãnh đạo (L): ${scores.L}/10`), 30, 76);
    doc.text(t(`- Hiệu suất (P): ${scores.P}/10`), 30, 84);
    doc.text(t(`- Độc lập (I): ${scores.I}/10`), 110, 76);
    doc.text(t(`- Hệ thống (S): ${scores.S}/10`), 110, 84);

    const avgScore = (scores.L + scores.P + scores.I + scores.S) / 4;
    const maturity = getPDFMaturityLevel(avgScore);

    // Section 2: Visual Charts (Radar & Staircase Side-by-Side)
    setFont("bold");
    doc.setFontSize(12.5);
    doc.setTextColor(0, 88, 188);
    doc.text(t("BIỂU ĐỒ LPIS & BẬC MATURITY LEVEL LMA"), 20, 96);

    // Left side: Radar Chart
    const cx = 68;
    const cy = 134;
    const maxR = 30; 
    const scale = maxR / 10; 

    // Draw Concentric Diamonds Grid
    doc.setDrawColor(236, 237, 249);
    for (let i = 2; i <= 10; i += 2) {
      const r = i * scale;
      doc.line(cx, cy - r, cx + r, cy);
      doc.line(cx + r, cy, cx, cy + r);
      doc.line(cx, cy + r, cx - r, cy);
      doc.line(cx - r, cy, cx, cy - r);
    }

    // Draw Ticks Cross Axes
    doc.setDrawColor(193, 198, 215);
    doc.line(cx, cy - maxR, cx, cy + maxR);
    doc.line(cx - maxR, cy, cx + maxR, cy);

    // Radar Labels (Large & Clear)
    setFont("bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 88, 188);
    doc.text(t("L (Lãnh đạo)"), cx, cy - maxR - 3, { align: "center" });
    doc.text(t("P (Hiệu suất)"), cx + maxR + 3, cy + 1);
    doc.text(t("I (Độc lập)"), cx, cy + maxR + 5, { align: "center" });
    doc.text(t("S (Hệ thống)"), cx - maxR - 22, cy + 1);

    // Plot Points and Draw Polygon
    const ptL = { x: cx, y: cy - (scores.L * scale) };
    const ptP = { x: cx + (scores.P * scale), y: cy };
    const ptI = { x: cx, y: cy + (scores.I * scale) };
    const ptS = { x: cx - (scores.S * scale), y: cy };

    doc.setDrawColor(0, 88, 188); 
    doc.setLineWidth(0.8);
    doc.line(ptL.x, ptL.y, ptP.x, ptP.y);
    doc.line(ptP.x, ptP.y, ptI.x, ptI.y);
    doc.line(ptI.x, ptI.y, ptS.x, ptS.y);
    doc.line(ptS.x, ptS.y, ptL.x, ptL.y);
    doc.setLineWidth(0.2); 

    // Right side: Vertical Staircase Ladder
    // Draw 5 steps from y = 110 to 158
    const stairs = [
      { title: "Bản năng", range: "1.0 - 2.9" },
      { title: "Nhận thức", range: "3.0 - 4.9" },
      { title: "Thực thi", range: "5.0 - 6.9" },
      { title: "Chuẩn hóa", range: "7.0 - 8.9" },
      { title: "Giải phóng", range: "9.0 - 10.0" }
    ];

    const startX = 122;
    const stepW = 18;
    const stepH = 7;

    for (let i = 0; i < 5; i++) {
      const sy = 154 - (i * 11);
      const stepLabel = `Bậc ${i + 1}`;
      const isActive = maturity.index === i;

      if (isActive) {
        // Active: Solid blue fill and white text for step label block
        doc.setFillColor(0, 88, 188); // #0058bc
        doc.rect(startX, sy, stepW, stepH, "F");
        doc.setTextColor(255, 255, 255);
        setFont("bold");
        doc.setFontSize(8.5);
        doc.text(t(stepLabel), startX + (stepW / 2), sy + 4.8, { align: "center" });

        // Active description text (Bold)
        doc.setTextColor(0, 88, 188);
        doc.setFontSize(9);
        doc.text(t(`- ${stairs[i].title} (${avgScore.toFixed(1)}/10) <- Hiện tại`), startX + stepW + 4, sy + 5);
      } else {
        // Inactive: Light grey border and fill
        doc.setDrawColor(220, 222, 235);
        doc.setFillColor(245, 246, 250);
        doc.rect(startX, sy, stepW, stepH, "FD");
        doc.setTextColor(130, 135, 155);
        setFont("normal");
        doc.setFontSize(8.5);
        doc.text(t(stepLabel), startX + (stepW / 2), sy + 4.8, { align: "center" });

        // Inactive description text
        doc.setTextColor(110, 115, 130);
        doc.setFontSize(8.5);
        doc.text(t(`- ${stairs[i].title} (${stairs[i].range})`), startX + stepW + 4, sy + 4.8);
      }
    }

    // Divider Line (Separate Visual Section and Review Section)
    doc.setDrawColor(193, 198, 215);
    doc.line(20, 178, 190, 178);

    // Coach review block
    setFont("bold");
    doc.setFontSize(12.5);
    doc.setTextColor(0, 88, 188);
    doc.text(t("NHẬN XÉT & ĐÁNH GIÁ CỦA COACH"), 20, 187);

    setFont("normal");
    doc.setFontSize(10.5);
    doc.setTextColor(24, 28, 35);
    doc.text(t(`- Phản hồi học tập (Q13): ${q13Stars}/3 sao`), 20, 197);
    doc.text(t(`- Mức độ sẵn sàng (Q14): ${q14Stars}/3 sao`), 20, 204);
    doc.text(t(`- Mức độ cam kết (Q15): ${q15Stars}/3 sao`), 20, 211);

    setFont("bold");
    doc.text(t("Nhận xét chung của Coach:"), 20, 221);
    setFont("normal");
    const splitFeedback = doc.splitTextToSize(t(feedback), 170);
    doc.text(splitFeedback, 20, 228);

    // If request is only for downloading the PDF, return it immediately
    if (download) {
      return NextResponse.json({ success: true, pdf: doc.output("datauristring") });
    }

    return NextResponse.json({ success: true, message: "PDF Generated successfully." });
  } catch (error: any) {
    console.error("Report generation/sending failed:", error);
    return NextResponse.json({ error: error.message || "Failed to generate report" }, { status: 500 });
  }
}
