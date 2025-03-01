import React, { useState, useEffect } from 'react';
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
import './HomePage.css';
import { Link } from 'react-router-dom';
function HomePage() {
  const [isVisible, setIsVisible] = useState({
    hero: false,
    stats: false,
    howItWorks: false,
    contact: false,
    footer: false,
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "stats", "howItWorks", "contact", "footer"];
      const visibleSections = {};

      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          visibleSections[section] =
            rect.top < window.innerHeight && rect.bottom >= 0;
        }
      });

      setIsVisible(visibleSections);
    };

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

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
    <div className="landing-page">
      <nav className="navbar">
        <div className="homepagelogo">BrightBoard</div>
        <ul className="nav-links">
          <li>
            <a href="#hero" className="nav-link">
              Home
            </a>
          </li>
          <li>
            <a href="#howItWorks" className="nav-link">
              How It Works
            </a>
          </li>
          <li>
            <a href="#contact" className="nav-link">
              Contact
            </a>
          </li>
          <li>
            <Link to="/role" className="nav-link sign-up">
              Sign Up
            </Link>
          </li>
        </ul>
      </nav>

      <section id="hero" className={`hero ${isVisible.hero ? "visible" : ""}`}>
        <div className="hero-content">
          <h1 className="hero-title">Transform Learning with BrightBoard</h1>
          <h2 className="hero-subtitle">
            Empowering students, tutors, and institutes with next-gen digital tools.
          </h2>
          <Link to='/role' className="cta-button">
            Get Started Now
          </Link>
        </div>
        <div className="hero-overlay"></div>
      </section>

      <section id="stats" className={`stats ${isVisible.stats ? "visible" : ""}`}>
        <h2 className="section-title">Our Success</h2>
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="howItWorks" className={`how-it-works ${isVisible.howItWorks ? "visible" : ""}`}>
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step-item">
              <div className="step-number">{index + 1}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className={`contact ${isVisible.contact ? "visible" : ""}`}>
        <h2 className="section-title">Need Support?</h2>
        <form className="contact-form">
          <input type="text" placeholder="Your Name" required className="form-input" />
          <input type="email" placeholder="Email Address" required className="form-input" />
          <input type="tel" placeholder="Mobile Number" className="form-input" />
          <textarea placeholder="Your Query" required className="form-textarea"></textarea>
          <button type="submit" className="submit-button">
            Send Message
          </button>
        </form>
        <div 
          className="geometric-bg" 
          style={{ 
            transform: `translate(${mousePosition.x / 50}px, ${mousePosition.y / 50}px)` 
          }}
        ></div>
      </section>

      <footer id="footer" className={`footer ${isVisible.footer ? "visible" : ""}`}>
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-heading">About BrightBoard</h3>
            <p className="footer-text">
              BrightBoard simplifies online learning with innovative tools for
              students, tutors, and institutes.
            </p>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <a href="#hero">Home</a>
              </li>
              <li>
                <a href="#howItWorks">How It Works</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Contact Us</h3>
            <p className="footer-text">
              <strong>Email:</strong>{" "}
              <a href="mailto:brightboard@gmail.com">brightboard@gmail.com</a>
            </p>
            <p className="footer-text">
              <strong>Phone:</strong>{" "}
              <a href="tel:9265172639">9265172639</a>
            </p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="#" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="GitHub">
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} BrightBoard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;