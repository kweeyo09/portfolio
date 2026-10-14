export default function CopyrightNotice() {
  return (
    <p
      style={{
        margin: 0,
        padding: '48px 24px max(40px, env(safe-area-inset-bottom))',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.4)',
        fontFamily: "'Barlow', sans-serif",
        fontSize: '0.72rem',
        fontWeight: 300,
        letterSpacing: '0.12em',
      }}
    >
      © {new Date().getFullYear()} KIXIZZ STUDIO · All work shown is protected by copyright and may not be reproduced without permission.
    </p>
  );
}
