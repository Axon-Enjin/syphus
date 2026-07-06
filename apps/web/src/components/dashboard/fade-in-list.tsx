"use client";

import { Children, ReactNode } from "react";

export function FadeInList({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);

  return (
    <div>
      {items.map((child, index) => (
        <div
          key={index}
          className="animate-fade-up"
          style={{ "--index": index } as React.CSSProperties}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
