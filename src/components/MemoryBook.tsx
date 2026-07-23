import { useState, type ChangeEvent, type FormEvent } from "react";
import { createWish } from "../services/api";
import type { Wish } from "../types";

interface MemoryBookProps {
  wishes: Wish[];
  onWishCreated: (wish: Wish) => void;
}

interface WishForm {
  name: string;
  message: string;
}

const initialForm: WishForm = {
  name: "",
  message: "",
};

export default function MemoryBook({ wishes, onWishCreated }: MemoryBookProps) {
  const [form, setForm] = useState<WishForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  }

  function validateForm(): string | null {
    const trimmedName = form.name.trim();
    const trimmedMessage = form.message.trim();

    if (trimmedName.length < 2) {
      return "isim en az 2 karakter olmalı.";
    }

    if (trimmedName.length > 40) {
      return "isim en fazla 40 karakter olabilir.";
    }

    if (trimmedMessage.length < 3) {
      return "iyi dilek en az 3 karakter olmalı.";
    }

    if (trimmedMessage.length > 240) {
      return "iyi dilek en fazla 240 karakter olabilir.";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const newWish = await createWish({
        name: form.name.trim(),
        message: form.message.trim(),
        createdAt: new Date().toISOString(),
        approved: true,
      });

      onWishCreated(newWish);
      setForm(initialForm);
      setSuccessMessage("Güzel dilegin anı defterimize eklendi 🌸");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Mesaj gönderilirken bir hata olustu.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="memory-book-section">
      <div className="section-heading">
        <h2>Birkaç güzel sözle bu güne ortak ol</h2>
      </div>

      <div className="memory-book-layout">
        <form className="wish-form" onSubmit={handleSubmit} noValidate>
          <div className="wish-form-header"></div>

          <div className="wish-form-field">
            <input
              id="wish-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Adınız"
              minLength={2}
              maxLength={40}
              autoComplete="name"
              disabled={isSubmitting}
            />

            <span className="character-counter">{form.name.length}/40</span>
          </div>

          <div className="wish-form-field">
            <textarea
              id="wish-message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Burak & Sare için birkaç güzel kelime..."
              rows={6}
              minLength={3}
              maxLength={240}
              disabled={isSubmitting}
            />

            <span className="character-counter">{form.message.length}/240</span>
          </div>

          <button
            type="submit"
            className="wish-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Dilegin ekleniyor..." : "Anı defterine ekle 🌸"}
          </button>

          {errorMessage && (
            <p className="wish-form-message wish-form-message--error">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="wish-form-message wish-form-message--success">
              {successMessage}
            </p>
          )}
        </form>
        <div className="section-heading">
          <h2>Güzel Dilekler</h2>
        </div>
        <div className="wish-list-container">
          {wishes.length === 0 ? (
            <div className="wish-empty-state">
              <h1>Anı defterimizin ilk mesajını sen doldurabilirsin.</h1>
            </div>
          ) : (
            <div className="wish-list">
              {wishes.map((wish) => (
                <article key={wish.id} className="wish-card">
                  <div className="wish-card-top">
                    <div className="wish-avatar ">
                      {wish.name.trim().charAt(0).toLocaleUpperCase("tr-TR")}
                    </div>

                    <div>
                      <h4 className="yazi">{wish.name}</h4>

                      <time dateTime={wish.createdAt}>
                        {new Intl.DateTimeFormat("tr-TR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(wish.createdAt))}
                      </time>
                    </div>
                  </div>

                  <p className="wish-message yazi">“{wish.message}”</p>

                  <span className="wish-decoration">🌸</span>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
