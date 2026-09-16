import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { useTheme } from "../context/ThemeContext";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const GENDER_COLORS = {
  female: "#e0723c",
  male: "#c94f82",
  other: "#7f77dd",
};

function WorldMap({ countryStats }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [tooltip, setTooltip] = useState(null);
  const [hoveredName, setHoveredName] = useState(null);

  const highlightFill = isDark ? "#e0723c" : "#3b82f6";
  const highlightHover = isDark ? "#f0995f" : "#2563eb";
  const baseFill = isDark ? "#3a1f5c" : "#e5e7eb";
  const baseHover = isDark ? "#4a2a70" : "#d1d5db";
  const strokeColor = isDark ? "#240b3b" : "#ffffff";

  return (
    <div className="relative">
      <style>{`
        .rsm-svg path:focus,
        .rsm-svg *:focus {
          outline: none !important;
        }
      `}</style>

      <ComposableMap
        className="rsm-svg"
        projectionConfig={{ scale: 140 }}
        width={800}
        height={400}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name = geo.properties.name;
              const stats = countryStats[name];
              const isHighlighted = !!stats;
              const isHovered = hoveredName === name;

              let fill = isHighlighted ? highlightFill : baseFill;
              if (isHovered) {
                fill = isHighlighted ? highlightHover : baseHover;
              }

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke={strokeColor}
                  strokeWidth={0.5}
                  onMouseEnter={(evt) => {
                    setHoveredName(name);
                    setTooltip({
                      name,
                      stats,
                      x: evt.clientX,
                      y: evt.clientY,
                    });
                  }}
                  onMouseMove={(evt) => {
                    setTooltip((prev) =>
                      prev ? { ...prev, x: evt.clientX, y: evt.clientY } : prev
                    );
                  }}
                  onMouseLeave={() => {
                    setHoveredName(null);
                    setTooltip(null);
                  }}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", cursor: "pointer" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 rounded-lg shadow-xl pointer-events-none bg-[#1e1e2e] text-white text-xs"
          style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
        >
          <p className="font-semibold mb-1">{tooltip.name}</p>
          {tooltip.stats ? (
            <>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2.5 h-2.5 rounded-sm inline-block bg-blue-400"></span>
                <span>Users: {tooltip.stats.total}</span>
              </div>
              {Object.entries(tooltip.stats.genders).map(([gender, count]) => (
                <div key={gender} className="flex items-center gap-2 capitalize">
                  <span
                    className="w-2.5 h-2.5 rounded-sm inline-block"
                    style={{ backgroundColor: GENDER_COLORS[gender?.toLowerCase()] || "#888780" }}
                  ></span>
                  <span>
                    {gender}: {count}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <p className="text-gray-400">No data</p>
          )}
        </div>
      )}
    </div>
  );
}

export default WorldMap;