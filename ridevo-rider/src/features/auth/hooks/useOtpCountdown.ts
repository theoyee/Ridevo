import { useEffect, useState } from "react";
import { AppState } from "react-native";

function getRemainingSeconds(timestamp?: string): number {
  if (!timestamp) return 0;

  const deadline = Date.parse(timestamp);

  if (!Number.isFinite(deadline)) return 0;

  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
}

export function useOtpCountdown(timestamp?: string) {
  const [seconds, setSeconds] = useState(() => getRemainingSeconds(timestamp));

  useEffect(() => {
    function update() {
      setSeconds(getRemainingSeconds(timestamp));
    }

    update();

    const interval = setInterval(update, 1000);

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        update();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [timestamp]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formatted = `${String(minutes).padStart(
    2,
    "0",
  )}:${String(remainingSeconds).padStart(2, "0")}`;

  return {
    seconds,
    formatted,
    isFinished: seconds === 0,
  };
}
