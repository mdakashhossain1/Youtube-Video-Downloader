import { useRef, useState } from 'react';

/**
 * Magnet from React Bits (https://reactbits.dev/animations/magnet)
 * Attracts elements smoothly toward the cursor on hover.
 */
export default function Magnet({
    children,
    padding = 60,
    magnetStrength = 0.22,
    active = true,
    className = '',
}) {
    const ref = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        if (!ref.current || !active) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const distX = e.clientX - centerX;
        const distY = e.clientY - centerY;

        if (Math.abs(distX) < width / 2 + padding && Math.abs(distY) < height / 2 + padding) {
            setPosition({ x: distX * magnetStrength, y: distY * magnetStrength });
        } else {
            setPosition({ x: 0, y: 0 });
        }
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`inline-block transition-transform duration-200 ease-out ${className}`}
            style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            }}
        >
            {children}
        </div>
    );
}
