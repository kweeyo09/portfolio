import { Github, Instagram } from 'lucide-react';
import './SocialLinks.css';

export default function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <nav className={`social-links ${className}`} aria-label="Social profiles">
      <a href="https://www.instagram.com/kixizz_/" aria-label="KIXIZZ on Instagram" target="_blank" rel="noopener noreferrer">
        <Instagram size={19} strokeWidth={1.6} aria-hidden="true" />
      </a>
      <a href="https://github.com/kweeyo09" aria-label="Kiki on GitHub" target="_blank" rel="noopener noreferrer">
        <Github size={19} strokeWidth={1.6} aria-hidden="true" />
      </a>
    </nav>
  );
}
