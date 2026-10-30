import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

/**
 * EncryptedText
 * Aceternity UI component for progressive matrix-style encrypted text reveal.
 * Accessible, responsive, and performance-optimized.
 */
export const EncryptedText = ({
  text = "",
  revealDelayMs = 45,
  flipDelayMs = 30,
  charset = DEFAULT_CHARSET,
  className,
  encryptedClassName,
  revealedClassName,
  onComplete,
}) => {
  const [revealedCount, setRevealedCount] = useState(0);
  const [displayText, setDisplayText] = useState([]);
  const textRef = useRef(text);
  textRef.current = text;

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !text) {
      setRevealedCount(text ? text.length : 0);
      setDisplayText(text ? text.split("") : []);
      if (onComplete) onComplete();
      return;
    }

    setRevealedCount(0);
    const chars = text.split("");
    setDisplayText(chars.map((char) => (char === " " ? " " : getRandomChar(charset))));

    // Interval to scramble unrevealed characters
    const flipInterval = setInterval(() => {
      setDisplayText((prev) => {
        const currentTarget = textRef.current.split("");
        return currentTarget.map((targetChar, idx) => {
          if (targetChar === " ") return " ";
          if (idx < revealedCount) {
            return targetChar;
          }
          return getRandomChar(charset);
        });
      });
    }, flipDelayMs);

    // Interval to reveal characters sequentially
    const revealInterval = setInterval(() => {
      setRevealedCount((prev) => {
        const next = prev + 1;
        if (next >= textRef.current.length) {
          clearInterval(revealInterval);
          clearInterval(flipInterval);
          setDisplayText(textRef.current.split(""));
          if (onComplete) onComplete();
          return textRef.current.length;
        }
        return next;
      });
    }, revealDelayMs);

    return () => {
      clearInterval(flipInterval);
      clearInterval(revealInterval);
    };
  }, [text, revealDelayMs, flipDelayMs, charset]);

  return (
    <span
      className={cn("inline-block", className)}
      aria-label={text}
      role="text"
    >
      {displayText.map((char, index) => {
        const isRevealed = index < revealedCount;
        return (
          <span
            key={`char-${index}`}
            className={cn(
              isRevealed
                ? cn("transition-colors duration-150", revealedClassName)
                : cn("text-[#0066CC] opacity-75 font-mono select-none", encryptedClassName)
            )}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
};

const getRandomChar = (charset) => {
  const index = Math.floor(Math.random() * charset.length);
  return charset[index];
};

export default EncryptedText;

