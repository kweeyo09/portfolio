import { Link } from 'wouter';

export default function PaperArt() {
  return <main style={{height:'100dvh',display:'flex',flexDirection:'column',background:'#f5f1e8'}}>
    <nav aria-label="Project navigation" style={{padding:'12px 20px',borderBottom:'1px solid #ded8cc',fontSize:13,color:'#514b43'}}>
      <Link href="/cool-things">← Cool things I've been working on</Link>
    </nav>
    <iframe src="/paper-art-studio/index.html" title="Paper in Bloom — Chinese paper-cutting studio"
      style={{width:'100%',flex:1,minHeight:0,border:0}} />
  </main>;
}
