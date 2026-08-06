import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CrimeHotspot, CrimeSeverity } from '../types';
import { initialCrimeHotspots } from '../data/crimeHotspots';
import { MapPin, Maximize2, Minimize2, ShieldAlert, Layers, RefreshCw, Info, AlertTriangle, Crosshair } from 'lucide-react';

interface CrimeMapProps {
  hotspots?: CrimeHotspot[];
  themeMode?: 'dark' | 'bright';
}

/**
 * Color configuration based on Crime Severity
 * 🔴 Red = High Crime / Most Sensitive Area
 * 🟠 Orange = Medium Crime / Risky Area
 * 🟡 Yellow = Low Crime / Less Risky Area
 */
const SEVERITY_COLORS: Record<CrimeSeverity, { fill: string; stroke: string; label: string; bgBadge: string }> = {
  High: {
    fill: '#ef4444',
    stroke: '#dc2626',
    label: 'High Crime / Most Sensitive Area',
    bgBadge: 'bg-red-500/20 text-red-400 border-red-500/50',
  },
  Medium: {
    fill: '#f97316',
    stroke: '#ea580c',
    label: 'Medium Crime / Risky Area',
    bgBadge: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  },
  Low: {
    fill: '#eab308',
    stroke: '#ca8a04',
    label: 'Low Crime / Less Risky Area',
    bgBadge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  },
};

export const CrimeMap: React.FC<CrimeMapProps> = ({
  hotspots = initialCrimeHotspots,
  themeMode = 'dark',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<CrimeHotspot | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<'both' | 'polygon' | 'circle'>('both');

  // Center map on Mumbai / Metro Area HQ
  const defaultCenter: [number, number] = [18.940, 72.835];
  const defaultZoom = 12;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Leaflet map instance
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: false, // We render custom responsive zoom controls
      attributionControl: true,
    });

    // Add OpenStreetMap base tile layer (Retains original OpenStreetMap colors outside hotspots)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | CrimeLens AI',
    }).addTo(map);

    // Create layer group for hotspots
    const layersGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layersGroup;
    mapInstanceRef.current = map;

    // Click on empty map area closes selected hotspot card
    map.on('click', () => {
      setSelectedHotspot(null);
    });

    // Handle map container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Map Layers whenever hotspots or overlayStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layersGroup = layersGroupRef.current;
    if (!map || !layersGroup) return;

    // Clear previous layers
    layersGroup.clearLayers();

    // Render Hotspots
    hotspots.forEach((hs) => {
      const colorConfig = SEVERITY_COLORS[hs.severity] || SEVERITY_COLORS.Low;

      const defaultStyle: L.PathOptions = {
        color: colorConfig.stroke,
        fillColor: colorConfig.fill,
        fillOpacity: 0.38,
        weight: 2,
        dashArray: hs.severity === 'High' ? undefined : '4, 4',
      };

      const hoverStyle: L.PathOptions = {
        color: '#ffffff',
        fillColor: colorConfig.fill,
        fillOpacity: 0.65,
        weight: 4,
        dashArray: undefined,
      };

      // Draw Polygon Overlay
      if ((overlayStyle === 'both' || overlayStyle === 'polygon') && hs.polygonCoords) {
        const polygon = L.polygon(hs.polygonCoords, defaultStyle);

        // Hover highlighting
        polygon.on('mouseover', () => {
          polygon.setStyle(hoverStyle);
          polygon.bringToFront();
        });
        polygon.on('mouseout', () => {
          polygon.setStyle(defaultStyle);
        });
        polygon.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedHotspot(hs);
        });

        polygon.addTo(layersGroup);
      }

      // Draw Circle Overlay
      if ((overlayStyle === 'both' || overlayStyle === 'circle') && hs.center) {
        const circle = L.circle(hs.center, {
          ...defaultStyle,
          radius: hs.radiusMeters || 800,
          fillOpacity: overlayStyle === 'circle' ? 0.45 : 0.25,
        });

        // Hover highlighting
        circle.on('mouseover', () => {
          circle.setStyle(hoverStyle);
          circle.bringToFront();
        });
        circle.on('mouseout', () => {
          circle.setStyle(defaultStyle);
        });
        circle.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedHotspot(hs);
        });

        circle.addTo(layersGroup);
      }

      // Add Center Marker with pulsing dot icon
      const customPulseIcon = L.divIcon({
        className: 'custom-pulse-marker',
        html: `
          <div style="position: relative; width: 18px; height: 18px;">
            <div style="position: absolute; width: 18px; height: 18px; background-color: ${colorConfig.fill}; opacity: 0.75; border-radius: 50%; animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;"></div>
            <div style="position: absolute; top: 3px; left: 3px; width: 12px; height: 12px; background-color: ${colorConfig.fill}; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 0 6px rgba(0,0,0,0.5);"></div>
          </div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const marker = L.marker(hs.center, { icon: customPulseIcon });
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedHotspot(hs);
      });
      marker.addTo(layersGroup);
    });
  }, [hotspots, overlayStyle]);

  // Zoom Controls
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetView = () => {
    mapInstanceRef.current?.setView(defaultCenter, defaultZoom, { animate: true });
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!isFullscreen) {
      if (mapContainerRef.current.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for ESC or browser native exit fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      className={`relative z-0 isolate w-full rounded-2xl border overflow-hidden shadow-xl transition-all ${
        themeMode === 'bright'
          ? 'bg-white border-slate-300 text-slate-900'
          : 'bg-slate-900 border-blue-900/50 text-slate-100'
      }`}
    >
      {/* Top Header Control Bar */}
      <div
        className={`px-4 sm:px-6 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          themeMode === 'bright'
            ? 'bg-slate-100 border-slate-300'
            : 'bg-slate-950/80 border-blue-900/50'
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
              <span>Jurisdiction Crime Hotspot Map</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                LIVE GIS OSM
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Real-time spatial crime density analytics with OpenStreetMap color-coded risk zones
            </p>
          </div>
        </div>

        {/* View Controls & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Overlay Switcher */}
          <div
            className={`flex items-center p-1 rounded-xl border text-xs font-semibold ${
              themeMode === 'bright' ? 'bg-slate-200 border-slate-300' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <button
              onClick={() => setOverlayStyle('both')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                overlayStyle === 'both'
                  ? themeMode === 'bright'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-yellow-500 text-slate-950 shadow-sm'
                  : themeMode === 'bright'
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Polygons & Circles
            </button>
            <button
              onClick={() => setOverlayStyle('polygon')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                overlayStyle === 'polygon'
                  ? themeMode === 'bright'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-yellow-500 text-slate-950 shadow-sm'
                  : themeMode === 'bright'
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Polygons
            </button>
            <button
              onClick={() => setOverlayStyle('circle')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                overlayStyle === 'circle'
                  ? themeMode === 'bright'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-yellow-500 text-slate-950 shadow-sm'
                  : themeMode === 'bright'
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Circles
            </button>
          </div>

          <button
            onClick={handleResetView}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center space-x-1 font-bold ${
              themeMode === 'bright'
                ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800'
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
            }`}
            title="Reset Map Center"
          >
            <Crosshair className="w-4 h-4 text-yellow-500" />
            <span className="hidden md:inline">Reset Center</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center space-x-1 font-bold ${
              themeMode === 'bright'
                ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800'
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
            }`}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-yellow-500" /> : <Maximize2 className="w-4 h-4 text-yellow-500" />}
            <span className="hidden md:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Map Body Container */}
      <div className={`relative w-full ${isFullscreen ? 'h-full min-h-[500px]' : 'h-[280px] sm:h-[320px] lg:h-[360px]'}`}>
        {/* Leaflet Map Target Div */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Custom On-Map Zoom Controls */}
        <div className="absolute top-4 left-4 z-20 flex flex-col space-y-1 shadow-lg">
          <button
            onClick={handleZoomIn}
            className={`w-9 h-9 font-extrabold text-lg border rounded-t-lg flex items-center justify-center transition-all active:scale-95 ${
              themeMode === 'bright'
                ? 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300 hover:text-blue-600'
                : 'bg-slate-900/90 hover:bg-slate-950 text-white border-slate-700 hover:text-yellow-400'
            }`}
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className={`w-9 h-9 font-extrabold text-lg border-x border-b rounded-b-lg flex items-center justify-center transition-all active:scale-95 ${
              themeMode === 'bright'
                ? 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300 hover:text-blue-600'
                : 'bg-slate-900/90 hover:bg-slate-950 text-white border-slate-700 hover:text-yellow-400'
            }`}
            title="Zoom Out"
          >
            −
          </button>
        </div>

        {/* Legend Overlay */}
        <div className={`absolute bottom-4 left-4 z-20 max-w-xs sm:max-w-sm backdrop-blur-md border p-3 sm:p-4 rounded-2xl shadow-2xl text-xs space-y-2 ${
          themeMode === 'bright'
            ? 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-300/50'
            : 'bg-slate-950/90 border-slate-800 text-slate-100'
        }`}>
          <div className={`flex items-center justify-between border-b pb-1.5 ${
            themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <span className={`font-extrabold uppercase tracking-wider text-[11px] flex items-center ${
              themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
            }`}>
              <Info className={`w-3.5 h-3.5 mr-1 ${themeMode === 'bright' ? 'text-blue-600' : ''}`} /> Crime Severity Legend
            </span>
            <span className={`text-[10px] ${themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-slate-400'}`}>{hotspots.length} Zones</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 border border-red-300 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              <span className={`text-[11px] font-bold ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>🔴 High Crime / Most Sensitive Area</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full bg-orange-500 border border-orange-300 shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>
              <span className={`text-[11px] font-bold ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>🟠 Medium Crime / Risky Area</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-500 border border-yellow-300 shrink-0 shadow-[0_0_8px_rgba(234,179,8,0.8)]"></span>
              <span className={`text-[11px] font-bold ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>🟡 Low Crime / Less Risky Area</span>
            </div>
          </div>

          <div className={`pt-1.5 border-t text-[10px] flex items-center justify-between ${
            themeMode === 'bright' ? 'border-slate-200 text-slate-600 font-medium' : 'border-slate-800/80 text-slate-400'
          }`}>
            <span>Hover zone for highlight</span>
            <span>Click for zone details</span>
          </div>
        </div>

        {/* Selected Hotspot Summary Pop-up Card */}
        {selectedHotspot && (
          <div className={`absolute top-4 right-4 z-30 w-72 sm:w-80 backdrop-blur-md border p-4 rounded-2xl shadow-2xl space-y-3 text-xs animate-in fade-in slide-in-from-right duration-200 ${
            themeMode === 'bright'
              ? 'bg-white border-slate-300 text-slate-900 shadow-slate-400/30'
              : 'bg-slate-950/95 border-blue-900/60 text-slate-100 shadow-black/80'
          }`}>
            <div className={`flex items-center justify-between border-b pb-2 ${
              themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${SEVERITY_COLORS[selectedHotspot.severity].bgBadge}`}>
                {selectedHotspot.severity} Risk Severity
              </span>
              <button
                onClick={() => setSelectedHotspot(null)}
                className={`p-1 rounded-lg text-xs font-bold transition-colors ${
                  themeMode === 'bright'
                    ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Close Pop-up"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className={`font-black text-sm sm:text-base leading-snug ${
                themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
              }`}>{selectedHotspot.areaName}</h4>
              <p className={`text-[11px] mt-0.5 font-semibold ${
                themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Crime Severity Index: <strong className={themeMode === 'bright' ? 'text-blue-900 font-black' : 'text-white'}>{selectedHotspot.crimeIndex}/100</strong>
              </p>
            </div>

            <div className={`grid grid-cols-2 gap-2.5 p-3 rounded-xl border ${
              themeMode === 'bright'
                ? 'bg-slate-50 border-slate-200 text-slate-900'
                : 'bg-slate-900/90 border-slate-800 text-slate-100'
            }`}>
              <div>
                <span className={`text-[10px] block font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>Total Cases</span>
                <span className={`font-black text-xs sm:text-sm ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>{selectedHotspot.totalCases} Reported</span>
              </div>
              <div>
                <span className={`text-[10px] block font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>Main Offense</span>
                <span className={`font-black text-[11px] truncate block ${themeMode === 'bright' ? 'text-blue-700' : 'text-sky-400'}`}>{selectedHotspot.mostCommonCrime}</span>
              </div>
            </div>

            <div className={`text-[10px] flex items-center justify-between pt-1 border-t ${
              themeMode === 'bright' ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
            }`}>
              <span>Last GIS Sync:</span>
              <span className={`font-mono font-bold ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>{selectedHotspot.lastUpdated}</span>
            </div>
          </div>
        )}
      </div>

      {/* Global CSS for pulsing animation & popup override */}
      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            transform: scale(1.6);
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
        .crime-hotspot-popup .leaflet-popup-content-wrapper {
          border-radius: 14px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
          border: 1px solid #cbd5e1;
          padding: 2px;
        }
        .crime-hotspot-popup .leaflet-popup-tip {
          background: #ffffff;
        }
      `}</style>
    </div>
  );
};
