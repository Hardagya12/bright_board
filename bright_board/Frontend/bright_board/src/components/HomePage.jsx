import React, { useState, useEffect } from "react";
import { FaFacebook, FaTwitter, FaLinkedin ,FaInstagram ,FaGithub } from "react-icons/fa";
import { Link } from "react-router-dom"; // Added Link import
import "./HomePage.css";

const HomePage = () => {
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
        <div className="logo" style={{ width: 'auto' }}>BrightBoard</div>
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
            <Link to="/role" className="nav-link"> {/* Changed to Link */}
              Sign Up
            </Link>
          </li>
        </ul>
      </nav>

      <section id="hero" className={`hero ${isVisible.hero ? "visible" : ""}`}>
  <div className="hero-content">
    <h1 className="hero-title">
      Transform Learning with BrightBoard
    </h1>
    <h2 className="hero-subtitle">
      Empowering students, tutors, and institutes with **next-gen digital tools**.
    </h2>
    <Link to="/role" className="cta-button"> {/* Changed to Link */}
      Get Started Now
    </Link>
  </div>
</section>


      <section
        id="stats"
        className={`stats ${isVisible.stats ? "visible" : ""}`}
      >
        <h2>Our Success</h2>
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="howItWorks"
        className={`how-it-works ${isVisible.howItWorks ? "visible" : ""}`}
      >
        <h2>How It Works</h2>
        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step-item">
              <div className="step-number">{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section
  id="contact"
  className={`contact ${isVisible.contact ? "visible" : ""}`}
>
  <h2>Need Support?</h2>
  <form className="contact-form">
    <input type="text" placeholder="Your Name" required className="dark-input" />
    <input type="email" placeholder="Email Address" required className="dark-input" />
    <input type="tel" placeholder="Mobile Number" className="dark-input" />
    <textarea placeholder="Your Query" required className="dark-input"></textarea>
    <button type="submit" className="submit-button">
      Send Message
    </button>
  </form>
  <div
    className="geometric-bg"
    style={{
      transform: `translate(${mousePosition.x / 50}px, ${mousePosition.y / 50}px)`,
    }}
  ></div>
</section>

      <footer
        id="footer"
        className={`footer ${isVisible.footer ? "visible" : ""}`}
      >
        <div className="footer-content">
          {/* About Section */}
          <div className="footer-section">
            <h3>About BrightBoard</h3>
            <p>
              BrightBoard simplifies online learning with innovative tools for
              students, tutors, and institutes.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
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

          {/* Contact Section */}
          <div className="footer-section">
            <h3>Contact Us</h3>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:info@brightboard.com">brightboard@gmail.com</a>
            </p>
            <p>
              <strong>Phone:</strong>{" "}
              <a href="telephone:9265172639">9265172639</a>
            </p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="#" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
              <a href="#" aria-label="Instagram">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} BrightBoard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;