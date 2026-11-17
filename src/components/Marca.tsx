/* eslint-disable @next/next/no-img-element */
// Logo do site = o mesmo do app (app.voicia.com.br): escudo com o microfone.
// As imagens saem dos PNGs do app (src/assets/voicia-logo-dark.png), só recortadas e convertidas.
// O símbolo de pétalas de 09/11/2026 saiu: o Luiz não aprovou e o app voltou ao escudo em 10/11/2026.

/** Símbolo da VoicIA: o escudo com o microfone, sem o nome. */
export function MarcaIcone({ className = "h-8 w-8" }: { className?: string }) {
  return <img src="/marca/voicia-escudo-128.webp" alt="" aria-hidden="true" className={`object-contain ${className}`} />;
}

/** Logo completo do app, versão para fundo escuro (nome em branco, "IA" em verde-azulado). */
export function Marca({ className = "h-12 w-auto", alt = "VoicIA, suporte médico" }: { className?: string; alt?: string }) {
  return <img src="/marca/voicia-logo-app-escuro.webp" alt={alt} width={959} height={363} className={`block ${className}`} />;
}
