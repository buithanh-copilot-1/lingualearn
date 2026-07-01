interface Props {
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass = { sm: 'sound-wave-sm', md: 'sound-wave-md', lg: 'sound-wave-lg' };

export default function SoundWave({ active = false, size = 'sm' }: Props) {
  return (
    <span
      className={`sound-wave ${sizeClass[size]} ${active ? 'sound-wave-active' : ''}`}
      aria-hidden
    >
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}
