// app/(landing)/page.tsx
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedCourses } from "@/components/landing/FeaturedCourses";
import { ForCreators } from "@/components/landing/ForCreators";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ProjectTimeline } from "@/components/landing/Timeline";
import { Testimonials } from "@/components/landing/Testimonials";
import { Faq } from "@/components/landing/Faq";

// Helper komponen untuk memberikan spasi yang konsisten
const SectionWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`py-16 sm:py-24 ${className}`}>{children}</div>;

export default function LandingPage() {
  return (
    // overflow-x-hidden sangat penting untuk banyak animasi lebar penuh ini
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <HeroSection />

      {/* Setiap komponen sekarang dibungkus dengan SectionWrapper 
        untuk memastikan spasi vertikal yang konsisten dan rapi.
      */}
      <SectionWrapper>
        <HowItWorks />
      </SectionWrapper>

      <SectionWrapper>
        <ForCreators />
      </SectionWrapper>

      <SectionWrapper>
        <FeaturedCourses />
      </SectionWrapper>

      <SectionWrapper>
        <ProjectTimeline />
      </SectionWrapper>

      <SectionWrapper>
        <Testimonials />
      </SectionWrapper>

      <SectionWrapper>
        <Faq />
      </SectionWrapper>
    </div>
  );
}
