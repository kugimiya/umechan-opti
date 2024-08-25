export const Hr = ({ display = true }) => {
  if (!display) {
    return null;
  }

  return (
    <hr style={{ border: 'var(--hr-border)', marginTop: 'var(--hr-border-margins)', marginBottom: 'var(--hr-border-margins)' }} />
  );
}