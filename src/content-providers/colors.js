const ROWS = 6;
const COLS = 22;

const COLOR_CODES = [
  63, // Red
  64, // Orange
  65, // Yellow
  66, // Green
  67, // Blue
  68, // Violet
  70, // Black
  71  // Filled
];

const generateRandomColorGrid = () => {
  const grid = [];
  for (let row = 0; row < ROWS; row++) {
    const gridRow = [];
    for (let col = 0; col < COLS; col++) {
      const randomColorCode = COLOR_CODES[Math.floor(Math.random() * COLOR_CODES.length)];
      gridRow.push(randomColorCode);
    }
    grid.push(gridRow);
  }
  return grid;
};

const generateVerticalGrid = () => {
  const grid = [];
  const columnColors = [];
  
  // Generate random color for each column
  for (let col = 0; col < COLS; col++) {
    columnColors[col] = COLOR_CODES[Math.floor(Math.random() * COLOR_CODES.length)];
  }
  
  for (let row = 0; row < ROWS; row++) {
    const gridRow = [];
    for (let col = 0; col < COLS; col++) {
      gridRow.push(columnColors[col]);
    }
    grid.push(gridRow);
  }
  return grid;
};

const generateHorizontalGrid = () => {
  const grid = [];
  for (let row = 0; row < ROWS; row++) {
    const gridRow = [];
    const colorCode = COLOR_CODES[Math.floor(Math.random() * COLOR_CODES.length)];
    for (let col = 0; col < COLS; col++) {
      gridRow.push(colorCode);
    }
    grid.push(gridRow);
  }
  return grid;
};

const generateDiagonalGrid = () => {
  const grid = [];
  const diagonalColors = [];
  
  // Generate random colors for each diagonal (sum of row + col)
  const maxDiagonal = ROWS + COLS - 1;
  for (let i = 0; i < maxDiagonal; i++) {
    diagonalColors[i] = COLOR_CODES[Math.floor(Math.random() * COLOR_CODES.length)];
  }
  
  for (let row = 0; row < ROWS; row++) {
    const gridRow = [];
    for (let col = 0; col < COLS; col++) {
      const diagonalIndex = row + col;
      gridRow.push(diagonalColors[diagonalIndex]);
    }
    grid.push(gridRow);
  }
  return grid;
};

export const getColorContent = async (mode) => {
  try {
    console.log(`Generating ${mode} color pattern...`);
    
    let colorGrid;
    switch (mode.toUpperCase()) {
      case 'COLOR_RANDOM':
        colorGrid = generateRandomColorGrid();
        break;
      case 'COLOR_VERTICAL':
        colorGrid = generateVerticalGrid();
        break;
      case 'COLOR_HORIZONTAL':
        colorGrid = generateHorizontalGrid();
        break;
      case 'COLOR_DIAGONAL':
        colorGrid = generateDiagonalGrid();
        break;
      default:
        console.warn(`Unknown color mode: ${mode}, defaulting to random`);
        colorGrid = generateRandomColorGrid();
    }
    
    console.log(`Color pattern generated successfully: ${mode}`);
    return colorGrid;
    
  } catch (error) {
    console.error('Error generating color pattern:', error);
    return 'Color pattern generation failed';
  }
};
