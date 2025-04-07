// Global variables
let allData = [];
let filteredData = [];
let platforms = [];
let genres = [];

// Function to load the data
async function loadData() {
    try {
        // Show loading indicator or message
        d3.select("#sankey-chart")
            .html("<div class='loading'>Loading data...</div>");
        
        // Load the CSV data
        const data = await d3.csv("../../final_df_cleaned.csv");
        
        if (!data || data.length === 0) {
            throw new Error("No data found in CSV file");
        }
        
        console.log("Data loaded, row count:", data.length);
        
        // Process the data
        allData = data.map(d => {
            // Calculate platform hit count
            const platformColumns = [
                "Spotify_Hit", "YouTube_Hit", "TikTok_Hit", 
                "Apple_Music_Hit", "SiriusXM_Hit", "Deezer_Hit", 
                "Amazon_Hit", "Pandora_Hit", "Shazam_Hit"
            ];
            
            // Count the number of platforms where this track is a hit
            const hitCount = platformColumns.filter(platform => d[platform] === "True").length;
            
            // Only include tracks that are hits on at least one platform
            if (hitCount > 0) {
                return {
                    track_name: d.track_name,
                    artists: d.artists,
                    track_genre: d.track_genre || "Unknown",
                    popularity: +d.popularity,
                    platform_hit_count: hitCount,
                    
                    // Platform hit flags
                    Spotify_Hit: d.Spotify_Hit === "True",
                    YouTube_Hit: d.YouTube_Hit === "True",
                    TikTok_Hit: d.TikTok_Hit === "True",
                    Apple_Music_Hit: d.Apple_Music_Hit === "True",
                    SiriusXM_Hit: d.SiriusXM_Hit === "True",
                    Deezer_Hit: d.Deezer_Hit === "True",
                    Amazon_Hit: d.Amazon_Hit === "True",
                    Pandora_Hit: d.Pandora_Hit === "True",
                    Shazam_Hit: d.Shazam_Hit === "True"
                };
            }
            return null;
        }).filter(d => d !== null);
        
        console.log("Processed data, hit tracks:", allData.length);
        
        // Extract unique platforms and genres
        const uniquePlatforms = [
            "Spotify", "YouTube", "TikTok", "Apple Music", 
            "SiriusXM", "Deezer", "Amazon", "Pandora", "Shazam"
        ];
        
        const uniqueGenres = [...new Set(allData.map(d => d.track_genre))].sort();
        
        // Save to global variables
        platforms = uniquePlatforms;
        genres = uniqueGenres;
        filteredData = [...allData];
        
        // Populate filter dropdowns
        populateFilters();
        
        // Update the visualization with the processed data
        if (typeof window.updateVisualization === 'function') {
            window.updateVisualization();
        } else {
            console.error("updateVisualization function is not defined");
        }
        
    } catch (error) {
        console.error("Error loading data:", error);
        d3.select("#sankey-chart")
            .html(`<div class='error'>Error loading data: ${error.message}</div>`);
    }
}

// Function to populate the filter dropdowns
function populateFilters() {
    // Populate platform filter
    d3.select("#platform-filter")
        .selectAll("option.platform-option")
        .data(platforms)
        .enter()
        .append("option")
        .attr("class", "platform-option")
        .attr("value", d => d)
        .text(d => d);
    
    // Populate genre filter
    d3.select("#genre-filter")
        .selectAll("option.genre-option")
        .data(genres)
        .enter()
        .append("option")
        .attr("class", "genre-option")
        .attr("value", d => d)
        .text(d => d);
    
    // Add event listeners to filters
    d3.select("#platform-filter").on("change", filterRawData);
    d3.select("#genre-filter").on("change", filterRawData);
    d3.select("#reset-filters").on("click", resetFilters);
}

// Function to filter the data based on selections
function filterRawData() {
    const selectedPlatform = d3.select("#platform-filter").property("value") || "All Platforms";
    const selectedGenre = d3.select("#genre-filter").property("value") || "All Genres";
    
    // Add null check for allData
    if (!allData || !Array.isArray(allData)) {
        console.error("allData is not available or not an array");
        return;
    }
    
    filteredData = allData.filter(d => {
        // Skip null items
        if (!d) return false;
        
        // Check platform filter
        if (selectedPlatform !== "All Platforms") {
            const platformKey = selectedPlatform.replace(/\s+/g, "_") + "_Hit";
            if (!d[platformKey]) return false;
        }
        
        // Check genre filter
        if (selectedGenre !== "All Genres" && d.track_genre !== selectedGenre) {
            return false;
        }
        
        return true;
    });
    
    // Update visualization with filtered data
    if (typeof window.updateVisualization === 'function') {
        window.updateVisualization();
    } else {
        console.error("updateVisualization function is not defined");
    }
}

// Function to reset all filters
function resetFilters() {
    d3.select("#platform-filter").property("value", "All Platforms");
    d3.select("#genre-filter").property("value", "All Genres");
    
    // Add null check for allData
    if (!allData || !Array.isArray(allData)) {
        console.error("allData is not available or not an array");
        return;
    }
    
    filteredData = [...allData];
    
    // Update visualization with filtered data
    if (typeof window.updateVisualization === 'function') {
        window.updateVisualization();
    } else {
        console.error("updateVisualization function is not defined");
    }
}

// This code starts the visualization when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, starting visualization");
    
    // Initialize the visualization with filtering
    try {
        if (typeof window.initVisualization === 'function') {
            console.log("Calling initVisualization function");
            window.initVisualization();
        } else {
            console.error("initVisualization function not found");
            if (typeof window.updateVisualization === 'function') {
                console.log("Calling updateVisualization function directly");
                window.updateVisualization();
            } else {
                console.error("updateVisualization function not found");
                document.getElementById('sankey-chart').innerHTML = "<p>Error: Visualization functions not found. Please check that visualization.js is properly loaded.</p>";
            }
        }
    } catch (error) {
        console.error("Error initializing visualization:", error);
        document.getElementById('sankey-chart').innerHTML = "<p>Error initializing visualization: " + error.message + "</p>";
    }
    
    // Add error handling for the global window.sankeyData
    if (!window.sankeyData) {
        console.error("window.sankeyData is not defined. Check if data.js is loaded properly.");
        document.getElementById('sankey-chart').innerHTML = "<p>Error: Visualization data not found. Please check that data.js is properly loaded.</p>";
    } else if (!window.sankeyData.nodes || !window.sankeyData.links) {
        console.error("window.sankeyData is missing nodes or links:", window.sankeyData);
        document.getElementById('sankey-chart').innerHTML = "<p>Error: Visualization data is incomplete. Please check data.js for proper structure.</p>";
    } else {
        console.log("Data loaded successfully:", window.sankeyData.nodes.length, "nodes,", window.sankeyData.links.length, "links");
    }
}); 