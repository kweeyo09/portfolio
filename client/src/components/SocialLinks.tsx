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
      <a href="https://x.com/kixizz_" aria-label="KIXIZZ on X" target="_blank" rel="noopener noreferrer">
        <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
    </nav>
  );
}
