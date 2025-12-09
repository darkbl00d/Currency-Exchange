import { useState, useEffect } from "react";
import "./index.css";

const API_URL = "https://api.frankfurter.app/";

export default function App() {
  const [currencies, setCurrencies] = useState([]);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("PHP");
  const [amount, setAmount] = useState("1");
  const [result, setResult] = useState(null); // последний fetch (конвертированная сумма)
  const [ratePerOne, setRatePerOne] = useState(null); // за одну ед валюты
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function getCurrencies() {
      try {
        const res = await fetch(`${API_URL}latest`);
        if (!res.ok) throw new Error("Сетевой ответ был неудовлетворительным");
        const data = await res.json();
        setCurrencies(Object.keys(data.rates).sort());
      } catch (problem) {
        setError(`Ошибка: ${problem.message}`);
      } finally {
        setInitialLoading(false);
      }
    }
    getCurrencies();
  }, []);

  async function calcValue() {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Введите сумму больше 0");
      return;
    }

    try {
      setError("");
      setLoading(true);
      const res = await fetch(
        `${API_URL}latest?amount=${numericAmount}&from=${fromCurrency}&to=${toCurrency}`
      );
      if (!res.ok) throw new Error("Сетевой ответ был неудовлетворительным");
      const data = await res.json();
      const converted = data.rates[toCurrency];
      setResult(converted);
      setRatePerOne(converted / numericAmount);
    } catch (problem) {
      setError(`Ошибка: ${problem.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Используем если у нас есть ratePerOne для обновление результата без нового fetch
  const displayedResult = (() => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) return null;
    if (ratePerOne != null) return (ratePerOne * numericAmount).toFixed(4);
    if (result != null) return result;
    return null;
  })();

  return (
    <div className="wrapper fade-in">
      <h1 className="title">Currency Exchange</h1>

      <div className="card slide-up">
        {initialLoading ? (
          <p className="loading">Загрузка валют...</p>
        ) : (
          <>
            {error && <p className="error shake">{error}</p>}

            <div className="group">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
                placeholder="Amount"
                min="0"
              />
            </div>

            <div className="selectors">
              <select
                className="select"
                value={fromCurrency}
                onChange={(e) => {
                  setFromCurrency(e.target.value);
                  setRatePerOne(null);
                  setResult(null);
                }}
              >
                {currencies.map((cur) => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>

              <span className="arrow">→</span>

              <select
                className="select"
                value={toCurrency}
                onChange={(e) => {
                  setToCurrency(e.target.value);
                  setRatePerOne(null);
                  setResult(null);
                }}
              >
                {currencies.map((cur) => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
            </div>

            <button className="button" disabled={loading} onClick={calcValue}>
              {loading ? "Converting..." : "Convert"}
            </button>

            {displayedResult !== null && (
              <p className="result fade-in">
                {amount} {fromCurrency} = <strong>{displayedResult}</strong>{" "}
                {toCurrency}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
