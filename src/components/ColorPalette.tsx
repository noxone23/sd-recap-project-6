interface ColorPaletteProps {
  colors: string[];
}

export default function ColorPalette({ colors }: ColorPaletteProps) {
  return (
    <ul className="palette" aria-label="Color palette">
      {colors.map((color) => (
        <li key={color} title={color} style={{ backgroundColor: color }} />
      ))}
    </ul>
  );
}
