import Navbar from "../components/navbar";
import HeroSection from "../components/hero"; // Asegúrate de que el archivo se llame hero-section.tsx o hero.tsx según lo hayas guardado
import Footer from "../components/footer";

export default function Page() {

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
      </main>
      <Footer />



    </>
  );
}