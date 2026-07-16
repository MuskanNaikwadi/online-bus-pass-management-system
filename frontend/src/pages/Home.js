import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Features from "../components/Features";
import Safety from "../components/Safety";
import Impact from "../components/Impact";
import Footer from "../components/Footer";


function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Safety />
      <Impact />

      {/* AI Assistant Button */}
      <div style={{ textAlign: "center", margin: "30px 0" }}>
       
      </div>

      <Footer />
    </>
  );
}

export default Home;