# Spotify Genre Analysis - Sankey Chart Visualization

This interactive Sankey chart visualizes the relationship between music streaming platforms and genres, showing how different genres are represented across various platforms.

## Features

- **Interactive Sankey Diagram**: Visualizes connections between platforms and genres
- **Filtering Options**: 
  - View the top 10 genres by default (for better readability)
  - Option to view all 63 genres
  - Filter by individual genre
- **Enhanced Tooltips**: Shows detailed information when hovering over nodes and links
  - For links: Number of hits and percentage contribution to platform's total
  - For platform nodes: Total hits and top genres by percentage
  - For genre nodes: Total hits and connected platforms

## Data Visualization

The chart displays:
- 9 streaming platforms (source nodes)
- 63 music genres (target nodes) 
- The connections (links) between platforms and genres
- Cross-platform success indicators (★, ★★, ★★★)

## How to Use

1. Open `index.html` in a modern web browser, or run a local server:
   ```
   python -m http.server 3000
   ```
   Then visit http://localhost:3000

2. Interact with the chart:
   - Use the dropdown menu to switch between viewing modes (Top 10, All Genres, or specific genre)
   - Hover over links to see details about the connection
   - Hover over platforms to see their top genres
   - Hover over genres to see connected platforms
   - Drag nodes to rearrange the visualization

## Implementation Details

- Built with D3.js and the D3-Sankey plugin
- Responsive design that adapts to window resizing
- Custom styling for better readability
- Data validation to ensure proper visualization

## Credits

Created for CS5346 Information Visualization 