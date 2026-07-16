import busImage from "../assets/hero-bus.png";
import { Link } from "react-router-dom";
console.log(busImage);

function Hero() {
    return (
        <section className="hero">
            <div className="hero-left">
                <h1>
                    Travel Smarter,
                    <br />
                    Faster and Safer
                </h1>

                <p>
                    Experience the future of public transportation with
                    digital bus passes, real-time tracking, and enhanced
                    safety features designed for modern commuters.
                </p>

                <div className="hero-buttons">
                    <Link to="/register">
                        <button>Get Started →</button>
                    </Link>
                    <a href="#features">
                        <button>Explore Features</button>
                    </a>
                </div>
            </div>

            <div className="hero-right">
                <img src={busImage} alt="Bus" className="hero-bus" />
            </div>


        </section>
    );
}

export default Hero;