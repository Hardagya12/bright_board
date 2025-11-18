import React from 'react';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Github, 
  Mail, 
  Phone,
  ChevronRight
} from 'lucide-react';
import StudyImg from '../images/Study.png';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import useIntersection from '../../hooks/useIntersection';
function HomePage() {
  const { ref: heroRef, inView: heroInView } = useIntersection({ threshold: 0.2 });
  const { ref: statsRef, inView: statsInView } = useIntersection({ threshold: 0.2 });
  const { ref: howRef, inView: howInView } = useIntersection({ threshold: 0.2 });
  const { ref: contactRef, inView: contactInView } = useIntersection({ threshold: 0.2 });
  const { ref: footerRef, inView: footerInView } = useIntersection({ threshold: 0.1 });

  const stats = [
    { value: "2", label: "Institutes Enrolled" },
    { value: "90%", label: "Success Rate" },
    { value: "1k+", label: "Students" },
    { value: "25+", label: "Experts" },
    { value: "4.8", label: "Average Rating" },
  ];
  
  const steps = [
    {
      title: "Sign Up",
      description: "Register as an Institute, Tutor, or Student.",
    },
    {
      title: "Access & Upload",
      description: "Tutors upload materials, students access resources.",
    },
    {
      title: "Track Progress",
      description: "Manage attendance, reports, and performance.",
    },
    {
      title: "Succeed",
      description: "Enhance learning with structured insights.",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-black text-white font-gill-sans">
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[5%] py-6 max-h-[100px] bg-black/80 backdrop-blur-md border-b border-bw-12">
        <div className="text-2xl font-comic font-bold tracking-wide">BrightBoard</div>
        <ul className="flex gap-6">
          <li>
            <a href="#hero" className="text-white/90 hover:text-bw-87 transition-colors px-4 py-2 font-medium">Home</a>
          </li>
          <li>
            <a href="#howItWorks" className="text-white/90 hover:text-bw-87 transition-colors px-4 py-2 font-medium">How It Works</a>
          </li>
          <li>
            <a href="#contact" className="text-white/90 hover:text-bw-87 transition-colors px-4 py-2 font-medium">Contact</a>
          </li>
          <li>
            <Link to="/role">
              <Button variant="outline" size="md">Sign Up</Button>
            </Link>
          </li>
        </ul>
      </nav>

      <section
        id="hero"
        ref={heroRef}
        className="relative h-screen flex flex-col justify-center items-center text-center px-[5%] overflow-hidden"
        style={{ backgroundImage: `url(${StudyImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/80"></div>
        <div className="relative z-10 max-w-3xl">
          <h1
            className={`text-4xl md:text-6xl font-comic font-bold mb-6 text-white transition-all duration-700 animate-fade-up ${heroInView ? '' : 'opacity-0 translate-y-3'}`}
          >
            Transform Learning with BrightBoard
          </h1>
          <h2
            className={`text-base md:text-xl text-bw-75 max-w-2xl mx-auto mb-8 transition-all duration-700 animate-fade-up ${heroInView ? '' : 'opacity-0 translate-y-3'}`}
            style={{ transitionDelay: '200ms' }}
          >
            Empowering students, tutors, and institutes with next-gen digital tools.
          </h2>
          <Link to='/role' style={{ transitionDelay: '400ms' }}>
            <Button variant="primary" size="md" className={`transition-all duration-700 animate-fade-up ${heroInView ? '' : 'opacity-0 translate-y-3'}`}>
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      <section
        id="stats"
        ref={statsRef}
        className={`relative px-[5%] py-28 bg-black transition-all duration-700 ${statsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      >
        <h2 className="text-3xl md:text-4xl font-comic font-bold text-center mb-16">Our Success</h2>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,rgba(0,0,0,0)_70%)]"></div>
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <Card key={index} className={`text-center p-6 transition transform ${statsInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} hover:-translate-y-2`}>
              <div className="text-4xl font-comic font-bold mb-2">{stat.value}</div>
              <div className="text-bw-75 font-medium">{stat.label}</div>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="howItWorks"
        ref={howRef}
        className={`relative px-[5%] py-28 bg-black transition-all duration-700 ${howInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      >
        <h2 className="text-3xl md:text-4xl font-comic font-bold text-center mb-16">How It Works</h2>
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <Card key={index} className={`text-center p-6 transition transform ${howInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} hover:-translate-y-2`}>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-bw-12 text-white flex items-center justify-center text-xl font-comic font-bold">{index + 1}</div>
              <h3 className="text-white text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-bw-75 text-sm">{step.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="contact"
        ref={contactRef}
        className={`relative px-[5%] py-28 bg-black overflow-hidden transition-all duration-700 ${contactInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      >
        <h2 className="text-3xl md:text-4xl font-comic font-bold text-center mb-10">Need Support?</h2>
        <form className="relative z-10 max-w-xl mx-auto flex flex-col gap-6 bg-bw-12 p-10 rounded-xl border border-bw-37">
          <input type="text" placeholder="Your Name" required className="w-full px-6 py-4 bg-black border border-bw-37 rounded-md text-white placeholder:text-bw-62 focus:outline-none focus:border-bw-75 focus:ring-2 focus:ring-bw-75/30" />
          <input type="email" placeholder="Email Address" required className="w-full px-6 py-4 bg-black border border-bw-37 rounded-md text-white placeholder:text-bw-62 focus:outline-none focus:border-bw-75 focus:ring-2 focus:ring-bw-75/30" />
          <input type="tel" placeholder="Mobile Number" className="w-full px-6 py-4 bg-black border border-bw-37 rounded-md text-white placeholder:text-bw-62 focus:outline-none focus:border-bw-75 focus:ring-2 focus:ring-bw-75/30" />
          <textarea placeholder="Your Query" required className="w-full px-6 py-4 bg-black border border-bw-37 rounded-md text-white placeholder:text-bw-62 focus:outline-none focus:border-bw-75 focus:ring-2 focus:ring-bw-75/30 min-h-[150px] resize-y"></textarea>
          <Button variant="primary" size="md">Send Message</Button>
        </form>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.06) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(255,255,255,0.06) 0%, transparent 20%)'
          }}
        ></div>
      </section>

      <footer
        id="footer"
        ref={footerRef}
        className={`relative px-[5%] pt-20 pb-8 bg-black transition-all duration-700 ${footerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      >
        <div className="max-w-5xl mx-auto flex flex-wrap justify-between">
          <div className="mb-10 min-w-[250px] flex-1 px-6">
            <h3 className="text-white mb-6 text-lg font-semibold">About BrightBoard</h3>
            <p className="text-bw-75 leading-7">
              BrightBoard simplifies online learning with innovative tools for
              students, tutors, and institutes.
            </p>
          </div>

          <div className="mb-10 min-w-[250px] flex-1 px-6">
            <h3 className="text-white mb-6 text-lg font-semibold">Quick Links</h3>
            <ul className="list-none">
              <li className="mb-2"><a className="text-bw-75 hover:text-bw-100 transition-colors" href="#hero">Home</a></li>
              <li className="mb-2"><a className="text-bw-75 hover:text-bw-100 transition-colors" href="#howItWorks">How It Works</a></li>
              <li className="mb-2"><a className="text-bw-75 hover:text-bw-100 transition-colors" href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="mb-10 min-w-[250px] flex-1 px-6">
            <h3 className="text-white mb-6 text-lg font-semibold">Contact Us</h3>
            <p className="text-bw-75 mb-2"><strong>Email:</strong> <a className="text-bw-75 hover:text-bw-100 transition-colors" href="mailto:brightboard@gmail.com">brightboard@gmail.com</a></p>
            <p className="text-bw-75"><strong>Phone:</strong> <a className="text-bw-75 hover:text-bw-100 transition-colors" href="tel:9265172639">9265172639</a></p>
            <div className="flex gap-4 mt-6">
              <a href="#" aria-label="Facebook" className="flex items-center justify-center w-10 h-10 rounded-full bg-bw-12 text-bw-75 border border-bw-37 transition hover:bg-bw-25 hover:text-white hover:-translate-y-1">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="flex items-center justify-center w-10 h-10 rounded-full bg-bw-12 text-bw-75 border border-bw-37 transition hover:bg-bw-25 hover:text-white hover:-translate-y-1">
                <Twitter size={20} />
              </a>
              <a href="#" aria-label="LinkedIn" className="flex items-center justify-center w-10 h-10 rounded-full bg-bw-12 text-bw-75 border border-bw-37 transition hover:bg-bw-25 hover:text-white hover:-translate-y-1">
                <Linkedin size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="flex items-center justify-center w-10 h-10 rounded-full bg-bw-12 text-bw-75 border border-bw-37 transition hover:bg-bw-25 hover:text-white hover:-translate-y-1">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="GitHub" className="flex items-center justify-center w-10 h-10 rounded-full bg-bw-12 text-bw-75 border border-bw-37 transition hover:bg-bw-25 hover:text-white hover:-translate-y-1">
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-bw-12 text-bw-62 text-sm">
          <p>© {new Date().getFullYear()} BrightBoard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;