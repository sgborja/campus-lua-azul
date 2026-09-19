const WHATSAPP_NUMBER = '541168790332';

export default function FloatingWhatsapp() {
  const message = encodeURIComponent('Hola! Tengo una consulta sobre el Campus Lua Azul.');

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Escribinos por WhatsApp"
      title="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#20bd5a]"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M6.3 17.7 4.5 20l2.4-1.2A8 8 0 1 0 4 12a7.9 7.9 0 0 0 2.3 5.7z" />
        <path d="M9.3 9.9c.2-.6.4-.8.8-.8h.6c.2 0 .4.1.5.4l.5 1.2c.1.2.1.5-.1.6l-.5.6c.3.8 1 1.5 1.8 1.8l.6-.5c.2-.2.4-.2.6-.1l1.2.5c.3.1.4.3.4.5v.6c0 .4-.3.6-.8.8-1.6.5-4.2-1-5.1-1.9-.9-.9-2.4-3.5-1.9-5.1z" />
      </svg>
    </a>
  );
}
