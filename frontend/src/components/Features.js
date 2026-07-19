import {
  FaQrcode,
  FaCreditCard,
  FaShieldAlt,
  FaBell,
  FaGraduationCap
} from "react-icons/fa";

function Features() {
  const features = [
    {
      icon: <FaQrcode />,
      title: "QR Verification",
      desc: "Secure QR based pass validation."
    },
    
    {
      icon: <FaCreditCard />,
      title: "Online Payment",
      desc: "Fast and secure payments."
    },
    {
      icon: <FaShieldAlt />,
      title: "Safety",
      desc: "Emergency safety features."
    },
    {
      icon: <FaBell />,
      title: "Notifications",
      desc: "Get alerts and updates."
    },
    {
      icon: <FaGraduationCap />,
      title: "Student Pass",
      desc: "Special student concessions."
    }
  ];

  return (
    <section id="features" className="features-section">
      <h2>Everything you need to ride smarter</h2>
      <p>A complete platform for students, commuters, women travelers, operators and transport authorities.</p>
      

      <div className="features-grid">
        {features.map((item, index) => (
          <div className="feature-card" key={index}>
            <div className="feature-icon">
              {item.icon}
            </div>

            <h3>{item.title}</h3>

            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;