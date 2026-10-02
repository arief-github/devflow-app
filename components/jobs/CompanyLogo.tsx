type Props = {
  name: string;
  logo?: string;
  size?: number;
};

/**
 * Pakai <img> biasa, bukan next/image: URL logo bebas diisi user,
 * sedangkan next/image mewajibkan setiap domain didaftarkan di next.config.
 */
export default function CompanyLogo({ name, logo, size = 56 }: Props) {
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={`${name} logo`}
        width={size}
        height={size}
        loading="lazy"
        className="shrink-0 rounded-lg bg-light-800 object-contain"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      aria-hidden
      className="primary-gradient flex shrink-0 items-center justify-center rounded-lg font-bold text-light-900"
      style={{ width: size, height: size }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
