import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import HowItWorks from "../components/landing/HowItWorks";
import Footer from "../components/landing/Footer";

function Home() {
  return (
    <div className="min-h-screen">

      <Navbar />

      <main>
        <Hero />

        <HowItWorks />
      </main>

      <Footer />

    </div>
  );
}

export default Home;