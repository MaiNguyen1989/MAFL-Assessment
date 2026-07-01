import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-background">
      <div className="w-full max-w-2xl text-center flex flex-col gap-8">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 text-3xl font-bold rounded-xl bg-primary text-on-primary shadow-lg shadow-primary/25">
            L
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-on-surface">
            Leadership development assessment
          </h1>
          <p className="text-lg text-on-surface-variant max-w-lg">
            Bài trắc nghiệm năng lực lãnh đạo chương trình MAFL
          </p>
        </div>

        {/* Portal Options */}
        <div className="grid gap-6 md:grid-cols-2 mt-4">
          
          {/* Coachee Portal */}
          <Link 
            href="/coachee" 
            className="flex flex-col items-center justify-between p-8 text-center bg-surface border border-outline-variant rounded-2xl hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-on-surface">Cổng Coachee</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Phần Coachee làm trắc nghiệm
              </p>
            </div>
            <span className="mt-8 text-sm font-semibold text-primary group-hover:text-primary-hover flex items-center gap-1">
              Làm bài đánh giá <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </Link>

          {/* Coach Portal */}
          <Link 
            href="/coach" 
            className="flex flex-col items-center justify-between p-8 text-center bg-surface border border-outline-variant rounded-2xl hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-on-surface">Cổng Coach</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Phần coach review và gửi phản hồi cho coachee
              </p>
            </div>
            <span className="mt-8 text-sm font-semibold text-primary group-hover:text-primary-hover flex items-center gap-1">
              Chấm điểm & Đánh giá <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </Link>

        </div>

        {/* Footer */}
        <div className="mt-12 text-xs text-on-surface-variant">
          &copy; 2026 Leadership Development Assessment. All rights reserved.
        </div>

      </div>
    </div>
  );
}
