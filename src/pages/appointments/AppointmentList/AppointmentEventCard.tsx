export default function AppointmentEventCard({ event }: { event: any }) {
  const a = event.resource;
  return (
    <div style={{ lineHeight: 1.3, overflow: 'hidden' }}>
      <div style={{ fontWeight: 600, fontSize: '10.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {a.time} · {a.patientName}
      </div>
      <div style={{ fontSize: '9.5px', opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {a.type} · {a.doctorName}
      </div>
    </div>
  );
}
