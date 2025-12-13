"use client";

import { useEffect, useRef } from "react";

export function EyesIcon({ className = "" }: { className?: string }) {
  const leftEyeRef = useRef<SVGGElement>(null);
  const rightEyeRef = useRef<SVGGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!leftEyeRef.current || !rightEyeRef.current || !containerRef.current) {
        return;
      }

      const container = containerRef.current.getBoundingClientRect();

      // Calculate angle between cursor and each eye
      const leftEyeX = container.left + 9; // Position of left eye (slightly adjusted)
      const leftEyeY = container.top + 8;
      const rightEyeX = container.left + 21; // Position of right eye (moved slightly farther)
      const rightEyeY = container.top + 8;

      // Calculate angle for left eye
      const leftAngle = Math.atan2(e.clientY - leftEyeY, e.clientX - leftEyeX);

      // Calculate angle for right eye
      const rightAngle = Math.atan2(
        e.clientY - rightEyeY,
        e.clientX - rightEyeX
      );

      // Calculate eye position with more natural movement constraints
      // Eyes can look further to the sides than up/down
      const maxHorizontalMovement = 2.5;
      const maxVerticalMovement = 1.8;

      // Apply different constraints for horizontal and vertical movement
      const leftEyeMoveX =
        Math.cos(leftAngle) *
        maxHorizontalMovement *
        Math.min(1, Math.abs(Math.cos(leftAngle)) * 1.5);
      const leftEyeMoveY =
        Math.sin(leftAngle) *
        maxVerticalMovement *
        Math.min(1, Math.abs(Math.sin(leftAngle)) * 1.5);

      const rightEyeMoveX =
        Math.cos(rightAngle) *
        maxHorizontalMovement *
        Math.min(1, Math.abs(Math.cos(rightAngle)) * 1.5);
      const rightEyeMoveY =
        Math.sin(rightAngle) *
        maxVerticalMovement *
        Math.min(1, Math.abs(Math.sin(rightAngle)) * 1.5);

      // Apply the transformation to the entire eye group
      leftEyeRef.current.setAttribute('transform', `translate(${leftEyeMoveX}, ${leftEyeMoveY})`);
      rightEyeRef.current.setAttribute('transform', `translate(${rightEyeMoveX}, ${rightEyeMoveY})`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-14 h-8 ${className}`}>
      {/* Left Eye */}
      <div className="absolute left-0 top-0 w-8 h-8 flex items-center justify-center">
        <svg
          width="32"
          height="32"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Eyelid - stays in place */}
          <path
            d="M10 20C10 14.0294 14.0294 10 20 10C25.9706 10 30 14.0294 30 20C30 25.9706 25.9706 30 20 30C14.0294 30 10 25.9706 10 20Z"
            fill="currentColor"
            className="text-foreground/10 dark:text-foreground/10"
          />

          {/* Eye group that will move together */}
          <g ref={leftEyeRef} transform={`translate(0, 0)`}>
            {/* Eye shape - more almond shaped */}
            <path
              d="M20 28C24.4183 28 28 24.4183 28 20C28 15.5817 24.4183 12 20 12C15.5817 12 12 15.5817 12 20C12 24.4183 15.5817 28 20 28Z"
              fill="white"
              className="dark:fill-white dark:stroke-gray-300"
              stroke="currentColor"
              strokeWidth="0.5"
            />

            {/* Iris with gradient */}
            <defs>
              <radialGradient
                id="irisGradient"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(20 18) rotate(90) scale(6 5.5)"
              >
                <stop
                  offset="0%"
                  stopColor="currentColor"
                  className="text-foreground/90 dark:text-gray-900"
                />
                <stop
                  offset="100%"
                  stopColor="currentColor"
                  className="text-foreground/70 dark:text-gray-800"
                />
              </radialGradient>
            </defs>
            <ellipse
              cx="20"
              cy="18"
              rx="6"
              ry="5.5"
              fill="url(#irisGradient)"
            />

            {/* Pupil */}
            <circle
              cx="20"
              cy="18"
              r="3"
              fill="currentColor"
              className="transition-transform duration-150 ease-out text-foreground dark:text-gray-900"
            />

            {/* Eye shine - multiple for more realism */}
            <path
              d="M17 16C17 15.4477 17.4477 15 18 15C18.5523 15 19 15.4477 19 16C19 16.5523 18.5523 17 18 17C17.4477 17 17 16.5523 17 16Z"
              fill="white"
              className="opacity-90"
            />
            <path
              d="M16.5 14.5C16.5 14.2239 16.7239 14 17 14C17.2761 14 17.5 14.2239 17.5 14.5C17.5 14.7761 17.2761 15 17 15C16.7239 15 16.5 14.7761 16.5 14.5Z"
              fill="white"
              className="opacity-80"
            />
          </g>
        </svg>
      </div>

      {/* Right Eye - Same as left but mirrored */}
      <div className="absolute right-0 top-0 w-8 h-8 flex items-center justify-center">
        <svg
          width="32"
          height="32"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Eyelid - stays in place */}
          <path
            d="M10 20C10 14.0294 14.0294 10 20 10C25.9706 10 30 14.0294 30 20C30 25.9706 25.9706 30 20 30C14.0294 30 10 25.9706 10 20Z"
            fill="currentColor"
            className="text-foreground/10 dark:text-foreground/10"
          />

          {/* Eye group that will move together */}
          <g ref={rightEyeRef} transform={`translate(0, 0)`}>
            {/* Eye shape - more almond shaped */}
            <path
              d="M20 28C24.4183 28 28 24.4183 28 20C28 15.5817 24.4183 12 20 12C15.5817 12 12 15.5817 12 20C12 24.4183 15.5817 28 20 28Z"
              fill="white"
              className="dark:fill-white dark:stroke-gray-300"
              stroke="currentColor"
              strokeWidth="0.5"
            />

            {/* Iris with gradient */}
            <defs>
              <radialGradient
                id="irisGradientRight"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(20 18) rotate(90) scale(6 5.5)"
              >
                <stop
                  offset="0%"
                  stopColor="currentColor"
                  className="text-foreground/90 dark:text-gray-900"
                />
                <stop
                  offset="100%"
                  stopColor="currentColor"
                  className="text-foreground/70 dark:text-gray-800"
                />
              </radialGradient>
            </defs>
            <ellipse
              cx="20"
              cy="18"
              rx="6"
              ry="5.5"
              fill="url(#irisGradientRight)"
            />

            {/* Pupil */}
            <circle
              cx="20"
              cy="18"
              r="3"
              fill="currentColor"
              className="transition-transform duration-150 ease-out text-foreground dark:text-gray-900"
            />

            {/* Eye shine - multiple for more realism */}
            <path
              d="M17 16C17 15.4477 17.4477 15 18 15C18.5523 15 19 15.4477 19 16C19 16.5523 18.5523 17 18 17C17.4477 17 17 16.5523 17 16Z"
              fill="white"
              className="opacity-90"
            />
            <path
              d="M16.5 14.5C16.5 14.2239 16.7239 14 17 14C17.2761 14 17.5 14.2239 17.5 14.5C17.5 14.7761 17.2761 15 17 15C16.7239 15 16.5 14.7761 16.5 14.5Z"
              fill="white"
              className="opacity-80"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
