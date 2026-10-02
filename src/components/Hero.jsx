import Downloader from './Downloader';
import { Download, ShieldCheck, Zap, Star } from 'lucide-react';
import { Particles, BlurText, GradientText, ShinyText, StarBorder } from './reactbits';

export default function Hero() {
    return (
        <section className="hero-section redesign-check">
            {/* Real React Bits Particles Background */}
            <div className="hero-particles-bg">
                <Particles
                    particleCount={120}
                    particleSpread={12}
                    speed={0.08}
                    particleColors={['#FF1A43', '#FF4D6D', '#ff6b8b', '#ffffff']}
                    alphaParticles={true}
                    particleBaseSize={80}
                    sizeRandomness={1.2}
                    moveParticlesOnHover={true}
                    particleHoverFactor={0.5}
                    cameraDistance={22}
                />
            </div>

            {/* Ambient glow orbs */}
            <div className="hero-glow-top" />
            <div className="hero-glow-left" />
            <div className="hero-glow-right" />

            <div className="hero-content">
                {/* Badge */}
                <div className="hero-badge">
                    <Star className="hero-badge-icon" />
                    <ShinyText
                        text="100% Free · No Sign-Up · Zero Storage"
                        speed={3}
                        color="#9ca3af"
                        shineColor="#ffffff"
                    />
                </div>

                {/* Headline using real BlurText */}
                <h1 className="hero-headline">
                    <BlurText
                        text="Download YouTube Videos"
                        delay={60}
                        className="hero-headline-line"
                        direction="top"
                        stepDuration={0.3}
                    />
                    <GradientText
                        colors={['#FF1A43', '#FF6B8B', '#F97316', '#FF1A43']}
                        animationSpeed={6}
                        className="hero-headline-gradient"
                    >
                        in Seconds
                    </GradientText>
                </h1>

                {/* Subtitle */}
                <p className="hero-subtitle">
                    Extract crisp <strong>MP4 videos</strong> and high-bitrate <strong>MP3 audio</strong> directly
                    to your device. No ads, no sign-up, no files stored on our server.
                </p>

                {/* Quick stats */}
                <div className="hero-stats">
                    <div className="hero-stat">
                        <Zap className="hero-stat-icon amber" />
                        <span>Direct CDN Stream</span>
                    </div>
                    <div className="hero-stat-divider" />
                    <div className="hero-stat">
                        <ShieldCheck className="hero-stat-icon green" />
                        <span>Zero Files Stored</span>
                    </div>
                    <div className="hero-stat-divider" />
                    <div className="hero-stat">
                        <Download className="hero-stat-icon blue" />
                        <span>4K · 1080p · 720p · MP3</span>
                    </div>
                </div>

                {/* Downloader */}
                <div className="hero-downloader-wrap">
                    <Downloader />
                </div>

                {/* Star border CTA hint */}
                <div className="hero-cta-hint">
                    <StarBorder
                        as="div"
                        color="#FF1A43"
                        speed="4s"
                        backgroundColor="#0d0d0d"
                        textColor="#9ca3af"
                        borderColor="#1f1f1f"
                        className="hero-star-badge"
                    >
                        ✦ Trusted by thousands of users worldwide
                    </StarBorder>
                </div>
            </div>
        </section>
    );
}
