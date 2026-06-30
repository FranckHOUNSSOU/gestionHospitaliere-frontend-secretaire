export default function PatientFileSyntheseItem({ children }: { children: any }) {
  return (
    <div style={{ padding: '7px 10px', background: 'var(--c-surf2)', borderRadius: 7, marginBottom: 5, fontSize: 11, color: 'var(--c-t1)' }}>
      {children}
    </div>
  );
}
