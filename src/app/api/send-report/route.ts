import { NextResponse } from "next/server";
import { Resend } from "resend";
import { jsPDF } from "jspdf";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

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
    doc.setFont("Helvetica");

    // Title Block
    doc.setFontSize(18);
    doc.setTextColor(0, 88, 188); // #0058bc
    doc.text("LEADERSHIP DEVELOPMENT ASSESSMENT", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(86, 100, 117);
    doc.text("Bao cao danh gia nang luc chuong trinh MAFL", 105, 28, { align: "center" });

    doc.setDrawColor(193, 198, 215); // #c1c6d7
    doc.line(20, 35, 190, 35);

    // Profile Table
    doc.setFontSize(11);
    doc.setTextColor(24, 28, 35);
    doc.text(`Coachee: ${cleanText(coacheeName)}`, 20, 45);
    doc.text(`Email: ${coacheeEmail}`, 20, 52);
    doc.text(`Giai doan: ${cleanText(stage)}`, 130, 45);
    doc.text(`Ngay nop: ${cleanText(submittedAt)}`, 130, 52);

    doc.line(20, 60, 190, 60);

    // Score Table
    doc.setFontSize(13);
    doc.setTextColor(0, 88, 188);
    doc.text("KET QUA TRAC NGHIEM 4 TRUC (L-P-I-S)", 20, 70);

    doc.setFontSize(11);
    doc.setTextColor(24, 28, 35);
    doc.text(`- Lanh dao (L): ${scores.L}/10`, 30, 80);
    doc.text(`- Hieu suat (P): ${scores.P}/10`, 30, 88);
    doc.text(`- Doc lap (I): ${scores.I}/10`, 110, 80);
    doc.text(`- He thong (S): ${scores.S}/10`, 110, 88);

    // Draw Vector Radar Chart
    const cx = 105;
    const cy = 135;
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

    // Labels
    doc.setFontSize(9);
    doc.setTextColor(86, 100, 117);
    doc.text("L", cx, cy - maxR - 2, { align: "center" });
    doc.text("P", cx + maxR + 3, cy + 1);
    doc.text("I", cx, cy + maxR + 4, { align: "center" });
    doc.text("S", cx - maxR - 5, cy + 1);

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

    // Footer divider
    doc.line(20, 180, 190, 180);

    // Coach review block
    doc.setFontSize(13);
    doc.setTextColor(0, 88, 188);
    doc.text("NHAN XET & DANH GIA CUA COACH", 20, 190);

    doc.setFontSize(11);
    doc.setTextColor(24, 28, 35);
    doc.text(`- Phan hoi hoc tap (Q13): ${q13Stars}/3 sao`, 20, 202);
    doc.text(`- Muc do san sang (Q14): ${q14Stars}/3 sao`, 20, 209);
    doc.text(`- Muc do cam ket (Q15): ${q15Stars}/3 sao`, 20, 216);

    doc.text("Nhan xet chung cua Coach:", 20, 226);
    const splitFeedback = doc.splitTextToSize(cleanText(feedback), 170);
    doc.text(splitFeedback, 20, 233);

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
