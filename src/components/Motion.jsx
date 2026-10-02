import { useReducedMotion } from 'motion/react';
import { Component } from 'react';
import Threads from './reactbits/Threads';
import BlurText from './reactbits/BlurText';
import DecryptedText from './reactbits/DecryptedText';

class VisualFallback extends Component {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    render() { return this.state.failed ? <div className="threads-fallback" /> : this.props.children; }
}

export function AmbientThreads({ compact = false }) {
    const reducedMotion = useReducedMotion();
    return (
        <div className={`ambient-threads ${compact ? 'ambient-compact' : ''}`} aria-hidden="true">
            {reducedMotion ? <div className="threads-fallback" /> : (
                <VisualFallback>
                    <Threads color={[0.65, 0.43, 0.95]} amplitude={1.8} distance={0.16} />
                </VisualFallback>
            )}
        </div>
    );
}

export function RevealText({ text, className = '' }) {
    const reducedMotion = useReducedMotion();
    return reducedMotion ? <span className={className}>{text}</span> : (
        <BlurText text={text} delay={65} direction="bottom" stepDuration={0.22} className={className} />
    );
}

export function Eyebrow({ children }) {
    const reducedMotion = useReducedMotion();
    return <div className="eyebrow"><span className="eyebrow-mark" />{reducedMotion ? children : (
        <DecryptedText text={children} animateOn="view" speed={35} maxIterations={7} characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" />
    )}</div>;
}
