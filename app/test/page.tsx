export default function TestPage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', backgroundColor: '#4ADE80', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '48px', color: '#0D3D1F' }}>TEST PAGE WORKS!</h1>
      <p style={{ color: '#0D3D1F' }}>If you see this, Vercel is deploying correctly.</p>
      <p style={{ color: '#0D3D1F', marginTop: '20px' }}>Deployed at: {new Date().toISOString()}</p>
    </div>
  );
}
