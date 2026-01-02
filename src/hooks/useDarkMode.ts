"use client";

import { useState, useEffect } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 環境光センサーのサポート確認
    const windowWithSensor = window as typeof window & {
      AmbientLightSensor?: new () => {
        illuminance: number;
        addEventListener: (type: string, listener: () => void) => void;
        start: () => void;
      };
    };

    if (windowWithSensor.AmbientLightSensor) {
      setIsSupported(true);
      
      try {
        const sensor = new windowWithSensor.AmbientLightSensor!();
        
        sensor.addEventListener("reading", () => {
          // 照度が低い（暗い）場合はダークモード、高い（明るい）場合はライトモード
          // 閾値は調整可能（単位: lux）
          const threshold = 50; // 50 lux以下でダークモード
          setIsDark(sensor.illuminance < threshold);
        });

        sensor.start();
      } catch (error) {
        console.warn("AmbientLightSensor not available:", error);
        // フォールバック: prefers-color-schemeを使用
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
        setIsDark(prefersDark.matches);
        
        prefersDark.addEventListener("change", (e) => {
          setIsDark(e.matches);
        });
      }
    } else {
      // 環境光センサーがサポートされていない場合、prefers-color-schemeを使用
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDark(prefersDark.matches);
      
      prefersDark.addEventListener("change", (e) => {
        setIsDark(e.matches);
      });
    }
  }, []);

  useEffect(() => {
    // ダークモードの適用
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return { isDark, isSupported };
}

