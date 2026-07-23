import { useState, type FormEvent } from "react";
import ring from "../assets/ring.png";
import { acceptProposal } from "../services/api";
import type { Proposal } from "../types";
import ProposalVideo from "./ProposalVideo";

interface ProposalGateProps {
  proposal: Proposal | null;
  onAccepted: (proposal: Proposal) => void;
}

export default function ProposalGate({
  proposal,
  onAccepted,
}: ProposalGateProps) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const proposalPassword = import.meta.env.VITE_PROPOSAL_PASSWORD?.trim();

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const enteredPassword = password.trim();

    if (!enteredPassword) {
      setErrorMessage("Önce sana verilen sifreyi yazmalısın.");
      return;
    }

    if (!proposalPassword) {
      setErrorMessage(
        "Teklif sifresi ayarlanmamıs. .env dosyasını kontrol et.",
      );
      return;
    }

    if (enteredPassword !== proposalPassword) {
      setErrorMessage("Bu sifre kalbinin anahtarına uymadı");
      return;
    }

    setIsUnlocked(true);
    setPassword("");
  }

  async function handleAccept() {
    if (!proposal) {
      setErrorMessage(
        "Teklif kaydı bulunamadı. MockAPI proposal kaydını kontrol et.",
      );
      return;
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setErrorMessage(
        "Teklifi kabul etmeden önce Burak'a küçük bir not bırakmalısın",
      );
      return;
    }

    if (trimmedMessage.length < 3) {
      setErrorMessage("Mesajın en az 3 karakter olmalı.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const updatedProposal = await acceptProposal(proposal.id, {
        accepted: true,
        acceptedAt: new Date().toISOString(),
        answer: "Evet, seninle bir ömür!",
        brideMessage: trimmedMessage,
      });

      onAccepted(updatedProposal);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Teklif kabul edilirken bir hata olustu.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (proposal?.accepted) {
    return (
      <section className="proposal-card proposal-card--accepted">
        <div className="proposal-card__content">
          <img src={ring} alt="Yüzük" className="proposal-icon" />

          <ProposalVideo />

          <h2>Evet, birlikte bir ömür!</h2>

          <p className="proposal-description">
            Bu hikâyenin en güzel cevabı verildi. Şimdi sonsuza kadar sürecek
            bölümümüz başlıyor.
          </p>

          {proposal.brideMessage && (
            <blockquote className="bride-message">
              <p>“{proposal.brideMessage}”</p>
              <footer>Sare</footer>
            </blockquote>
          )}

          {proposal.acceptedAt && (
            <time className="accepted-date">
              {new Intl.DateTimeFormat("tr-TR", {
                dateStyle: "long",
                timeStyle: "short",
              }).format(new Date(proposal.acceptedAt))}
            </time>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="proposal-card">
      <div className="proposal-card__content">
        <h2>
          Bu küçük kapının ardında sana sormak istedigim çok özel bir soru saklı
        </h2>

        {!isUnlocked ? (
          <form
            className="proposal-password-form"
            onSubmit={handlePasswordSubmit}
          >
            <div className="proposal-password-row">
              <input
                id="proposal-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrorMessage("");
                }}
                autoComplete="off"
                disabled={isSubmitting}
              />

              <button type="submit" disabled={isSubmitting}>
                Kalbimi aç
              </button>
            </div>
          </form>
        ) : (
          <div className="proposal-question">
            <p>Benimle hayatının geri kalanını paylaşmak ister misin?</p>

            <div className="bride-message-field">
              <textarea
                id="bride-message"
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  setErrorMessage("");
                }}
                placeholder="Kalbinden geçenleri buraya yaz..."
                maxLength={500}
                rows={5}
                disabled={isSubmitting}
              />

              <span className="bride-message-counter">
                {message.length}/500
              </span>
            </div>

            <button
              type="button"
              className="accept-button"
              onClick={handleAccept}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Cevabın kaydediliyor..."
                : "Evet, kabul ediyorum 💍"}
            </button>
          </div>
        )}

        {errorMessage && (
          <p className="proposal-error" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    </section>
  );
}
