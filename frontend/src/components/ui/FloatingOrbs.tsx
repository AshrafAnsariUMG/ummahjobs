interface FloatingOrbsProps {
  variant?: 'hero' | 'page' | 'minimal'
}

export default function FloatingOrbs({ variant = 'page' }: FloatingOrbsProps) {

  if (variant === 'hero') {
    return (
      <>
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-80px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15,187,15,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '-100px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(3,59,176,0.10) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '40%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(3,59,176,0.07) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      </>
    )
  }

  if (variant === 'minimal') {
    return (
      <>
        <div style={{
          position: 'fixed',
          top: '-100px',
          right: '-100px',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(3,59,176,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <div style={{
          position: 'fixed',
          bottom: '-100px',
          left: '-100px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15,187,15,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      </>
    )
  }

  // Default 'page' variant
  return (
    <>
      <div style={{
        position: 'fixed',
        top: '10%',
        right: '-60px',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(3,59,176,0.06) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'fixed',
        bottom: '20%',
        left: '-60px',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(15,187,15,0.05) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
    </>
  )
}
