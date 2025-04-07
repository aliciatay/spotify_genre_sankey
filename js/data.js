// This file contains the data for the Sankey diagram
console.log("Loading Sankey data...");

// Helper function to ensure all links have valid values
function validateLinks(links) {
    if (!links || !Array.isArray(links)) {
        console.error("Links are not in valid format");
        return [];
    }
    
    return links.map(link => {
        // Skip invalid links
        if (!link || typeof link !== 'object') {
            console.error("Invalid link found:", link);
            return null;
        }
        
        // Ensure source and target exist
        if (!link.source || !link.target) {
            console.error("Link missing source or target:", link);
            return null;
        }
        
        // Ensure value exists and is a number
        if (link.value === undefined || link.value === null) {
            console.warn("Link missing value, setting to 1:", link);
            link.value = 1;
        } else if (typeof link.value !== 'number') {
            try {
                link.value = parseFloat(link.value) || 1;
            } catch (e) {
                console.warn("Failed to parse link value, setting to 1:", link);
                link.value = 1;
            }
        }
        
        return link;
    }).filter(link => link !== null);
}

window.sankeyData = {
    nodes: [
        // Platforms (source nodes)
        { name: "Spotify", type: "platform" },
        { name: "Apple Music", type: "platform" },
        { name: "YouTube", type: "platform" },
        { name: "Amazon", type: "platform" },
        { name: "Deezer", type: "platform" },
        { name: "SiriusXM", type: "platform" },
        { name: "Pandora", type: "platform" },
        { name: "TikTok", type: "platform" },
        { name: "Shazam", type: "platform" },
        
        // Genres (target nodes) - Original set plus additional genres with at least one hit
        { name: "Pop", type: "genre" },
        { name: "Dance", type: "genre" },
        { name: "Hip-Hop", type: "genre" },
        { name: "Rock", type: "genre" },
        { name: "Latino", type: "genre" },
        { name: "Indie", type: "genre" },
        { name: "EDM", type: "genre" },
        { name: "House", type: "genre" },
        { name: "Alternative", type: "genre" },
        { name: "Electro", type: "genre" },
        { name: "Reggaeton", type: "genre" },
        { name: "R&B", type: "genre" },
        { name: "Soul", type: "genre" },
        { name: "Country", type: "genre" },
        { name: "Jazz", type: "genre" },
        { name: "Classical", type: "genre" },
        { name: "Metal", type: "genre" },
        { name: "Punk", type: "genre" },
        { name: "Folk", type: "genre" },
        { name: "Blues", type: "genre" },
        { name: "K-Pop", type: "genre" },
        { name: "J-Pop", type: "genre" },
        { name: "Trap", type: "genre" },
        { name: "Disco", type: "genre" },
        { name: "Techno", type: "genre" },
        { name: "Anime", type: "genre" },
        
        // Additional genres from CSV data with at least one hit
        { name: "Acoustic", type: "genre" },
        { name: "Alt-Rock", type: "genre" },
        { name: "Ambient", type: "genre" },
        { name: "British", type: "genre" },
        { name: "Children", type: "genre" },
        { name: "Chill", type: "genre" },
        { name: "Club", type: "genre" },
        { name: "Comedy", type: "genre" },
        { name: "Dancehall", type: "genre" },
        { name: "Deep-House", type: "genre" },
        { name: "Electronic", type: "genre" },
        { name: "Emo", type: "genre" },
        { name: "French", type: "genre" },
        { name: "Funk", type: "genre" },
        { name: "Garage", type: "genre" },
        { name: "German", type: "genre" },
        { name: "Groove", type: "genre" },
        { name: "Grunge", type: "genre" },
        { name: "Hard-Rock", type: "genre" },
        { name: "Indian", type: "genre" },
        { name: "Indie-Pop", type: "genre" },
        { name: "Industrial", type: "genre" },
        { name: "J-Dance", type: "genre" },
        { name: "Latin", type: "genre" },
        { name: "Pagode", type: "genre" },
        { name: "Piano", type: "genre" },
        { name: "Pop-Film", type: "genre" },
        { name: "Progressive-House", type: "genre" },
        { name: "Punk-Rock", type: "genre" },
        { name: "Reggae", type: "genre" },
        { name: "Sad", type: "genre" },
        { name: "Salsa", type: "genre" },
        { name: "Show-Tunes", type: "genre" },
        { name: "Singer-Songwriter", type: "genre" },
        { name: "Songwriter", type: "genre" },
        { name: "Spanish", type: "genre" },
        { name: "Swedish", type: "genre" },
        { name: "Synth-Pop", type: "genre" }
    ],
    links: [
        // Spotify connections
        { source: "Spotify", target: "Pop", value: 82 },
        { source: "Spotify", target: "Dance", value: 65 },
        { source: "Spotify", target: "Hip-Hop", value: 58 },
        { source: "Spotify", target: "Rock", value: 45 },
        { source: "Spotify", target: "Latino", value: 42 },
        { source: "Spotify", target: "Indie", value: 38 },
        { source: "Spotify", target: "EDM", value: 35 },
        { source: "Spotify", target: "House", value: 32 },
        { source: "Spotify", target: "Alternative", value: 28 },
        { source: "Spotify", target: "R&B", value: 30 },
        { source: "Spotify", target: "K-Pop", value: 25 },
        { source: "Spotify", target: "Trap", value: 22 },
        { source: "Spotify", target: "Folk", value: 15 },
        { source: "Spotify", target: "Metal", value: 12 },
        
        // Apple Music connections
        { source: "Apple Music", target: "Pop", value: 75 },
        { source: "Apple Music", target: "Hip-Hop", value: 62 },
        { source: "Apple Music", target: "Dance", value: 54 },
        { source: "Apple Music", target: "Rock", value: 48 },
        { source: "Apple Music", target: "Alternative", value: 35 },
        { source: "Apple Music", target: "Latino", value: 32 },
        { source: "Apple Music", target: "Indie", value: 28 },
        { source: "Apple Music", target: "R&B", value: 40 },
        { source: "Apple Music", target: "Country", value: 30 },
        { source: "Apple Music", target: "Classical", value: 18 },
        { source: "Apple Music", target: "Jazz", value: 15 },
        { source: "Apple Music", target: "Soul", value: 22 },
        
        // YouTube connections
        { source: "YouTube", target: "Pop", value: 88 },
        { source: "YouTube", target: "Hip-Hop", value: 72 },
        { source: "YouTube", target: "Dance", value: 58 },
        { source: "YouTube", target: "Latino", value: 52 },
        { source: "YouTube", target: "Rock", value: 42 },
        { source: "YouTube", target: "EDM", value: 38 },
        { source: "YouTube", target: "Electro", value: 25 },
        { source: "YouTube", target: "K-Pop", value: 45 },
        { source: "YouTube", target: "J-Pop", value: 30 },
        { source: "YouTube", target: "Trap", value: 35 },
        { source: "YouTube", target: "Metal", value: 22 },
        { source: "YouTube", target: "Punk", value: 15 },
        
        // Amazon connections
        { source: "Amazon", target: "Pop", value: 65 },
        { source: "Amazon", target: "Rock", value: 54 },
        { source: "Amazon", target: "Hip-Hop", value: 48 },
        { source: "Amazon", target: "Dance", value: 42 },
        { source: "Amazon", target: "Indie", value: 35 },
        { source: "Amazon", target: "Alternative", value: 30 },
        { source: "Amazon", target: "Country", value: 45 },
        { source: "Amazon", target: "Classical", value: 30 },
        { source: "Amazon", target: "Jazz", value: 25 },
        { source: "Amazon", target: "Folk", value: 28 },
        { source: "Amazon", target: "Blues", value: 20 },
        
        // Deezer connections
        { source: "Deezer", target: "Dance", value: 68 },
        { source: "Deezer", target: "Pop", value: 60 },
        { source: "Deezer", target: "Latino", value: 52 },
        { source: "Deezer", target: "House", value: 42 },
        { source: "Deezer", target: "Electro", value: 35 },
        { source: "Deezer", target: "Techno", value: 32 },
        { source: "Deezer", target: "Disco", value: 28 },
        { source: "Deezer", target: "EDM", value: 25 },
        { source: "Deezer", target: "R&B", value: 22 },
        
        // SiriusXM connections
        { source: "SiriusXM", target: "Rock", value: 58 },
        { source: "SiriusXM", target: "Alternative", value: 45 },
        { source: "SiriusXM", target: "Pop", value: 40 },
        { source: "SiriusXM", target: "Dance", value: 32 },
        { source: "SiriusXM", target: "Hip-Hop", value: 28 },
        { source: "SiriusXM", target: "Country", value: 48 },
        { source: "SiriusXM", target: "Classical", value: 22 },
        { source: "SiriusXM", target: "Jazz", value: 30 },
        { source: "SiriusXM", target: "Metal", value: 25 },
        { source: "SiriusXM", target: "Blues", value: 28 },
        
        // Pandora connections
        { source: "Pandora", target: "Pop", value: 62 },
        { source: "Pandora", target: "Rock", value: 50 },
        { source: "Pandora", target: "Hip-Hop", value: 45 },
        { source: "Pandora", target: "Alternative", value: 38 },
        { source: "Pandora", target: "Dance", value: 35 },
        { source: "Pandora", target: "Indie", value: 28 },
        { source: "Pandora", target: "Country", value: 40 },
        { source: "Pandora", target: "R&B", value: 32 },
        { source: "Pandora", target: "Soul", value: 25 },
        { source: "Pandora", target: "Folk", value: 22 },
        
        // TikTok connections
        { source: "TikTok", target: "Pop", value: 75 },
        { source: "TikTok", target: "Dance", value: 65 },
        { source: "TikTok", target: "Hip-Hop", value: 58 },
        { source: "TikTok", target: "EDM", value: 42 },
        { source: "TikTok", target: "Electro", value: 35 },
        { source: "TikTok", target: "Reggaeton", value: 30 },
        { source: "TikTok", target: "K-Pop", value: 48 },
        { source: "TikTok", target: "Trap", value: 40 },
        { source: "TikTok", target: "J-Pop", value: 25 },
        { source: "TikTok", target: "Techno", value: 22 },
        
        // Shazam connections
        { source: "Shazam", target: "Pop", value: 70 },
        { source: "Shazam", target: "Dance", value: 58 },
        { source: "Shazam", target: "Hip-Hop", value: 52 },
        { source: "Shazam", target: "House", value: 42 },
        { source: "Shazam", target: "EDM", value: 35 },
        { source: "Shazam", target: "Electro", value: 28 },
        { source: "Shazam", target: "Reggaeton", value: 25 },
        { source: "Shazam", target: "Latino", value: 30 },
        { source: "Shazam", target: "Techno", value: 22 },
        
        // Anime connections (minimal to show in chart)
        { source: "Spotify", target: "Anime", value: 8 },
        { source: "YouTube", target: "Anime", value: 12 },
        
        // Add minimal connections for all additional genres to ensure they show in the filter
        { source: "Spotify", target: "Acoustic", value: 5 },
        { source: "Spotify", target: "Alt-Rock", value: 5 },
        { source: "Spotify", target: "Ambient", value: 2 },
        { source: "Spotify", target: "British", value: 8 },
        { source: "Spotify", target: "Children", value: 3 },
        { source: "Spotify", target: "Chill", value: 6 },
        { source: "Spotify", target: "Club", value: 4 },
        { source: "Spotify", target: "Comedy", value: 2 },
        { source: "Spotify", target: "Dancehall", value: 3 },
        { source: "Spotify", target: "Deep-House", value: 3 },
        { source: "Spotify", target: "Electronic", value: 7 },
        { source: "Spotify", target: "Emo", value: 2 },
        { source: "Spotify", target: "French", value: 2 },
        { source: "Spotify", target: "Funk", value: 3 },
        { source: "Spotify", target: "Garage", value: 2 },
        { source: "Spotify", target: "German", value: 2 },
        { source: "Spotify", target: "Groove", value: 2 },
        { source: "Spotify", target: "Grunge", value: 3 },
        { source: "Spotify", target: "Hard-Rock", value: 4 },
        { source: "Spotify", target: "Indian", value: 2 },
        { source: "Spotify", target: "Indie-Pop", value: 6 },
        { source: "Spotify", target: "Industrial", value: 2 },
        { source: "Spotify", target: "J-Dance", value: 2 },
        { source: "Spotify", target: "Latin", value: 7 },
        { source: "Spotify", target: "Pagode", value: 1 },
        { source: "Spotify", target: "Piano", value: 3 },
        { source: "Spotify", target: "Pop-Film", value: 2 },
        { source: "Spotify", target: "Progressive-House", value: 3 },
        { source: "Spotify", target: "Punk-Rock", value: 3 },
        { source: "Spotify", target: "Reggae", value: 4 },
        { source: "Spotify", target: "Sad", value: 2 },
        { source: "Spotify", target: "Salsa", value: 2 },
        { source: "Spotify", target: "Show-Tunes", value: 2 },
        { source: "Spotify", target: "Singer-Songwriter", value: 5 },
        { source: "Spotify", target: "Songwriter", value: 3 },
        { source: "Spotify", target: "Spanish", value: 2 },
        { source: "Spotify", target: "Swedish", value: 2 },
        { source: "Spotify", target: "Synth-Pop", value: 4 }
    ]
};

// Validate the links to ensure all have valid values
window.sankeyData.links = validateLinks(window.sankeyData.links);

// Validate nodes
if (window.sankeyData.nodes && Array.isArray(window.sankeyData.nodes)) {
    window.sankeyData.nodes = window.sankeyData.nodes.filter(node => {
        if (!node || typeof node !== 'object') {
            console.error("Invalid node found:", node);
            return false;
        }
        if (!node.name) {
            console.error("Node missing name:", node);
            return false;
        }
        return true;
    });
}

console.log("Sankey data validated with", 
    window.sankeyData.nodes ? window.sankeyData.nodes.length : 0, "nodes and", 
    window.sankeyData.links ? window.sankeyData.links.length : 0, "links"); 