import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface SearchResult {
    title: string;
    link: string;
    snippet: string;
    address?: string;
    display_name: string;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("query");

        if (!query || query.trim().length < 3) {
            return NextResponse.json({ results: [] });
        }

        // Get Serper API key from environment
        const serperApiKey = process.env.SERPER_API_KEY;

        if (!serperApiKey) {
            console.error("SERPER_API_KEY is not configured");
            return NextResponse.json({
                results: [],
                error: "Serper API key not configured. Please add SERPER_API_KEY to your .env.local file.",
            });
        }

        // Build search query specifically for venue/stadium locations
        const searchQuery = `${query} address location`;

        // Call Serper Places API for better address results
        const serperResponse = await fetch("https://google.serper.dev/places", {
            method: "POST",
            headers: {
                "X-API-KEY": serperApiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                q: query,
                num: 10, // Number of results
            }),
        });

        if (!serperResponse.ok) {
            const errorText = await serperResponse.text();
            console.error("Serper API Error:", errorText);
            return NextResponse.json({
                results: [],
                error: "Failed to fetch address data. Please check your Serper API key.",
            });
        }

        const serperData = await serperResponse.json();

        // Extract and format results from Places API
        const results: SearchResult[] = [];

        // Process places results
        if (serperData.places) {
            for (const place of serperData.places.slice(0, 8)) {
                const title = place.title || "Unknown Venue";
                const address = place.address || place.location || "Address not available";
                const snippet = place.description || place.snippet || `${title} located at ${address}`;

                results.push({
                    title: title,
                    link: place.website || place.link || "#",
                    snippet: snippet,
                    address: address,
                    display_name: `${title}, ${address}`,
                });
            }
        }

        // Fallback to organic results if no places
        if (results.length === 0 && serperData.organic) {
            for (const item of serperData.organic.slice(0, 8)) {
                // Extract address from snippet or title
                let address = "";
                const snippet = item.snippet || "";
                const title = item.title || "";

                // Try to find address patterns in the snippet
                // Common patterns: "123 Main St, City, State ZIP"
                const addressPatterns = [
                    /[\d]+\s+[\w\s]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Court|Ct|Plaza|Park)[\w\s,]+[A-Z]{2}\s+[\d]{5}/,
                    /[\w\s]+,\s*[A-Z]{2}\s+[\d]{5}/,
                    /[\w\s]+,\s*[\w\s]+,\s*[A-Z]{2}/,
                ];

                for (const pattern of addressPatterns) {
                    const match = snippet.match(pattern);
                    if (match) {
                        address = match[0].trim();
                        break;
                    }
                }

                // If no address in snippet, try knowledge graph if available
                if (!address && serperData.knowledgeGraph) {
                    const kg = serperData.knowledgeGraph;
                    if (kg.address) {
                        address = kg.address;
                    } else if (kg.location) {
                        address = kg.location;
                    } else if (kg.description) {
                        // Try to extract from description
                        for (const pattern of addressPatterns) {
                            const match = kg.description.match(pattern);
                            if (match) {
                                address = match[0].trim();
                                break;
                            }
                        }
                    }
                }

                // Build display name
                const cleanTitle = title
                    .split("-")[0]
                    .split("|")[0]
                    .split("–")[0]
                    .trim();
                const locationInfo =
                    serperData.knowledgeGraph?.location ||
                    serperData.knowledgeGraph?.description
                        ?.split(/[\d]/)[0]
                        ?.trim();

                let displayName = cleanTitle;
                if (address) {
                    displayName = `${cleanTitle} - ${locationInfo || "Venue"} | Address: ${address}`;
                } else if (locationInfo) {
                    displayName = `${cleanTitle} - ${locationInfo}`;
                }

                results.push({
                    title: cleanTitle,
                    link: item.link,
                    snippet: snippet,
                    address: address || locationInfo || "Address not found",
                    display_name: address
                        ? `${cleanTitle}, ${address}`
                        : cleanTitle,
                });
            }
        }

        // Add knowledge graph result if available and not already included
        if (
            serperData.knowledgeGraph &&
            !results.some((r) => r.title === serperData.knowledgeGraph.title)
        ) {
            const kg = serperData.knowledgeGraph;
            results.unshift({
                title: kg.title || query,
                link: kg.descriptionLink || kg.website || "#",
                snippet: kg.description || "",
                address:
                    kg.address ||
                    kg.location ||
                    "Verified venue",
                display_name:
                    kg.address || kg.location
                        ? `${kg.title || query}, ${kg.address || kg.location}`
                        : kg.title || query,
            });
        }

        return NextResponse.json({
            results: results.slice(0, 6), // Limit to 6 results
            query: query,
        });
    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json(
            {
                results: [],
                error: "Internal server error while searching for address",
            },
            { status: 500 },
        );
    }
}
