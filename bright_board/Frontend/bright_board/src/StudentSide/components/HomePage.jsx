import React from 'react';
import { 
  Facebook, Twitter, Linkedin, Instagram, Github, 
  Mail, Phone, ChevronRight, ArrowRight, BookOpen, 
  Users, Award, Star, Sparkles, UserPlus, Upload,
  BarChart3, Trophy, Building2, Target, GraduationCap,
  ClipboardCheck, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import useIntersection from '../../hooks/useIntersection';
import { 
  PencilSVG, BookSVG, GradCapSVG, BackpackSVG, 
  LightbulbSVG, StarSVG, ABCBlockSVG, SchoolBellSVG,
  ChalkboardSVG, SparklesSVG, DoodleArrowSVG, RulerSVG,
  GlobeSVG, ClipboardSVG, CalculatorSVG
} from '../../components/svg/SchoolIllustrations';

// ─── Scrolling Illustration Marquee ──────────────────
const IllustrationMarquee = ({ direction = 'left', speed = 40 }) => {
  const illustrations = [
    <PencilSVG size={50} />, <BookSVG size={60} />, <GradCapSVG size={50} />,
    <BackpackSVG size={50} />, <LightbulbSVG size={45} />, <StarSVG size={40} />,
    <SchoolBellSVG size={40} />, <CalculatorSVG size={45} />, <RulerSVG size={60} />,
    <GlobeSVG size={45} />, <ClipboardSVG size={45} />, <ABCBlockSVG size={70} />,
    <ChalkboardSVG size={70} />,
  ];

  return (
    <div className="relative w-full overflow-hidden py-8" aria-hidden="true">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#f9faf6] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#f9faf6] to-transparent z-10 pointer-events-none" />
      <div
        className="flex gap-16 items-center"
        style={{
          animation: `scroll-${direction} ${speed}s linear infinite`,
          width: 'max-content',
        }}
      >
        {/* Duplicate for seamless loop */}
        {[...illustrations, ...illustrations].map((svg, i) => (
          <div key={i} className="opacity-30 hover:opacity-60 transition-opacity duration-300 shrink-0">
            {svg}
          </div>
        ))}
      </div>
    </div>
  );
};

function HomePage() {
  const { ref: heroRef, inView: heroInView } = useIntersection({ threshold: 0.2 });
  const { ref: statsRef, inView: statsInView } = useIntersection({ threshold: 0.2 });
  const { ref: howRef, inView: howInView } = useIntersection({ threshold: 0.2 });
  const { ref: contactRef, inView: contactInView } = useIntersection({ threshold: 0.2 });
  const { ref: footerRef, inView: footerInView } = useIntersection({ threshold: 0.1 });

  const stats = [
    { value: "2", label: "Institutes Enrolled", icon: Building2, color: "bg-[#e2f6d5]", iconColor: "text-[#163300]" },
    { value: "90%", label: "Success Rate", icon: Target, color: "bg-[#fff8e0]", iconColor: "text-[#8a6d00]" },
    { value: "1k+", label: "Students", icon: GraduationCap, color: "bg-[#e8f4ff]", iconColor: "text-[#0066cc]" },
    { value: "25+", label: "Experts", icon: Users, color: "bg-[#f0e6ff]", iconColor: "text-[#6b21a8]" },
    { value: "4.8", label: "Average Rating", icon: Star, color: "bg-[#ffe8d9]", iconColor: "text-[#c2410c]" },
  ];
  
  const steps = [
    { title: "Sign Up", description: "Register as an Institute, Tutor, or Student in seconds.", icon: UserPlus, color: "#9fe870" },
    { title: "Access & Upload", description: "Tutors upload materials, students access resources instantly.", icon: Upload, color: "#ffd11a" },
    { title: "Track Progress", description: "Manage attendance, reports, and performance analytics.", icon: BarChart3, color: "#ffc091" },
    { title: "Succeed", description: "Enhance learning with structured insights and grow.", icon: Trophy, color: "#cdffad" },
  ];

  return (
    <div className="w-full min-h-screen bg-[#f9faf6] text-[#0e0f0c] font-body">
      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[5%] py-4 max-h-[80px] bg-white/80 backdrop-blur-md border-b border-[#e8ebe6]">
        <div className="text-2xl font-display tracking-tight text-[#0e0f0c] flex items-center gap-2">
          <span className="w-8 h-8 bg-[#9fe870] rounded-full flex items-center justify-center text-[#163300] text-sm font-bold">B</span>
          BrightBoard
        </div>
        <ul className="hidden md:flex items-center gap-6">
          <li><a href="#hero" className="text-[#454745] hover:text-[#163300] transition-colors px-3 py-2 font-semibold text-sm">Home</a></li>
          <li><a href="#howItWorks" className="text-[#454745] hover:text-[#163300] transition-colors px-3 py-2 font-semibold text-sm">How It Works</a></li>
          <li><a href="#contact" className="text-[#454745] hover:text-[#163300] transition-colors px-3 py-2 font-semibold text-sm">Contact</a></li>
          <li>
            <Link to="/role">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </li>
        </ul>
        {/* Mobile CTA */}
        <Link to="/role" className="md:hidden">
          <Button variant="primary" size="sm">Start</Button>
        </Link>
      </nav>

      {/* ═══ HERO SECTION ═══ */}
      <section
        id="hero"
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-center items-center text-center px-[5%] pt-20 overflow-hidden"
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #0e0f0c 0px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #0e0f0c 0px, transparent 1px, transparent 60px)',
          backgroundSize: '60px 60px'
        }} />

        {/* Floating Illustrations */}
        <div className="absolute top-[15%] left-[5%] opacity-60 pointer-events-none hidden md:block">
          <PencilSVG size={70} />
        </div>
        <div className="absolute top-[20%] right-[8%] opacity-50 pointer-events-none hidden md:block">
          <BookSVG size={90} />
        </div>
        <div className="absolute bottom-[20%] left-[10%] opacity-40 pointer-events-none hidden md:block">
          <GradCapSVG size={75} />
        </div>
        <div className="absolute bottom-[15%] right-[5%] opacity-50 pointer-events-none hidden md:block">
          <BackpackSVG size={70} />
        </div>
        <div className="absolute top-[40%] left-[2%] opacity-30 pointer-events-none hidden lg:block">
          <RulerSVG size={80} />
        </div>
        <div className="absolute top-[60%] right-[3%] opacity-40 pointer-events-none hidden lg:block">
          <CalculatorSVG size={55} />
        </div>
        <div className="absolute top-[10%] left-[40%] opacity-40 pointer-events-none">
          <SparklesSVG size={35} />
        </div>
        <div className="absolute bottom-[30%] right-[30%] opacity-30 pointer-events-none">
          <SparklesSVG size={30} />
        </div>

        {/* Green blob decorations */}
        <div className="absolute top-[10%] right-[15%] w-[300px] h-[300px] bg-[#9fe870]/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[10%] w-[250px] h-[250px] bg-[#ffd11a]/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-[#e2f6d5] text-[#163300] rounded-full text-sm font-bold mb-8 transition-all duration-700 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Sparkles size={16} /> Next-Gen Learning Platform
          </div>
          <h1
            className={`text-5xl md:text-7xl lg:text-8xl font-display leading-[0.95] mb-6 text-[#0e0f0c] transition-all duration-700 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Transform Learning with{' '}
            <span className="relative inline-block">
              BrightBoard
              <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" fill="none">
                <path d="M2 8 Q75 2 150 7 Q225 12 298 4" stroke="#9fe870" strokeWidth="5" strokeLinecap="round" fill="none" />
              </svg>
            </span>
          </h1>
          <p
            className={`text-lg md:text-xl text-[#454745] max-w-2xl mx-auto mb-10 font-medium leading-relaxed transition-all duration-700 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '200ms' }}
          >
            Empowering students, tutors, and institutes with next-gen digital tools for a brighter future.
          </p>
          <div className={`flex items-center justify-center gap-4 flex-wrap transition-all duration-700 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
            <Link to='/role'>
              <Button variant="primary" size="lg">
                Get Started Now <ArrowRight size={18} />
              </Button>
            </Link>
            <a href="#howItWorks">
              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ═══ SCROLLING ILLUSTRATIONS ═══ */}
      <IllustrationMarquee direction="left" speed={45} />

      {/* ═══ STATS SECTION ═══ */}
      <section
        id="stats"
        ref={statsRef}
        className={`relative px-[5%] py-24 bg-white transition-all duration-700 ${statsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      >
        <div className="absolute top-10 right-10 opacity-30 pointer-events-none"><StarSVG size={50} /></div>
        <div className="absolute bottom-10 left-10 opacity-20 pointer-events-none"><SchoolBellSVG size={50} /></div>

        <h2 className="text-4xl md:text-5xl font-display text-center mb-16 text-[#0e0f0c]">
          Our <span className="relative inline-block">Success
            <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
              <path d="M2 5 Q50 1 100 5 Q150 9 198 3" stroke="#9fe870" strokeWidth="4" strokeLinecap="round" fill="none" />
            </svg>
          </span>
        </h2>
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`bb-card text-center p-6 transition-all duration-500 ${statsInView ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl ${stat.color} flex items-center justify-center ${stat.iconColor}`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className="text-4xl font-display mb-2 text-[#163300]">{stat.value}</div>
                <div className="text-[#868685] font-semibold text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ SCROLLING ILLUSTRATIONS (reverse) ═══ */}
      <IllustrationMarquee direction="right" speed={50} />

      {/* ═══ HOW IT WORKS ═══ */}
      <section
        id="howItWorks"
        ref={howRef}
        className={`relative px-[5%] py-24 bg-[#f9faf6] transition-all duration-700 ${howInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      >
        {/* Floating illustrations */}
        <div className="absolute top-10 left-[5%] opacity-30 pointer-events-none hidden md:block"><LightbulbSVG size={60} /></div>
        <div className="absolute bottom-10 right-[5%] opacity-25 pointer-events-none hidden md:block"><ClipboardSVG size={55} /></div>
        <div className="absolute top-[50%] right-[3%] opacity-20 pointer-events-none hidden xl:block"><GlobeSVG size={60} /></div>

        <h2 className="text-4xl md:text-5xl font-display text-center mb-16 text-[#0e0f0c]">
          How It <span className="relative inline-block">Works
            <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
              <path d="M2 5 Q50 1 100 5 Q150 9 198 3" stroke="#ffd11a" strokeWidth="4" strokeLinecap="round" fill="none" />
            </svg>
          </span>
        </h2>
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className={`bb-card text-center p-8 transition-all duration-500 relative ${howInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                {/* Step number */}
                <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#f9faf6] border border-[#e8ebe6] flex items-center justify-center text-xs font-bold text-[#868685]">
                  {index + 1}
                </div>
                <div
                  className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-md border-2 border-[#0e0f0c]/10"
                  style={{ background: step.color }}
                >
                  <Icon size={28} strokeWidth={2.5} className="text-[#163300]" />
                </div>
                <h3 className="text-[#0e0f0c] text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-[#868685] text-sm leading-relaxed">{step.description}</p>
                {index < 3 && (
                  <div className="hidden lg:block absolute right-[-24px] top-[50%] translate-y-[-50%] z-20">
                    <DoodleArrowSVG size={40} direction="right" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ FEATURES HIGHLIGHTS ═══ */}
      <section className="px-[5%] py-24 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ClipboardCheck, title: "Smart Attendance", desc: "Mark attendance digitally with real-time tracking and automated reports.", color: "#e2f6d5", iconColor: "#163300" },
            { icon: BookOpen, title: "Study Materials", desc: "Upload PDFs, share notes, and keep resources organized by batch and subject.", color: "#fff8e0", iconColor: "#8a6d00" },
            { icon: TrendingUp, title: "Performance Analytics", desc: "Track exam scores, attendance trends, and learning progress over time.", color: "#ffe8d9", iconColor: "#c2410c" },
          ].map((feature, i) => (
            <div key={i} className="bb-card p-8 text-center group hover:shadow-lg transition-all duration-300">
              <div
                className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: feature.color }}
              >
                <feature.icon size={28} strokeWidth={2.5} style={{ color: feature.iconColor }} />
              </div>
              <h3 className="text-[#0e0f0c] text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-[#868685] text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CONTACT SECTION ═══ */}
      <section
        id="contact"
        ref={contactRef}
        className={`relative px-[5%] py-24 bg-[#f9faf6] overflow-hidden transition-all duration-700 ${contactInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      >
        <div className="absolute top-10 right-10 opacity-20 pointer-events-none hidden md:block"><ChalkboardSVG size={120} /></div>
        <div className="absolute bottom-10 left-10 opacity-20 pointer-events-none hidden md:block"><ABCBlockSVG size={80} /></div>

        <h2 className="text-4xl md:text-5xl font-display text-center mb-10 text-[#0e0f0c]">
          Need <span className="relative inline-block">Support?
            <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
              <path d="M2 5 Q50 1 100 5 Q150 9 198 3" stroke="#ffc091" strokeWidth="4" strokeLinecap="round" fill="none" />
            </svg>
          </span>
        </h2>
        <form className="relative z-10 max-w-xl mx-auto flex flex-col gap-5 bb-card p-10">
          <div className="absolute top-0 left-[10%] right-[10%] h-[3px] rounded-b-full bg-[#9fe870]" />
          <input type="text" placeholder="Your Name" required className="input-wise" />
          <input type="email" placeholder="Email Address" required className="input-wise" />
          <input type="tel" placeholder="Mobile Number" className="input-wise" />
          <textarea placeholder="Your Query" required className="input-wise min-h-[130px] resize-y !rounded-[20px]"></textarea>
          <Button variant="primary" size="md">Send Message <ArrowRight size={16} /></Button>
        </form>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer
        id="footer"
        ref={footerRef}
        className={`relative px-[5%] pt-20 pb-8 bg-[#0e0f0c] transition-all duration-700 ${footerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      >
        <div className="max-w-5xl mx-auto flex flex-wrap justify-between">
          <div className="mb-10 min-w-[250px] flex-1 px-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-8 bg-[#9fe870] rounded-full flex items-center justify-center text-[#163300] text-sm font-bold">B</span>
              <h3 className="text-white text-lg font-display">BrightBoard</h3>
            </div>
            <p className="text-[#9a9a9a] leading-7 text-sm">
              BrightBoard simplifies online learning with innovative tools for
              students, tutors, and institutes.
            </p>
          </div>

          <div className="mb-10 min-w-[250px] flex-1 px-6">
            <h3 className="text-white mb-6 text-lg font-bold">Quick Links</h3>
            <ul className="list-none space-y-2">
              <li><a className="text-[#9a9a9a] hover:text-[#9fe870] transition-colors text-sm" href="#hero">Home</a></li>
              <li><a className="text-[#9a9a9a] hover:text-[#9fe870] transition-colors text-sm" href="#howItWorks">How It Works</a></li>
              <li><a className="text-[#9a9a9a] hover:text-[#9fe870] transition-colors text-sm" href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="mb-10 min-w-[250px] flex-1 px-6">
            <h3 className="text-white mb-6 text-lg font-bold">Contact Us</h3>
            <p className="text-[#9a9a9a] mb-2 text-sm"><strong className="text-[#ccc]">Email:</strong> <a className="text-[#9a9a9a] hover:text-[#9fe870] transition-colors" href="mailto:brightboard@gmail.com">brightboard@gmail.com</a></p>
            <p className="text-[#9a9a9a] text-sm"><strong className="text-[#ccc]">Phone:</strong> <a className="text-[#9a9a9a] hover:text-[#9fe870] transition-colors" href="tel:9265172639">9265172639</a></p>
            <div className="flex gap-3 mt-6">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Instagram, label: 'Instagram' },
                { icon: Github, label: 'GitHub' },
              ].map(({ icon: Icon, label }) => (
                <a key={label} href="#" aria-label={label} className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-[#9a9a9a] transition-all hover:bg-[#9fe870] hover:text-[#163300] hover:-translate-y-1 hover:shadow-lg hover:shadow-[#9fe870]/20">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-white/10 text-[#666] text-sm">
          <p>&copy; {new Date().getFullYear()} BrightBoard. All rights reserved.</p>
        </div>
      </footer>

      {/* ═══ MARQUEE ANIMATION KEYFRAMES ═══ */}
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

export default HomePage;