// colours sampled from the design's Backdrop + Tint layers (docs/design, iOS · 0X · v2), one line per mesh row
// prettier-ignore
export const BACKDROPS = {
  // 01 Sign In, 07 Moderation
  glow: {
    columns: 4,
    rows: 5,
    colors: [
      "#0b0b1b", "#0c0c1f", "#0e1636", "#16153c",
      "#261e2f", "#151428", "#13162e", "#1e1c36",
      "#1c1b30", "#161629", "#1e1c31", "#1a193e",
      "#14142b", "#13162a", "#141321", "#101021",
      "#0c0d18", "#0c0d18", "#0d0e17", "#0c0d17",
    ],
  },
  // 02 Feed, 03 Chat, 04 Meet, 05 Study, 06 Guide
  city: {
    columns: 3,
    rows: 4,
    colors: [
      "#1f2228", "#28314d", "#314071",
      "#1b1c22", "#25293a", "#2a314c",
      "#201a29", "#201c26", "#1b1a1f",
      "#29233e", "#242031", "#1b1b20",
    ],
  },
};

export const gridPoints = (columns: number, rows: number) =>
  Array.from({ length: columns * rows }, (_, i) => [
    (i % columns) / (columns - 1),
    Math.floor(i / columns) / (rows - 1),
  ]);

export type BackdropVariant = keyof typeof BACKDROPS;
