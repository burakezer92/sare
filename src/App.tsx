import { useEffect, useState } from "react";
import "./App.css";

import MemoryBook from "./components/MemoryBook";
import ProposalGate from "./components/ProposalGate";
import SakuraRain from "./components/SakuraRain";

import { getProposal, getWishes } from "./services/api";
import type { Proposal, Wish } from "./types";

type LoadingState = "loading" | "success" | "error";
function App() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [proposal, setProposal] = useState<Proposal | null>(null);

  const [status, setStatus] = useState<LoadingState>("loading");

  const [errorMessage, setErrorMessage] = useState("");

  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setStatus("loading");
        setErrorMessage("");

        const [wishesResult, proposalResult] = await Promise.all([
          getWishes(),
          getProposal(),
        ]);

        setWishes(wishesResult);
        setProposal(proposalResult);
        setStatus("success");
      } catch (error) {
        setStatus("error");

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Bilinmeyen bir hata oluştu.",
        );
      }
    }

    void loadInitialData();
  }, []);

  useEffect(() => {
    if (!showCelebration) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowCelebration(false);
    }, 8000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showCelebration]);

  function handleProposalAccepted(updatedProposal: Proposal) {
    setProposal(updatedProposal);
    setShowCelebration(true);
  }

  function handleWishCreated(newWish: Wish) {
    setWishes((currentWishes) => [newWish, ...currentWishes]);
  }

  return (
    <main className="app">
      <SakuraRain celebrate={showCelebration} />

      <div className="page-container">
        <header className="hero">
          <h1>Birlikte yazacagımız en güzel hikâye</h1>
        </header>

        {status === "loading" && (
          <section className="status-card">
            <p>Hikâyemiz hazırlanıyor...</p>
          </section>
        )}

        {status === "error" && (
          <section className="status-card error-message">
            <strong>Bağlantı kurulamadı</strong>
            <p>{errorMessage}</p>
          </section>
        )}

        {status === "success" && (
          <>
            <ProposalGate
              proposal={proposal}
              onAccepted={handleProposalAccepted}
            />

            <MemoryBook wishes={wishes} onWishCreated={handleWishCreated} />

            <footer className="page-footer">
              <h1>Seninle baslayan her gün, hayatımın en güzel hikâyesi.</h1>
              <h1>Bugün, yarın ve daima...</h1>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}

export default App;
