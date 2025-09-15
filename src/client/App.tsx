import { useEffect, useState } from 'react';

export const App = () => {
  // Detect orientation to keep phone look consistent and fix desktop/fullscreen
  const [isPortrait, setIsPortrait] = useState(true);
  useEffect(() => {
    const update = () => setIsPortrait(window.innerHeight >= window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Card size as % of square container side
  const cardSize = isPortrait ? 16 : 20;

  // Hex geometry (flat-top) derived from bounding square side = 100%
  const hexWidth = cardSize;                 // %
  const hexHeight = cardSize * 0.8660254;    // %  (√3/2)

  // Spacing between centers
  // Portrait keeps previous look; Landscape uses exact flat-top spacing to avoid wide base
  const horizontalSpacing = isPortrait
    ? (cardSize * 0.8660254)            // ≈ √3/2 * side (previous look)
    : (hexWidth * 0.75);                // flat-top columns spacing = 0.75 * width
  const verticalSpacing = isPortrait
    ? (cardSize * 0.75)                 // previous look
    : (hexHeight * 0.75);               // flat-top row spacing = 0.75 * height
  
  // 🎯 Calculate mathematically perfect positions
  const calculateHexPositions = (): { x: number; y: number }[] => {
    const positions: { x: number; y: number }[] = [];
    const rows = [1, 2, 3, 4]; // Number of hexagons per row
    
    // Center the entire pyramid
    const pyramidCenterX = 50;
    const pyramidStartY = 20;
    
    let positionIndex = 0;
    
    rows.forEach((hexCount, rowIndex) => {
      // Calculate the starting X for this row (to center the row)
      const rowWidth = (hexCount - 1) * horizontalSpacing;
      const rowStartX = pyramidCenterX - (rowWidth / 2);
      
      // Calculate Y position for this row
      const rowY = pyramidStartY + (rowIndex * verticalSpacing);
      
      // Place hexagons in this row
      for (let hexIndex = 0; hexIndex < hexCount; hexIndex++) {
        const hexX = rowStartX + (hexIndex * horizontalSpacing);
        positions.push({
          x: hexX,
          y: rowY
        });
        positionIndex++;
      }
    });
    
    return positions;
  };

  const cardPositions = calculateHexPositions();
  
  // 🔍 Debug: Log positions to console
  console.log('📐 Calculated hex positions:', cardPositions);

  return (
    <div className="w-full h-screen overflow-hidden">
      {/* Responsive Background - covers entire screen */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full"
        style={{ 
          backgroundImage: 'url("/background.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* 10 Empty Card Frames in Pyramid */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
        {/* Fixed Square Container for Pyramid */}
        <div 
          className="relative"
          style={{
            width: 'min(95vw, 95vh)',
            height: 'min(95vw, 95vh)',
            // border: '2px solid red', // Debug border - remove later
          }}
        >
          {/* 🎯 10 Mathematically Positioned Cards */}
          {cardPositions.map((position, index) => (
            <img
              key={index}
              src="/number_card_background_and_frame.png"
              alt=""
              draggable={false}
              decoding="async"
              style={{
                position: 'absolute',
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${cardSize}%`,
                height: `${cardSize}%`,
                objectFit: 'contain',
                backgroundColor: 'transparent',
                WebkitClipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
