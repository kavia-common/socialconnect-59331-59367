import React from "react";

/**
 * MasonryGrid wraps children in a responsive CSS column layout.
 * For square media it's equivalent to a simple grid; still useful for future mixed aspect ratios.
 */
// PUBLIC_INTERFACE
export default function MasonryGrid({ children, minColumnWidth = 160, gap = 8 }) {
  const style = {
    columnGap: `${gap}px`,
    gridAutoRows: "1px",
  };
  return (
    <div
      className="masonry"
      style={style}
    >
      <style>{`
        .masonry {
          column-width: ${minColumnWidth}px;
        }
        @media (min-width: 640px) {
          .masonry { column-width: ${minColumnWidth + 40}px; }
        }
        @media (min-width: 1024px) {
          .masonry { column-width: ${minColumnWidth + 80}px; }
        }
        .masonry-item { break-inside: avoid; margin-bottom: ${gap}px; display: block; }
      `}</style>
      {React.Children.map(children, (child, i) => (
        <div className="masonry-item" key={i}>
          {child}
        </div>
      ))}
    </div>
  );
}
