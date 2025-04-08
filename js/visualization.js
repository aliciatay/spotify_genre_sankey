// Dimensions for the visualization
const margin = { top: 10, right: 40, bottom: 10, left: 40 };
const width = 500 - margin.left - margin.right;
const height = 1008 - margin.top - margin.bottom;

// Immediately log to help with debugging
console.log("Visualization.js loaded, setting up constants");

// Color scales for nodes and links - Updated to Spotify palette
const platformColors = {
    "Amazon": "#F1A277",      // Light coral
    "Apple Music": "#F66EBE", // Pink
    "Deezer": "#6A1AB4",      // Purple
    "YouTube": "#E33810",     // Dark red
    "SiriusXM": "#F1FF48",    // Yellow
    "Spotify": "#1DB954",     // Spotify green
    "TikTok": "#00F7EF",      // Bright teal (changed from dark gray)
    "Pandora": "#19D764",     // Light green
    "Shazam": "#4A90E2"       // Blue
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
    .style("background-color", "rgba(20, 20, 20, 0.9)")
    .style("color", "#ffffff")
    .style("border", "1px solid #333")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("box-shadow", "0 0 10px rgba(0,0,0,0.3)")
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
        
        // Create the Sankey diagram generator with smaller node size and padding for narrower layout
        const sankey = d3.sankey()
            .nodeWidth(15)  // Smaller node width for compact layout
            .nodePadding(8) // Decreased padding for better fit in 500px width
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
                // If it's a platform (platforms are source nodes)
                if (platformColors[sourceName]) {
                    return platformColors[sourceName];
                }
                
                // If it's a genre (source), use a gradient effect based on the target
                if (d.target && platformColors[d.target.name]) {
                    return platformColors[d.target.name];
                }
                
                // Default color
                return "#666";
            })
            .attr("stroke-width", d => Math.max(1, d.width))
            .style("fill", "none")
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                // Highlight the current link
                d3.select(this)
                    .attr("stroke-opacity", 1)
                    .attr("stroke-width", d => Math.max(2, d.width + 1));
                
                // Update tooltip content
                tooltip.html(() => {
                    // Display appropriate context based on the link direction
                    const sourceName = d.source.name;
                    const targetName = d.target.name;
                    let content = `<h3 style="color:#1DB954;">${sourceName} → ${targetName}</h3>`;
                    content += `<p>Number of Tracks: ${d.value}</p>`;
                    return content;
                })
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px")
                .style("opacity", 1);
            })
            .on("mouseout", function() {
                // Restore original link styling
                d3.select(this)
                    .attr("stroke-opacity", 0.7)
                    .attr("stroke-width", d => Math.max(1, d.width));
                
                // Hide tooltip
                tooltip.style("opacity", 0);
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
        
        // Create a clearer distinction between platform and genre nodes
        // Improve how platform nodes and labels are created and positioned
        // Add platform names directly attached to their corresponding rectangles

        // When creating the node rectangles, add a data-name attribute to help with identification
        node.append("rect")
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("fill", d => {
                if (d.type === "platform") {
                    return platformColors[d.name] || "#999";
                } else {
                    return "#141413"; // Dark gray for genres
                }
            })
            .attr("stroke", d => d.type === "genre" ? "#333" : "none")
            .attr("stroke-width", 1)
            .attr("data-name", d => d.name) // Add node name as data attribute for debugging
            .style("cursor", "move");

        // First, completely remove all existing text elements to start fresh
        node.selectAll("text").remove();

        // For platform nodes, create text elements that are directly tied to each node's group
        node.filter(d => d.type === "platform")
            .append("text")
            .attr("x", d => -10) // Position to the left of platform nodes (relative to the group's position)
            .attr("y", d => (d.y1 - d.y0) / 2) // Center vertically within the node
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            .text(d => d.name) // Use the actual node name
            .style("fill", "#ffffff")
            .style("font-size", "9px")
            .style("font-weight", "bold");

        // For genre nodes, create text elements directly tied to each node's group
        node.filter(d => d.type === "genre")
            .append("text")
            .attr("x", d => -6) // Position text to the left of the node
            .attr("y", d => (d.y1 - d.y0) / 2) // Center vertically
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            .text(d => truncateText(d.name, 9))
            .style("fill", "#ffffff")
            .style("font-size", "9px");

        // Add stars to the left of genre name
        node.filter(d => d.type === "genre")
            .append("text")
            .attr("x", d => -30) // Position stars to the left of the genre name
            .attr("y", d => (d.y1 - d.y0) / 2) // Center vertically
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
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
            .style("fill", "#F1FF48")
            .style("font-size", "12px");
        
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
                <div style="border-bottom: 2px solid #1DB954; margin-bottom: 8px;">
                    <span style="font-weight: bold; font-size: 16px; color: #1DB954;">${d.name}</span>
                </div>
                <div style="margin-top: 5px;">
                    <span style="font-weight: bold; color: #ffffff;">Total Hits:</span> 
                    <span style="color: #ffffff;">${totalHits}</span>
                </div>
                <div style="margin-top: 5px;">
                    <span style="font-weight: bold; color: #ffffff;">Platforms:</span> 
                    <span style="color: #ffffff;">${connectedPlatforms.length}</span>
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
                    <span style="font-weight: bold; color: #ffffff;">Total Hits:</span> 
                    <span style="color: #ffffff;">${totalHits}</span>
                </div>
                <div style="margin-top: 5px;">
                    <span style="font-weight: bold; color: #ffffff;">Genres:</span> 
                    <span style="color: #ffffff;">${connectedGenres.length}</span>
                </div>
                <div style="margin-top: 8px;">
                    <span style="font-weight: bold; color: #ffffff;">Top Genres:</span>
                </div>
                <div style="margin-top: 5px;">
                    ${topGenres.map(genre => {
                        const percentage = ((genre.value / totalHits) * 100).toFixed(1);
                        return `<div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                            <span style="color: #ffffff;">${genre.name}</span>
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
    // Default filter mode is top10
    const originalData = getSankeyData();
    
    if (!originalData || !originalData.nodes || !originalData.links) {
        console.error("No data to filter");
        return null;
    }
    
    // Clone data for filtering
    const filteredData = {
        nodes: [...originalData.nodes],
        links: [...originalData.links]
    };
    
    if (currentFilterMode === "top10") {
        // Get the top 10 genres by hit count
        const genreCounts = new Map();
        
        // Count hits per genre
        originalData.links.forEach(link => {
            const targetNode = originalData.nodes.find(n => n.name === link.target);
            if (targetNode && targetNode.type === "genre") {
                const currentCount = genreCounts.get(link.target) || 0;
                genreCounts.set(link.target, currentCount + link.value);
            }
        });
        
        // Convert to array and sort
        const sortedGenres = [...genreCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10) // Take only top 10
            .map(entry => entry[0]);
        
        // Filter nodes to include only platforms and top 10 genres
        filteredData.nodes = originalData.nodes.filter(node => 
            node.type === "platform" || 
            (node.type === "genre" && sortedGenres.includes(node.name))
        );
        
        // Get node names for filtering links
        const nodeNames = filteredData.nodes.map(node => node.name);
        
        // Filter links to include only connections to/from kept nodes
        filteredData.links = originalData.links.filter(link => 
            nodeNames.includes(link.source) && nodeNames.includes(link.target)
        );
    }
    else if (selectedGenre) {
        // Filter for a specific genre
        // Keep all platforms and the selected genre
        filteredData.nodes = originalData.nodes.filter(node => 
            node.type === "platform" || (node.type === "genre" && node.name === selectedGenre)
        );
        
        // Get node names for filtering links
        const nodeNames = filteredData.nodes.map(node => node.name);
        
        // Filter links to include only connections to/from kept nodes
        filteredData.links = originalData.links.filter(link => 
            nodeNames.includes(link.source) && nodeNames.includes(link.target)
        );
    }
    // 'all' filter option removed as it's no longer needed
    
    return filteredData;
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

// Function to get the sankeyData from the global window object
function getSankeyData() {
    if (!window.sankeyData || !window.sankeyData.nodes || !window.sankeyData.links) {
        console.error("No valid sankeyData found in window object");
        document.getElementById('sankey-chart').innerHTML = "<p>Error: No valid data available for visualization</p>";
        return null;
    }
    return window.sankeyData;
}

console.log("Visualization.js fully loaded"); 