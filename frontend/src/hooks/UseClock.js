import { useState, useEffect } from "react";

export function useClock() {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString("es-MX", { hour12: false });
  });

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString("es-MX", { hour12: false }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}