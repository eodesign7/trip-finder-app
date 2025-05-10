import "./App.css";
import TripForm from "@/components/TripForm";

function App() {
  return (
    <main className="min-h-screen p-0 m-0">
      {/* Hero image */}
      <div className="absolute top-0 left-0 w-full h-[528px] z-0">
        <img
          src="hero_header.jpg"
          alt="hero_header"
          className="w-full h-full object-cover object-top"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center pt-[180px] ">
        <h1 className="text-6xl md:text-[8rem] font-extrabold mb-6 text-white drop-shadow-lg">
          <span className="text-[var(--omio-red)]">.</span>Trips
        </h1>
        <div className="w-full flex justify-center">
          
          <TripForm />
        </div>
      </div>
    </main>
  );
}

export default App;
