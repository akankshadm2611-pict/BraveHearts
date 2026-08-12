import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CrimeHotspot, CrimeSeverity, Case, Suspect } from '../types';
import { initialCrimeHotspots } from '../data/crimeHotspots';
import { MapPin, Maximize2, Minimize2, ShieldAlert, Info, Crosshair, FolderKanban, Users, Eye } from 'lucide-react';

interface CrimeMapProps {
  hotspots?: CrimeHotspot[];
  cases?: Case[];
  suspects?: Suspect[];
  onSelectCase?: (c: Case) => void;
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

const STATUS_COLORS: Record<string, string> = {
  Active: '#ef4444',
  'Under Investigation': '#f97316',
  Solved: '#10b981',
  Pending: '#eab308',
};

export const CrimeMap: React.FC<CrimeMapProps> = ({
  hotspots = initialCrimeHotspots,
  cases = [],
  suspects = [],
  onSelectCase,
  themeMode = 'dark',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<CrimeHotspot | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<'both' | 'polygon' | 'circle'>('circle');
  const [showLegend, setShowLegend] = useState(false);

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
      zoomControl: false,
      attributionControl: true,
    });

    // Add OpenStreetMap base tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | CrimeLens AI',
    }).addTo(map);

    // Create layer group for hotspots and case markers
    const layersGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layersGroup;
    mapInstanceRef.current = map;

    map.on('click', () => {
      setSelectedHotspot(null);
    });

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

  // Update Map Layers whenever hotspots, cases, or overlayStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layersGroup = layersGroupRef.current;
    if (!map || !layersGroup) return;

    layersGroup.clearLayers();

    // 1. Synchronize Hotspots with Case Data
    const synchronizedHotspots = hotspots.map((hs) => {
      if (!cases || cases.length === 0) return hs;
      // Match cases by area name or location
      const matchingCases = cases.filter((c) => {
        if (!c.location) return false;
        const locLower = c.location.toLowerCase();
        const areaLower = hs.areaName.toLowerCase();
        return locLower.includes(areaLower) || areaLower.split(' ')[0].length > 3 && locLower.includes(areaLower.split(' ')[0]);
      });

      if (matchingCases.length > 0) {
        // Calculate most common crime
        const crimeCounts: Record<string, number> = {};
        matchingCases.forEach((c) => {
          crimeCounts[c.crimeType] = (crimeCounts[c.crimeType] || 0) + 1;
        });
        const topCrime = Object.entries(crimeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || hs.mostCommonCrime;

        return {
          ...hs,
          totalCases: matchingCases.length,
          mostCommonCrime: topCrime,
        };
      }
      return hs;
    });

    // Render Hotspot overlays
    synchronizedHotspots.forEach((hs) => {
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

      if ((overlayStyle === 'both' || overlayStyle === 'polygon') && hs.polygonCoords) {
        const polygon = L.polygon(hs.polygonCoords, defaultStyle);
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

      if ((overlayStyle === 'both' || overlayStyle === 'circle') && hs.center) {
        const circle = L.circle(hs.center, {
          ...defaultStyle,
          radius: hs.radiusMeters || 800,
          fillOpacity: overlayStyle === 'circle' ? 0.35 : 0.20,
        });
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
    });

    // 2. Render Case Location Pin Markers directly on the map
    cases.forEach((c) => {
      let coords: [number, number] = c.coordinates || [18.940, 72.835];
      // If no explicit coordinates, attempt fallback matching with hotspots
      if (!c.coordinates && c.location) {
        const matchedHs = synchronizedHotspots.find((hs) =>
          c.location.toLowerCase().includes(hs.areaName.toLowerCase())
        );
        if (matchedHs) {
          coords = matchedHs.center;
        }
      }

      const statusColor = STATUS_COLORS[c.status] || '#ef4444';

      // Find linked suspects for popup
      const linkedSuspectsList = suspects.filter((s) => s.linkedCaseIds.includes(c.id));

      const caseMarkerIcon = L.divIcon({
        className: 'custom-case-pin-marker',
        html: `
          <div style="position: relative; width: 28px; height: 36px; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="width: 28px; height: 28px; background-color: ${statusColor}; border: 2.5px solid #ffffff; border-radius: 50%; display: flex; items-center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5); font-weight: 900; color: #ffffff; font-size: 11px;">
              📍
            </div>
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 8px solid ${statusColor}; margin-top: -2px;"></div>
          </div>
        `,
        iconSize: [28, 36],
        iconAnchor: [14, 36],
      });

      const marker = L.marker(coords, { icon: caseMarkerIcon });

      // Create popup content
      const popupHtml = `
        <div style="min-width: 220px; font-family: system-ui, -apple-system, sans-serif; padding: 4px;">
          <div style="display: flex; items-center; justify-content: space-between; gap: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
            <span style="font-family: monospace; font-weight: 900; font-size: 11px; background: #0f172a; color: #f8fafc; padding: 2px 6px; border-radius: 4px;">${c.id}</span>
            <span style="font-[800]; font-size: 10px; color: ${statusColor}; padding: 2px 6px; background: rgba(0,0,0,0.05); border-radius: 12px; border: 1px solid ${statusColor};">● ${c.status}</span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-weight: 900; font-size: 13px; color: #0f172a; line-height: 1.2;">${c.caseName}</h4>
          <div style="font-size: 11px; color: #475569; font-weight: 600; margin-bottom: 6px; display: flex; items-center; gap: 4px;">
            📍 <span>${c.location}</span>
          </div>
          <div style="font-size: 10px; color: #64748b; background: #f8fafc; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 8px;">
            <div><strong>Crime:</strong> ${c.crimeType} (Priority: ${c.priority})</div>
            <div><strong>Host:</strong> ${c.assignedHostName}</div>
            ${linkedSuspectsList.length > 0 ? `<div style="margin-top: 2px; color: #dc2626; font-weight: 700;"><strong>Suspects:</strong> ${linkedSuspectsList.map(s => s.fullName).join(', ')}</div>` : ''}
          </div>
          <button id="case-popup-btn-${c.id}" style="width: 100%; padding: 6px; background: #2563eb; color: #ffffff; border: none; border-radius: 6px; font-weight: 800; font-size: 11px; cursor: pointer;">
            Inspect Case Dossier →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { className: 'crime-hotspot-popup' });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`case-popup-btn-${c.id}`);
        if (btn && onSelectCase) {
          btn.onclick = () => {
            onSelectCase(c);
          };
        }
      });

      marker.addTo(layersGroup);
    });
  }, [hotspots, cases, suspects, overlayStyle, onSelectCase]);

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
        className={`px-4 sm:px-5 py-3 border-b flex items-center justify-between gap-3 ${
          themeMode === 'bright'
            ? 'bg-slate-100/90 border-slate-300'
            : 'bg-slate-950/90 border-blue-900/50'
        }`}
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3
              className={`text-sm sm:text-base font-extrabold flex flex-wrap items-center gap-2 leading-tight ${
                themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'
              }`}
            >
              <span className="truncate">Crime Hotspot Map</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                LIVE GIS OSM
              </span>
            </h3>
            <p
              className={`text-[11px] mt-0.5 truncate hidden sm:block ${
                themeMode === 'bright' ? 'text-slate-600 font-medium' : 'text-slate-400'
              }`}
            >
              Real-time spatial crime density analytics for registered cases
            </p>
          </div>
        </div>

        {/* View Controls & Action Buttons - Strictly Horizontally Aligned */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetView}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all text-xs flex items-center space-x-1.5 font-bold cursor-pointer shadow-xs ${
              themeMode === 'bright'
                ? 'bg-white border-slate-300 hover:bg-slate-50 text-slate-900'
                : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-100'
            }`}
            title="Reset Map Center"
          >
            <Crosshair className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="whitespace-nowrap hidden sm:inline">Reset Center</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all text-xs flex items-center space-x-1.5 font-bold cursor-pointer shadow-xs ${
              themeMode === 'bright'
                ? 'bg-white border-slate-300 hover:bg-slate-50 text-slate-900'
                : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-100'
            }`}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <Maximize2 className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <span className="whitespace-nowrap hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
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

        {/* 'i' Icon & Interactive Crime Severity Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-20 flex flex-col items-start space-y-2">
          {showLegend && (
            <div
              className={`max-w-xs sm:max-w-sm backdrop-blur-md border p-3 sm:p-4 rounded-2xl shadow-2xl text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150 ${
                themeMode === 'bright'
                  ? 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-300/50'
                  : 'bg-slate-950/95 border-slate-800 text-slate-100'
              }`}
            >
              <div
                className={`flex items-center justify-between border-b pb-1.5 ${
                  themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800'
                }`}
              >
                <span
                  className={`font-extrabold uppercase tracking-wider text-[11px] flex items-center ${
                    themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                  }`}
                >
                  <Info className={`w-3.5 h-3.5 mr-1 ${themeMode === 'bright' ? 'text-blue-600' : ''}`} /> Case Status Legend
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] ${themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-slate-400'}`}>
                    {cases.length} Cases • {hotspots.length} Zones
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowLegend(false)}
                    className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white font-bold cursor-pointer"
                    title="Close Legend"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Case Statuses */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Case Status Pins</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500 border border-white shrink-0 shadow-[0_0_6px_rgba(239,68,68,0.8)]"></span>
                    <span className={`text-[10.5px] font-bold ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>
                      Active Case
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-orange-500 border border-white shrink-0 shadow-[0_0_6px_rgba(249,115,22,0.8)]"></span>
                    <span className={`text-[10.5px] font-bold ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>
                      Under Investigation
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
                    <span className={`text-[10.5px] font-bold ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>
                      Solved Case
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-yellow-500 border border-white shrink-0 shadow-[0_0_6px_rgba(234,179,8,0.8)]"></span>
                    <span className={`text-[10.5px] font-bold ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>
                      Pending Case
                    </span>
                  </div>
                </div>
              </div>

              {/* Crime Hotspot Zones */}
              <div className={`pt-1.5 border-t space-y-1 ${themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800'}`}>
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Crime Hotspot Risk Zones</div>
                <div className="flex items-center justify-between text-[10px] font-semibold gap-1">
                  <span className="flex items-center text-red-500"><span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span> High</span>
                  <span className="flex items-center text-orange-500"><span className="w-2 h-2 rounded-full bg-orange-500 mr-1"></span> Medium</span>
                  <span className="flex items-center text-yellow-500"><span className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></span> Low</span>
                </div>
              </div>

              <div
                className={`pt-1.5 border-t text-[10px] flex items-center justify-between ${
                  themeMode === 'bright' ? 'border-slate-200 text-slate-600 font-medium' : 'border-slate-800/80 text-slate-400'
                }`}
              >
                <span>Click pin to inspect dossier</span>
                <span>Click zone for details</span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowLegend(!showLegend)}
            className={`w-9 h-9 rounded-full font-bold flex items-center justify-center shadow-lg border transition-all cursor-pointer ${
              showLegend
                ? 'bg-yellow-500 text-slate-950 border-yellow-400 scale-105'
                : themeMode === 'bright'
                ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                : 'bg-slate-900/90 hover:bg-slate-950 text-yellow-400 border-slate-700'
            }`}
            title="Toggle Case Status Legend"
          >
            <Info className="w-5 h-5" />
          </button>
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
