import { Metadata } from "next";
import { HeroBlock } from "../components/HeroBlock/HeroBlock";
import { RandomFlightsBlock } from "../components/RandomFlightsBlock/RandomFlightsBlock";

export const metadata: Metadata = {
  title: "Cheapest flights in one click - ToTheTrip",
  description:
    "Cheapest flights from your city in one click. Compare cheap flights, discover top destinations from your city, and find the lowest airfare deals worldwide in seconds.",
};

export default function HomePage() {
  return (
    <>
      <main>
        <HeroBlock />
        <RandomFlightsBlock />

        {/* <section className="squareCardsBlock">
          <h2>Популярные направления в этом месяце</h2>
          <div className="squareCardsGrid">
            <div className="squareCard">
              <div className="imgPlaceholder">🏙️</div>
              <span>Москва</span>
            </div>
            <div className="squareCard">
              <div className="imgPlaceholder">🌉</div>
              <span>Санкт-Петербург</span>
            </div>
            <div className="squareCard">
              <div className="imgPlaceholder">🏰</div>
              <span>Казань</span>
            </div>
            <div className="squareCard">
              <div className="imgPlaceholder">🏖️</div>
              <span>Сочи</span>
            </div>
            <div className="squareCard">
              <div className="imgPlaceholder">🏔️</div>
              <span>Екатеринбург</span>
            </div>
            <div className="squareCard">
              <div className="imgPlaceholder">✈️</div>
              <span>Минск</span>
            </div>
          </div>
        </section>

        <section className="featuresBlock">
          <h2>Почему выбирают нас</h2>
          <div className="featuresGrid">
            <div className="featureCard">
              <h3>Быстрый поиск</h3>
              <p>Находите лучшие предложения за секунды.</p>
            </div>
            <div className="featureCard">
              <h3>Актуальные цены</h3>
              <p>Данные обновляются в реальном времени.</p>
            </div>
            <div className="featureCard">
              <h3>Простота бронирования</h3>
              <p>Бронируйте билеты прямо на сайте без сложностей.</p>
            </div>
            <div className="featureCard">
              <h3>Поддержка 24/7</h3>
              <p>Всегда готовы помочь с любым вопросом.</p>
            </div>
          </div>
        </section>

        <section className="popularDestinations">
          <h2>Популярные направления</h2>
          <div className="destinationsGrid">
            <div className="destinationCard">Москва</div>
            <div className="destinationCard">Санкт-Петербург</div>
            <div className="destinationCard">Казань</div>
            <div className="destinationCard">Сочи</div>
            <div className="destinationCard">Минск</div>
            <div className="destinationCard">Екатеринбург</div>
          </div>
        </section>

        <section className="ctaBlock">
          <h2>Начните искать билеты прямо сейчас</h2>
          <p>Введите город вылета и получите лучшие предложения мгновенно.</p>
          <button>Поиск билетов</button>
        </section> */}
      </main>
    </>
  );
}
