import React from "react";
import { Link } from "react-router-dom";

const Impact = () => {
  const impacts = [
    {
      icon: "🍃",
      title: "Less Paperwork",
      desc: "Fully digital applications, passes and receipts – zero paper.",
    },
    {
      icon: "🕒",
      title: "Saves Time",
      desc: "No queues. Apply and manage your bus pass digitally from anywhere.",
    },
    {
      icon: "🛡",
      title: "Improves Safety",
      desc: "Built-in women safety tools and live route monitoring.",
    },
    {
      icon: "❤",
      title: "Supports Students",
      desc: "Affordable concessions and verified college discounts.",
    },
  ];

  return (
    <section className="impact-section" id="impact">
      <h2 className="impact-heading">
        Real impact for cities and students
      </h2>

      <div className="impact-cards">
        {impacts.map((item, index) => (
          <div className="impact-card" key={index}>
            <div className="impact-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="cta-box">
        <h2>Ready to go paperless?</h2>

        <p>
          Join thousands of riders managing their passes
          the smart way.
        </p>

        <Link to="/register">
          <button className="cta-btn">
            Get Started Now →
          </button>
        </Link>
      </div>
    </section>
  );
};

export default Impact;