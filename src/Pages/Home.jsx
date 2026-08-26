import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

import CategoryCard from "../Components/CategoryCard";
import JobCard from "../Components/JobCard";

function Home() {

console.log("Supabase connected:", supabase);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    navigate(
      `/jobs?search=${encodeURIComponent(search)}&location=${encodeURIComponent(location)}`
    );
  };

  return (
    <div className="home">

      {/* HERO SECTION */}
      <section className="hero">

        <h1>
          Find your next <span>opportunity.</span>
        </h1>

        <p>
          Discover internships, remote jobs, and entry-level opportunities
          designed for emerging talent.
        </p>

        <div className="search-box">

          <input
            type="text"
            placeholder="Job title, skill or keyword"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <button onClick={handleSearch}>
            Search Jobs
          </button>

        </div>

      </section>

      {/* POPULAR CATEGORIES */}
      <section className="categories">

        <div className="section-heading">

          <h2>Popular Categories</h2>

          <Link to="/jobs">
            View all categories →
          </Link>

        </div>

        <div className="category-grid">

          <CategoryCard
            icon="💻"
            title="Development"
            jobs="1,245"
          />

          <CategoryCard
            icon=""
            title="Design"
            jobs="842"
          />

          <CategoryCard
            icon=""
            title="Marketing"
            jobs="634"
          />

          <CategoryCard
            icon=""
            title="Data Science"
            jobs="421"
          />

          <CategoryCard
            icon=""
            title="Customer Support"
            jobs="318"
          />

          <CategoryCard
            icon=""
            title="More"
            jobs="Explore"
          />

        </div>

      </section>

      {/* FEATURED JOBS */}
      <section className="featured-jobs">

        <div className="section-heading">

          <h2>Featured Jobs</h2>

          <Link to="/jobs">
            View all jobs →
          </Link>

        </div>

        <div className="jobs-grid">

          <JobCard
            id={1}
            logo="TZ"
            title="Junior Software Developer"
            company="TechZim Solutions"
            location="Remote"
            type="Full-time"
            salary="$400 - $700/month"
          />

          <JobCard
            id={2}
            logo="C"
            title="UI/UX Design Intern"
            company="CreativeHub"
            location="Harare"
            type="Internship"
            salary="$250/month"
          />

          <JobCard
            id={3}
            logo="M"
            title="Digital Marketing Assistant"
            company="MarketWave"
            location="Bulawayo"
            type="Full-time"
            salary="$300 - $500/month"
          />

        </div>

      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">

        <div className="section-heading">

          <h2>How SkillBridge Works</h2>

          <p>
            Getting your next opportunity is simple.
          </p>

        </div>

        <div className="steps">

          <div className="step">

            <div className="step-number">
              01
            </div>

            <h3>
              Create Your Profile
            </h3>

            <p>
              Build your professional profile, add your skills,
              upload your CV, and showcase your portfolio.
            </p>

          </div>

          <div className="step">

            <div className="step-number">
              02
            </div>

            <h3>
              Find Opportunities
            </h3>

            <p>
              Search for jobs, internships, freelance work,
              and remote opportunities that match your skills.
            </p>

          </div>

          <div className="step">

            <div className="step-number">
              03
            </div>

            <h3>
              Apply & Get Hired
            </h3>

            <p>
              Apply directly to companies and track your
              applications from your SkillBridge dashboard.
            </p>

          </div>

        </div>

      </section>

      {/* CALL TO ACTION */}
      <section className="cta">

        <div className="cta-content">

          <h2>
            Ready to find your next opportunity?
          </h2>

          <p>
            Create your profile and start discovering opportunities
            that match your skills.
          </p>

          <div className="cta-buttons">

            <button
              className="cta-primary"
              onClick={() => navigate("/jobs")}
            >
              Find a Job
            </button>

            <button
              className="cta-secondary"
              onClick={() => navigate("/signup")}
            >
              Create an Account
            </button>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="footer">

        <div className="footer-container">

          <div className="footer-brand">

            <h3>
              Skill<span>Bridge</span>
            </h3>

            <p>
              Connecting emerging talent with real opportunities.
            </p>

          </div>

          <div className="footer-column">

            <h4>
              For Job Seekers
            </h4>

            <Link to="/jobs">
              Find Jobs
            </Link>

            <Link to="/signup">
              Create Profile
            </Link>

            <Link to="/login">
              Login
            </Link>

          </div>

          <div className="footer-column">

            <h4>
              For Employers
            </h4>

            <Link to="/post-job">
              Post a Job
            </Link>

            <Link to="/pricing">
              Pricing
            </Link>

            <Link to="/employers">
              Employer Resources
            </Link>

          </div>

          <div className="footer-column">

            <h4>
              Company
            </h4>

            <Link to="/about">
              About Us
            </Link>

            <Link to="/contact">
              Contact
            </Link>

            <Link to="/privacy">
              Privacy
            </Link>

          </div>

        </div>

        <div className="footer-bottom">

          <p>
            copyright&copy; 2026 SkillBridge. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}

export default Home;