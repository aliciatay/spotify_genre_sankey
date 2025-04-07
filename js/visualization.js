// Dimensions for the visualization
const margin = { top: 10, right: 240, bottom: 10, left: 100 };
const width = 1600 - margin.left - margin.right;
const height = 1000 - margin.top - margin.bottom;

// Immediately log to help with debugging
console.log("Visualization.js loaded, setting up constants");

// Color scales for nodes and links
const platformColors = {
    "Amazon": "#57a7f0",
    "Apple Music": "#e94335",
    "Deezer": "#f06ebd",
    "YouTube": "#e33810",
    "SiriusXM": "#282faf",
    "Spotify": "#40a340",
    "TikTok": "#000000",
    "Pandora": "#4169e1",
    "Shazam": "#55a2f0"
};

// Genre abbreviations
const genreAbbreviations = {
    "pop": "pop",
    "dance": "dan",
    "house": "hou",
    "electro": "ele",
    "edm": "edm",
    "rock": "roc",
    "hip-hop": "hip",
    "reggaeton": "reg",
    "latino": "lat",
    "reggae": "reg",
    "indie": "ind",
    "latin": "lat",
    "alternative": "alt",
    "progressive house": "pro",
    "r&b": "r&b",
    "soul": "soul",
    "country": "cty",
    "jazz": "jazz",
    "classical": "cls",
    "metal": "mtl",
    "punk": "pnk",
    "folk": "folk",
    "blues": "blu",
    "k-pop": "k-p",
    "j-pop": "j-p",
    "trap": "trp",
    "disco": "dis",
    "techno": "tec",
    "anime": "ani",
    // New abbreviations for additional genres
    "acoustic": "aco",
    "alt-rock": "a-r",
    "ambient": "amb",
    "british": "bri",
    "children": "chi",
    "chill": "chl",
    "club": "clb",
    "comedy": "com",
    "dancehall": "dch",
    "deep-house": "d-h",
    "electronic": "elc",
    "emo": "emo",
    "french": "fre",
    "funk": "fnk",
    "garage": "gar",
    "german": "ger",
    "groove": "grv",
    "grunge": "grg",
    "hard-rock": "h-r",
    "indian": "ind",
    "indie-pop": "i-p",
    "industrial": "ids",
    "j-dance": "j-d",
    "pagode": "pag",
    "piano": "pia",
    "pop-film": "p-f",
    "progressive-house": "prh",
    "punk-rock": "p-r",
    "sad": "sad",
    "salsa": "sal",
    "show-tunes": "s-t",
    "singer-songwriter": "s-s",
    "songwriter": "swr",
    "spanish": "spa",
    "swedish": "swe",
    "synth-pop": "s-p"
};

// Helper function to truncate text if too long
function truncateText(text, maxLength = 12) {
    return text.length > maxLength ? text.substring(0, maxLength - 2) + '..' : text;
}

// Create tooltip element
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("background-color", "#fff")
    .style("border", "1px solid #ddd")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("box-shadow", "0 0 10px rgba(0,0,0,0.2)")
    .style("font-family", "Arial, sans-serif");

// Global variable to store the current filter mode
let currentFilterMode = "top10";
let selectedGenre = null;

// Main function to create and update the Sankey diagram
function updateVisualization() {
    console.log("Updating Sankey visualization...");
    
    try {
        // Check if we have sankeyData
        if (!window.sankeyData || !window.sankeyData.nodes || !window.sankeyData.links) {
            console.error("No Sankey data found:", window.sankeyData);
            document.getElementById('sankey-chart').innerHTML = "<p>Error: No data available for visualization</p>";
            return;
        }
        
        console.log("Data available:", window.sankeyData.nodes.length, "nodes,", window.sankeyData.links.length, "links");
        
        // Clear the chart container
        d3.select("#sankey-chart").html("");
        
        // Create SVG element
        const svg = d3.select("#sankey-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        console.log("SVG created");
        
        // Filter the genres based on the current filter mode
        let filteredData = filterData();
        
        // Check if filteredData has valid nodes and links
        if (!filteredData || !filteredData.nodes || !filteredData.links || 
            filteredData.nodes.length === 0 || filteredData.links.length === 0) {
            console.error("Filtered data is invalid:", filteredData);
            document.getElementById('sankey-chart').innerHTML = "<p>Error: No valid data after filtering</p>";
            return;
        }
        
        console.log("Data filtered:", filteredData.nodes.length, "nodes,", filteredData.links.length, "links");
        
        // Create the Sankey diagram generator with better node padding
        const sankey = d3.sankey()
            .nodeWidth(20)
            .nodePadding(15)   // Increased padding for better readability
            .extent([[0, 0], [width, height]]);
        
        // Format the data for d3-sankey, which needs numeric node indices
        const nodeMap = new Map();
        
        // Create a mapping of node names to indices
        filteredData.nodes.forEach((node, i) => {
            nodeMap.set(node.name, i);
            node.id = i;
        });
        
        // Convert source/target from names to indices
        const formattedLinks = filteredData.links.map(link => {
            // Add null checks here
            if (!link || typeof link !== 'object' || !link.source || !link.target) {
                console.error("Invalid link found:", link);
                return null;
            }
            
            // Ensure value is defined and valid
            if (link.value === undefined || link.value === null) {
                console.error("Link with undefined value:", link);
                return null;
            }
            
            const sourceNode = nodeMap.get(link.source);
            const targetNode = nodeMap.get(link.target);
            
            if (sourceNode === undefined || targetNode === undefined) {
                console.error("Could not find node for link:", link);
                return null;
            }
            
            return {
                source: sourceNode,
                target: targetNode,
                value: link.value || 0, // Default to 0 if value is missing
                sourceName: link.source,
                targetName: link.target
            };
        }).filter(link => link !== null); // Remove any invalid links
        
        console.log("Data prepared for Sankey");
        
        // Set up the Sankey layout
        const graph = (() => {
            try {
                // Extra safety check for nodes and links
                const validNodes = filteredData.nodes.filter(node => node !== null && node !== undefined);
                const validLinks = formattedLinks.filter(link => 
                    link !== null && 
                    link.source !== undefined && link.source !== null &&
                    link.target !== undefined && link.target !== null &&
                    link.value !== undefined && link.value !== null
                );
                
                if (validNodes.length === 0 || validLinks.length === 0) {
                    throw new Error("No valid nodes or links found after filtering");
                }
                
                console.log("Creating Sankey with", validNodes.length, "nodes and", validLinks.length, "links");
                
                return sankey({
                    nodes: validNodes,
                    links: validLinks
                });
            } catch (error) {
                console.error("Error creating Sankey layout:", error);
                document.getElementById('sankey-chart').innerHTML = "<p>Error creating visualization: " + error.message + "</p>";
                return { nodes: [], links: [] };
            }
        })();
        
        console.log("Sankey layout created");
        
        // Check if we have a valid graph
        if (!graph.nodes || graph.nodes.length === 0 || !graph.links || graph.links.length === 0) {
            console.error("No valid graph created");
            document.getElementById('sankey-chart').innerHTML = "<p>Error: Could not create a valid visualization with the available data</p>";
            return;
        }
        
        // Draw the links
        const link = svg.append("g")
            .selectAll(".link")
            .data(graph.links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke", d => {
                // Get source platform and use its color
                if (!d || !d.source || !d.source.name) return "#999";
                const sourceName = d.source.name;
                return platformColors[sourceName] || "#999";
            })
            .attr("stroke-width", d => {
                if (!d || typeof d.width === 'undefined' || d.width === null) return 1;
                return Math.max(1, d.width);
            })
            .style("fill", "none")
            .style("stroke-opacity", 0.7)
            .on("mouseover", function(event, d) {
                // Null check for the data
                if (!d || !d.source || !d.target) return;
                if (!d.source.name || !d.target.name) return;
                
                // Generate a tooltip showing platform → genre info
                const sourceName = d.source.name;
                const targetName = d.target.name;
                
                // Create tooltip with custom content
                if (d.source.type === "platform" && d.target.type === "genre") {
                    // Ensure value exists
                    const value = d.value !== undefined && d.value !== null ? d.value : 0;
                    
                    // Calculate percentage of platform's total hits
                    const platformTotalHits = getSankeyLinks()
                        .filter(link => link && link.source === sourceName)
                        .reduce((sum, link) => sum + (link.value || 0), 0);
                    
                    const percentage = platformTotalHits > 0 ? ((value / platformTotalHits) * 100).toFixed(1) : 0;
                    
                    const platformColor = platformColors[sourceName] || "#999";
                    
                    const content = `
                        <div style="border-bottom: 2px solid ${platformColor}; margin-bottom: 8px;">
                            <span style="font-weight: bold; font-size: 14px; color: ${platformColor};">${sourceName}</span>
                            <span style="color: #666;"> → </span>
                            <span style="font-weight: bold; color: #333;">${targetName}</span>
                        </div>
                        <div style="margin-top: 5px;">
                            <span style="font-weight: bold; color: #444;">Hit Songs:</span> 
                            <span style="color: #333;">${value}</span>
                        </div>
                        <div style="margin-top: 5px;">
                            <span style="font-weight: bold; color: #444;">Contribution:</span> 
                            <span style="color: #333;">${percentage}% of ${sourceName}'s hits</span>
                        </div>
                    `;
                    
                    // Position near the link
                    const [x, y] = d3.pointer(event);
                    
                    // Show tooltip with custom content
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.95);
                    
                    tooltip.html(content)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                }
            })
            .on("mouseout", function() {
                // Hide tooltip
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        
        console.log("Links drawn");
        
        // Draw the nodes
        const node = svg.append("g")
            .selectAll(".node")
            .data(graph.nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.x0},${d.y0})`)
            .call(d3.drag()
                .subject(d => d)
                .on("start", function() { this.parentNode.appendChild(this); })
                .on("drag", dragmove));
        
        // Add a rect for each node
        node.append("rect")
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("fill", d => {
                if (d.type === "platform") {
                    return platformColors[d.name] || "#999";
                } else {
                    return "#ececec"; // Light gray for genres
                }
            })
            .attr("stroke", d => d.type === "genre" ? "#ccc" : "none")
            .attr("stroke-width", 1)
            .style("cursor", "move");
        
        // Add text labels for nodes, better centered in the boxes
        node.append("text")
            .attr("x", d => d.type === "platform" ? -10 : (d.x1 - d.x0) + 5)
            .attr("y", d => (d.y1 - d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.type === "platform" ? "end" : "start")
            .text(d => {
                // For platform nodes, show full name
                if (d.type === "platform") {
                    return d.name;
                }
                // For genre nodes, show the full name
                else {
                    return d.name;
                }
            })
            .style("font-size", "12px")
            .style("font-weight", d => d.type === "platform" ? "bold" : "normal")
            .style("fill", d => d.type === "platform" ? "#333" : "#333"); // Dark gray text for platforms, dark for genres
        
        // Add stars based on popularity to the right of the genre name
        node.filter(d => d.type === "genre")
            .append("text")
            .attr("x", d => (d.x1 - d.x0) + 120)
            .attr("y", d => (d.y1 - d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "start")
            .attr("class", "genre-stars")
            .text(d => {
                // Count platforms connected to this genre
                const connectedPlatforms = getSankeyLinks()
                    .filter(link => link && link.target === d.name)
                    .map(link => link.source);
                
                const uniquePlatforms = new Set(connectedPlatforms).size;
                
                if (uniquePlatforms >= 7) return "★★★";
                if (uniquePlatforms >= 5) return "★★";
                return "★";
            })
            .style("fill", "#FFBF00") // Gold color for stars
            .style("font-size", "16px");
        
        console.log("Nodes drawn");
        
        // Add event listeners to highlight connections
        node.on("mouseover", function(event, d) {
            if (!d || !d.id) return;
            
            // Highlight connected links
            link.style("stroke-opacity", l => {
                if (!l || !l.target || !l.target.id) return 0.1;
                return (l.target.id === d.id) ? 1 : 0.1;
            });
            
            // Show tooltip with connected platforms
            const connectedPlatforms = graph.links
                .filter(l => l && l.target && l.target.id === d.id)
                .map(l => l.source && l.source.name ? l.source.name : "Unknown");
            
            const totalHits = graph.links
                .filter(l => l && l.target && l.target.id === d.id)
                .reduce((sum, l) => sum + (l.value || 0), 0);
            
            const content = `
                <div style="border-bottom: 2px solid #333; margin-bottom: 8px;">
                    <span style="font-weight: bold; font-size: 16px; color: #333;">${d.name}</span>
                </div>
                <div style="margin-top: 5px;">
                    <span style="font-weight: bold; color: #444;">Total Hits:</span> 
                    <span style="color: #333;">${totalHits}</span>
                </div>
                <div style="margin-top: 5px;">
                    <span style="font-weight: bold; color: #444;">Platforms:</span> 
                    <span style="color: #333;">${connectedPlatforms.length}</span>
                </div>
                <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 5px;">
                    ${connectedPlatforms.map(platform => 
                        `<span style="background-color: ${platformColors[platform] || '#999'}; 
                                color: white; 
                                padding: 2px 6px; 
                                border-radius: 4px; 
                                font-size: 12px;">
                            ${platform}
                        </span>`
                    ).join('')}
                </div>
            `;
            
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.95);
            
            tooltip.html(content)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        }).on("mouseout", function() {
            // Reset link opacity
            link.style("stroke-opacity", 0.7);
            
            // Hide tooltip
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
        
        // Add hover behavior to platform nodes
        node.filter(d => d.type === "platform").on("mouseover", function(event, d) {
            if (!d || !d.id) return;
            
            // Highlight connected links
            link.style("stroke-opacity", l => {
                if (!l || !l.source || !l.source.id) return 0.1;
                return (l.source.id === d.id) ? 1 : 0.1;
            });
            
            // Show tooltip with connected genres
            const connectedGenres = graph.links
                .filter(l => l && l.source && l.source.id === d.id)
                .map(l => {
                    return {
                        name: l.target && l.target.name ? l.target.name : "Unknown",
                        value: l.value || 0
                    };
                });
            
            const totalHits = connectedGenres.reduce((sum, genre) => sum + genre.value, 0);
            
            // Sort genres by hit count in descending order
            connectedGenres.sort((a, b) => b.value - a.value);
            
            // Get the top 5 genres
            const topGenres = connectedGenres.slice(0, 5);
            
            const platformColor = platformColors[d.name] || "#999";
            
            const content = `
                <div style="border-bottom: 2px solid ${platformColor}; margin-bottom: 8px;">
                    <span style="font-weight: bold; font-size: 16px; color: ${platformColor};">${d.name}</span>
                </div>
                <div style="margin-top: 5px;">
                    <span style="font-weight: bold; color: #444;">Total Hits:</span> 
                    <span style="color: #333;">${totalHits}</span>
                </div>
                <div style="margin-top: 5px;">
                    <span style="font-weight: bold; color: #444;">Genres:</span> 
                    <span style="color: #333;">${connectedGenres.length}</span>
                </div>
                <div style="margin-top: 8px;">
                    <span style="font-weight: bold; color: #444;">Top Genres:</span>
                </div>
                <div style="margin-top: 5px;">
                    ${topGenres.map(genre => {
                        const percentage = ((genre.value / totalHits) * 100).toFixed(1);
                        return `<div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                            <span style="color: #333;">${genre.name}</span>
                            <span style="color: ${platformColor}; font-weight: bold;">${percentage}%</span>
                        </div>`;
                    }).join('')}
                </div>
            `;
            
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.95);
            
            tooltip.html(content)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        }).on("mouseout", function() {
            // Reset link opacity
            link.style("stroke-opacity", 0.7);
            
            // Hide tooltip
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
        
        console.log("Visualization complete");
    } catch (error) {
        console.error("Error in updateVisualization:", error);
        document.getElementById('sankey-chart').innerHTML = "<p>Error: " + error.message + "</p>";
    }
}

// Function to filter data based on the current filter mode
function filterData() {
    console.log("Filtering data with mode:", currentFilterMode);
    
    // Check that the sankeyData exists and has valid nodes and links
    if (!window.sankeyData || !window.sankeyData.nodes || !window.sankeyData.links ||
        !Array.isArray(window.sankeyData.nodes) || !Array.isArray(window.sankeyData.links)) {
        console.error("Invalid sankeyData:", window.sankeyData);
        return { nodes: [], links: [] };
    }
    
    // Start with all platforms
    const platforms = window.sankeyData.nodes.filter(node => node && node.type === "platform");
    let genres = [];
    let links = [];
    
    if (currentFilterMode === "top10") {
        // Get the top 10 genres based on total hit songs
        const genreCounts = {};
        
        // Count total hits for each genre
        if (window.sankeyData && Array.isArray(window.sankeyData.links)) {
            window.sankeyData.links.forEach(link => {
                if (!link || typeof link !== 'object') return; // Skip invalid links
                if (!link.target || typeof link.target !== 'string') return; // Skip links with invalid targets
                if (link.value === undefined || link.value === null) return; // Skip links with missing values
                
                const targetName = link.target;
                genreCounts[targetName] = (genreCounts[targetName] || 0) + (link.value || 0);
            });
            
            console.log("Genre counts calculated:", Object.keys(genreCounts).length, "genres found");
            
            // Sort genres by total hits and take top 10
            const topGenres = Object.entries(genreCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(entry => entry[0]);
            
            console.log("Top genres:", topGenres);
            
            // Get the genre nodes for top genres
            genres = window.sankeyData.nodes.filter(node => 
                node && node.type === "genre" && topGenres.includes(node.name)
            );
            
            // Get links connecting platforms to these genres
            links = window.sankeyData.links.filter(link => 
                link && link.target && topGenres.includes(link.target) && 
                link.source && link.value !== undefined && link.value !== null
            );
        }
    } else if (currentFilterMode === "all") {
        // Include all genres
        genres = window.sankeyData.nodes.filter(node => node && node.type === "genre");
        links = window.sankeyData.links.filter(link => 
            link && link.source && link.target && 
            link.value !== undefined && link.value !== null
        ); // Only include valid links
    } else if (currentFilterMode === "single" && selectedGenre) {
        // Get only the selected genre
        genres = window.sankeyData.nodes.filter(node => 
            node && node.type === "genre" && node.name === selectedGenre
        );
        
        // Get links connecting platforms to this genre
        links = window.sankeyData.links.filter(link => 
            link && link.target === selectedGenre && 
            link.source && link.value !== undefined && link.value !== null
        );
    }
    
    console.log("Filtered data:", platforms.length, "platforms,", genres.length, "genres,", links.length, "links");
    
    return {
        nodes: [...platforms, ...genres],
        links: links
    };
}

// Function to get the raw links from sankeyData
function getSankeyLinks() {
    if (!window.sankeyData || !window.sankeyData.links) {
        console.error("Cannot get links: sankeyData not found or has no links property");
        return [];
    }
    return window.sankeyData.links;
}

// Function to populate the genre filter dropdown
function populateGenreFilter() {
    const filterSelect = document.getElementById("genre-filter");
    if (!filterSelect) {
        console.error("Genre filter element not found");
        return;
    }
    
    console.log("Populating genre filter");
    
    // Get all genres from the nodes list directly
    const genres = window.sankeyData.nodes
        .filter(node => node.type === "genre")
        .map(node => node.name)
        .sort();
    
    console.log("Found", genres.length, "genres for dropdown");
    
    // Clear existing options except the first two default options
    while (filterSelect.options.length > 2) {
        filterSelect.remove(2);
    }
    
    // Add genre options
    genres.forEach(genre => {
        const option = document.createElement("option");
        option.value = genre;
        option.textContent = genre;
        filterSelect.appendChild(option);
    });
    
    // Add event listener to the filter
    filterSelect.addEventListener("change", function() {
        const value = this.value;
        
        if (value === "top10") {
            currentFilterMode = "top10";
            selectedGenre = null;
        } else if (value === "all") {
            currentFilterMode = "all";
            selectedGenre = null;
        } else {
            currentFilterMode = "single";
            selectedGenre = value;
        }
        
        console.log("Filter changed to:", currentFilterMode, selectedGenre);
        
        // Update visualization with the new filter
        updateVisualization();
    });
    
    console.log("Genre filter populated and event listener added");
}

// Initialize the visualization
function initVisualization() {
    console.log("Initializing visualization");
    
    // Populate the genre filter
    populateGenreFilter();
    
    // Set default filter mode
    currentFilterMode = "top10";
    
    // Create the initial visualization
    updateVisualization();
    
    console.log("Visualization initialized");
}

// Function to handle window resize
function handleResize() {
    // Update visualization
    updateVisualization();
}

// Add resize listener
window.addEventListener('resize', handleResize);

// Export functions for use in other files
window.initVisualization = initVisualization;
window.updateVisualization = updateVisualization;

// Function to handle dragging of nodes
function dragmove(event, d) {
    const rectHeight = d.y1 - d.y0;
    
    // Update the node position
    d.y0 = Math.max(0, Math.min(height - rectHeight, event.y));
    d.y1 = d.y0 + rectHeight;
    
    // Update the node position
    d3.select(this).attr("transform", `translate(${d.x0},${d.y0})`);
    
    // Update the links
    d3.select("#sankey-chart svg g").selectAll(".link")
        .attr("d", d3.sankeyLinkHorizontal());
}

console.log("Visualization.js fully loaded"); 