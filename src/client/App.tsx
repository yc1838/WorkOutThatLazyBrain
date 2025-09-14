export const App = () => {
  // 🧮 Mathematical hexagon positioning algorithm
  const cardSize = 16; // 16% of container size
  const hexRadius = cardSize / 2; // Radius from center to vertex of hexagon
  
  // 📐 Hexagon geometry constants
  const horizontalSpacing = hexRadius * Math.sqrt(3); // Distance between hex centers horizontally
  const verticalSpacing = hexRadius * 1.5; // Distance between hex centers vertically
  
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
            width: 'min(90vw, 90vh)',
            height: 'min(90vw, 90vh)',
            // border: '2px solid red', // Debug border - remove later
          }}
        >
          {/* 🎯 10 Mathematically Positioned Cards */}
          {cardPositions.map((position, index) => (
            <div key={index}>
              <img
                src="/number_card_background_and_frame.png"
                alt=""
                draggable={false}
                decoding="async"
                style={{
                  position: 'absolute',
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: 'translate(-50%, -50%)', // Center the card on the position
                  width: `${cardSize}%`,
                  height: `${cardSize}%`,
                  objectFit: 'contain',
                  backgroundColor: 'transparent',
                  WebkitClipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                  clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)'
                }}
              />
              {/* 🔍 Debug coordinates */}
              <div
                style={{
                  position: 'absolute',
                  left: `${position.x}%`,
                  top: `${position.y + cardSize/2 + 2}%`,
                  transform: 'translate(-50%, 0)',
                  fontSize: '8px',
                  color: 'red',
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px white',
                  pointerEvents: 'none'
                }}
              >
                {`(${position.x.toFixed(1)}, ${position.y.toFixed(1)})`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
