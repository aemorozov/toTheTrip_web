import styles from "./HeroBlock.module.css";

export function HeroBlock() {
  return (
    <section className={styles.heroBlock}>
      <div className={styles.leftBlock}>
        <h1>Самые дешёвые авиабилеты из твоего города</h1>

        <p className={styles.heroDescription}>
          <strong>toTheTrip</strong> - сервис по подбору самых дешевых
          авиабилетов. Узнайте без сложного поиска, куда можно улететь из вашего
          города <strong>дешевле всего</strong>.
        </p>

        <p className={styles.heroDescription}>
          Мы собираем самые дешёвые авиабилеты, найденные другими пользовтелями,
          из разных городов по всем направлениям и датам.
        </p>
      </div>

      <div className={styles.heroForm}>
        <label htmlFor="city" className={styles.heroLabel}>
          Хочу билеты из
        </label>
        <input
          id="city"
          type="text"
          placeholder="Bucharest"
          className={styles.heroInput}
        />
        <button className={styles.searchButton}>Смотреть авиабилеты</button>
      </div>
    </section>
  );
}
