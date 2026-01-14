import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [visibleLetters, setVisibleLetters] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  
  const welcomeText = "Welcome to ";
  const zippyText = "Zippy";

  useEffect(() => {
    // Animate "Zippy" letters one by one
    const letterInterval = setInterval(() => {
      setVisibleLetters((prev) => {
        if (prev >= zippyText.length) {
          clearInterval(letterInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 150);

    // Fade out after animation completes
    const fadeTimeout = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Complete after fade out
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearInterval(letterInterval);
      clearTimeout(fadeTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-primary transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center px-4">
        <h1 className="text-3xl md:text-4xl text-primary-foreground font-medium italic">
          {welcomeText}
          <span className="inline-block">
            {zippyText.split('').map((letter, index) => (
              <span
                key={index}
                className={`inline-block transition-all duration-300 ${
                  index < visibleLetters 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4'
                }`}
                style={{
                  transitionDelay: `${index * 50}ms`
                }}
              >
                {letter}
              </span>
            ))}
          </span>
        </h1>
      </div>
    </div>
  );
};

export default SplashScreen;
