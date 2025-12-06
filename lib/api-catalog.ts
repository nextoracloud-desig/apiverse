export type PricingType = "Free" | "Freemium" | "Paid" | "Trial";

export interface ApiRecord {
    id: string;
    slug: string;
    name: string;
    category: string;
    subCategory?: string;
    tags: string[];
    pricingType: PricingType;
    regionSupport?: string[];
    dxScore?: number;
    popularityScore?: number;
    logoSymbol: string;
    logoUrl?: string;
    shortDescription: string;
    longDescription: string;
    docsUrl: string;
    providerUrl: string;
    providerName: string;
    confidenceScore: number;
    rating: number;
    reviewCount: number;
    uptimeSla: string;
    sampleEndpointUrl: string;
    playgroundExampleResponse: any;
    isFeatured?: boolean;
    isNew?: boolean;
    planNote?: string;
    affiliateUrl?: string;
    referralNote?: string;
}

export const API_CATALOG: ApiRecord[] = [
    // AI
    {
        id: "api_openai_gpt4",
        slug: "openai-gpt4",
        name: "OpenAI GPT-4",
        category: "AI",
        subCategory: "LLM",
        tags: ["ai", "ml", "nlp", "chat", "generative"],
        pricingType: "Paid",
        regionSupport: ["global"],
        dxScore: 95,
        popularityScore: 99,
        logoSymbol: "OA",
        shortDescription: "Most advanced AI model for text generation and reasoning.",
        longDescription: "GPT-4 is a large multimodal model (accepting image and text inputs, emitting text outputs) that, while less capable than humans in many real-world scenarios, exhibits human-level performance on various professional and academic benchmarks.",
        docsUrl: "https://platform.openai.com/docs",
        providerUrl: "https://openai.com",
        providerName: "OpenAI",
        confidenceScore: 99,
        rating: 4.9,
        reviewCount: 12500,
        uptimeSla: "99.9%",
        sampleEndpointUrl: "POST https://api.openai.com/v1/chat/completions",
        playgroundExampleResponse: {
            "id": "chatcmpl-123",
            "object": "chat.completion",
            "created": 1677652288,
            "model": "gpt-4",
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": "Hello! How can I help you today?"
                },
                "finish_reason": "stop"
            }]
        },
        isFeatured: true
    },
    {
        id: "api_anthropic_claude",
        slug: "anthropic-claude",
        name: "Anthropic Claude 3",
        category: "AI",
        subCategory: "LLM",
        tags: ["ai", "ml", "nlp", "chat", "reasoning"],
        pricingType: "Paid",
        regionSupport: ["global"],
        dxScore: 92,
        popularityScore: 90,
        logoSymbol: "AN",
        shortDescription: "Next-generation AI assistant for tasks at any scale.",
        longDescription: "Claude 3 offers industry-leading performance, intelligence, speed, and cost-efficiency. It excels at complex reasoning, coding, and nuanced content creation.",
        docsUrl: "https://docs.anthropic.com",
        providerUrl: "https://anthropic.com",
        providerName: "Anthropic",
        confidenceScore: 98,
        rating: 4.8,
        reviewCount: 8400,
        uptimeSla: "99.9%",
        sampleEndpointUrl: "POST https://api.anthropic.com/v1/messages",
        playgroundExampleResponse: {
            "id": "msg_123",
            "type": "message",
            "role": "assistant",
            "content": [{ "type": "text", "text": "Hello! I'm Claude." }]
        },
        isNew: true
    },
    {
        id: "api_stability_ai",
        slug: "stability-ai",
        name: "Stability AI",
        category: "AI",
        subCategory: "Image Gen",
        tags: ["ai", "image-generation", "stable-diffusion"],
        pricingType: "Paid",
        regionSupport: ["global"],
        dxScore: 88,
        popularityScore: 85,
        logoSymbol: "SA",
        shortDescription: "Generate high-quality images with Stable Diffusion.",
        longDescription: "Generate, edit, and upscale images using the latest Stable Diffusion models. Perfect for creative applications and media generation.",
        docsUrl: "https://platform.stability.ai/docs/api-reference",
        providerUrl: "https://stability.ai",
        providerName: "Stability AI",
        confidenceScore: 96,
        rating: 4.7,
        reviewCount: 5200,
        uptimeSla: "99.5%",
        sampleEndpointUrl: "POST https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
        playgroundExampleResponse: {
            "artifacts": [{ "base64": "iVBORw0KGgoAAAANSUhEUg...", "seed": 12345, "finishReason": "SUCCESS" }]
        }
    },
    // Finance
    {
        id: "api_stripe",
        slug: "stripe",
        name: "Stripe",
        category: "Finance",
        subCategory: "Payments",
        tags: ["payments", "billing", "finance", "cards"],
        pricingType: "Freemium",
        regionSupport: ["global", "us", "eu"],
        dxScore: 99,
        popularityScore: 99,
        logoSymbol: "ST",
        shortDescription: "Financial infrastructure platform for the internet.",
        longDescription: "Stripe is a suite of payment APIs that powers commerce for online businesses of all sizes, including fraud prevention, and subscription management.",
        docsUrl: "https://stripe.com/docs/api",
        providerUrl: "https://stripe.com",
        providerName: "Stripe",
        confidenceScore: 99,
        rating: 4.9,
        reviewCount: 25000,
        uptimeSla: "99.999%",
        sampleEndpointUrl: "POST https://api.stripe.com/v1/charges",
        playgroundExampleResponse: {
            "id": "ch_12345",
            "object": "charge",
            "amount": 2000,
            "currency": "usd",
            "captured": true,
            "status": "succeeded"
        },
        isFeatured: true
    },
    {
        id: "api_plaid",
        slug: "plaid",
        name: "Plaid",
        category: "Finance",
        subCategory: "Banking",
        tags: ["banking", "finance", "auth", "identity"],
        pricingType: "Paid",
        regionSupport: ["us", "eu", "canada"],
        dxScore: 94,
        popularityScore: 92,
        logoSymbol: "PL",
        shortDescription: "Connect with users' bank accounts.",
        longDescription: "Plaid enables applications to connect with users' bank accounts to access transaction history, verify identity, and initiate payments.",
        docsUrl: "https://plaid.com/docs",
        providerUrl: "https://plaid.com",
        providerName: "Plaid",
        confidenceScore: 97,
        rating: 4.6,
        reviewCount: 9800,
        uptimeSla: "99.95%",
        sampleEndpointUrl: "POST https://sandbox.plaid.com/link/token/create",
        playgroundExampleResponse: {
            "link_token": "link-sandbox-12345",
            "expiration": "2024-01-01T00:00:00Z",
            "request_id": "req_123"
        }
    },
    // Weather
    {
        id: "api_weatherapi",
        slug: "weatherapi",
        name: "WeatherAPI",
        category: "Weather",
        subCategory: "Forecast",
        tags: ["weather", "climate", "forecast", "realtime"],
        pricingType: "Freemium",
        regionSupport: ["global"],
        dxScore: 90,
        popularityScore: 85,
        logoSymbol: "WA",
        shortDescription: "Realtime, forecast, and historical weather data.",
        longDescription: "Access current weather, forecast, history, marine, and air quality data via JSON/XML API. Easy to use and reliable.",
        docsUrl: "https://www.weatherapi.com/docs",
        providerUrl: "https://www.weatherapi.com",
        providerName: "WeatherAPI.com",
        confidenceScore: 95,
        rating: 4.6,
        reviewCount: 4500,
        uptimeSla: "99.9%",
        sampleEndpointUrl: "GET https://api.weatherapi.com/v1/current.json?q=London",
        playgroundExampleResponse: {
            "location": { "name": "London", "country": "UK" },
            "current": { "temp_c": 15.0, "condition": { "text": "Partly cloudy" } }
        }
    },
    {
        id: "api_openweathermap",
        slug: "openweathermap",
        name: "OpenWeatherMap",
        category: "Weather",
        subCategory: "Forecast",
        tags: ["weather", "forecast", "maps"],
        pricingType: "Freemium",
        regionSupport: ["global"],
        dxScore: 92,
        popularityScore: 95,
        logoSymbol: "OW",
        shortDescription: "Weather forecasts, nowcasts and history.",
        longDescription: "One of the most popular weather APIs, providing current weather data, forecasts, and historical data for any location on Earth.",
        docsUrl: "https://openweathermap.org/api",
        providerUrl: "https://openweathermap.org",
        providerName: "OpenWeather",
        confidenceScore: 96,
        rating: 4.7,
        reviewCount: 15000,
        uptimeSla: "99.9%",
        sampleEndpointUrl: "GET https://api.openweathermap.org/data/2.5/weather?q=London",
        playgroundExampleResponse: {
            "weather": [{ "main": "Clouds", "description": "scattered clouds" }],
            "main": { "temp": 280.32, "humidity": 81 }
        }
    },
    // Communication
    {
        id: "api_twilio_sms",
        slug: "twilio-sms",
        name: "Twilio SMS",
        category: "Communication",
        subCategory: "SMS",
        tags: ["sms", "messaging", "phone", "mobile"],
        pricingType: "Paid",
        regionSupport: ["global"],
        dxScore: 98,
        popularityScore: 98,
        logoSymbol: "TW",
        shortDescription: "Send and receive SMS messages globally.",
        longDescription: "Twilio's Programmable SMS API helps you add robust messaging capabilities to your applications, enabling you to send and receive SMS messages globally.",
        docsUrl: "https://www.twilio.com/docs/sms",
        providerUrl: "https://www.twilio.com",
        providerName: "Twilio",
        confidenceScore: 99,
        rating: 4.8,
        reviewCount: 32000,
        uptimeSla: "99.99%",
        sampleEndpointUrl: "POST https://api.twilio.com/2010-04-01/Accounts/AC.../Messages.json",
        playgroundExampleResponse: {
            "sid": "SM...",
            "status": "queued"
        },
        isFeatured: true
    },
    {
        id: "api_sendgrid",
        slug: "sendgrid",
        name: "Twilio SendGrid",
        category: "Communication",
        subCategory: "Email",
        tags: ["email", "marketing", "transactional"],
        pricingType: "Freemium",
        regionSupport: ["global"],
        dxScore: 95,
        popularityScore: 96,
        logoSymbol: "SG",
        shortDescription: "Cloud-based email delivery platform.",
        longDescription: "SendGrid provides a reliable platform for transactional and marketing email delivery, ensuring your emails reach the inbox.",
        docsUrl: "https://docs.sendgrid.com/api-reference",
        providerUrl: "https://sendgrid.com",
        providerName: "Twilio SendGrid",
        confidenceScore: 97,
        rating: 4.7,
        reviewCount: 18000,
        uptimeSla: "99.95%",
        sampleEndpointUrl: "POST https://api.sendgrid.com/v3/mail/send",
        playgroundExampleResponse: {
            "status": "accepted",
            "message": "Email queued for delivery"
        }
    },
    // Crypto
    {
        id: "api_coingecko",
        slug: "coingecko",
        name: "CoinGecko",
        category: "Crypto",
        subCategory: "Data",
        tags: ["crypto", "bitcoin", "finance", "market-data"],
        pricingType: "Free",
        regionSupport: ["global"],
        dxScore: 90,
        popularityScore: 92,
        logoSymbol: "CG",
        shortDescription: "Cryptocurrency data API.",
        longDescription: "Get data on cryptocurrencies, exchanges, derivatives, and decentralized finance (DeFi). Comprehensive and easy to use.",
        docsUrl: "https://www.coingecko.com/en/api/documentation",
        providerUrl: "https://www.coingecko.com",
        providerName: "CoinGecko",
        confidenceScore: 94,
        rating: 4.5,
        reviewCount: 6000,
        uptimeSla: "99.0%",
        sampleEndpointUrl: "GET https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
        playgroundExampleResponse: {
            "bitcoin": { "usd": 65432.10 }
        }
    },
    {
        id: "api_coinbase",
        slug: "coinbase",
        name: "Coinbase",
        category: "Crypto",
        subCategory: "Trading",
        tags: ["crypto", "trading", "wallet", "finance"],
        pricingType: "Paid",
        regionSupport: ["global"],
        dxScore: 93,
        popularityScore: 95,
        logoSymbol: "CB",
        shortDescription: "Buy, sell, and manage cryptocurrency.",
        longDescription: "Integrate Bitcoin, Ethereum, and Litecoin payments into your application. Secure and compliant.",
        docsUrl: "https://docs.cloud.coinbase.com/",
        providerUrl: "https://www.coinbase.com",
        providerName: "Coinbase",
        confidenceScore: 98,
        rating: 4.6,
        reviewCount: 11000,
        uptimeSla: "99.99%",
        sampleEndpointUrl: "GET https://api.coinbase.com/v2/prices/BTC-USD/spot",
        playgroundExampleResponse: {
            "data": { "base": "BTC", "currency": "USD", "amount": "65000.00" }
        }
    },
    // Maps
    {
        id: "api_google_maps",
        slug: "google-maps",
        name: "Google Maps",
        category: "Maps",
        subCategory: "Navigation",
        tags: ["maps", "geolocation", "places", "routing"],
        pricingType: "Paid",
        regionSupport: ["global"],
        dxScore: 96,
        popularityScore: 99,
        logoSymbol: "GM",
        shortDescription: "Maps, routes, and places API.",
        longDescription: "The most comprehensive maps API. Embed maps, search for places, and calculate routes with real-time traffic.",
        docsUrl: "https://developers.google.com/maps/documentation",
        providerUrl: "https://cloud.google.com/maps-platform",
        providerName: "Google",
        confidenceScore: 99,
        rating: 4.8,
        reviewCount: 50000,
        uptimeSla: "99.9%",
        sampleEndpointUrl: "GET https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway",
        playgroundExampleResponse: {
            "results": [{ "formatted_address": "1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA" }]
        },
        isFeatured: true
    },
    {
        id: "api_mapbox",
        slug: "mapbox",
        name: "Mapbox",
        category: "Maps",
        subCategory: "Visualization",
        tags: ["maps", "navigation", "visualization"],
        pricingType: "Freemium",
        regionSupport: ["global"],
        dxScore: 97,
        popularityScore: 94,
        logoSymbol: "MB",
        shortDescription: "Customizable maps and location services.",
        longDescription: "Build custom maps and navigation experiences. Known for its beautiful map styles and flexibility.",
        docsUrl: "https://docs.mapbox.com/api/",
        providerUrl: "https://www.mapbox.com",
        providerName: "Mapbox",
        confidenceScore: 97,
        rating: 4.7,
        reviewCount: 8000,
        uptimeSla: "99.9%",
        sampleEndpointUrl: "GET https://api.mapbox.com/geocoding/v5/mapbox.places/Los%20Angeles.json",
        playgroundExampleResponse: {
            "features": [{ "place_name": "Los Angeles, California, United States" }]
        }
    },
    // Social
    {
        id: "api_twitter",
        slug: "twitter-x",
        name: "Twitter / X API",
        category: "Social Media",
        tags: ["social", "twitter", "posts", "analytics"],
        pricingType: "Paid",
        regionSupport: ["global"],
        dxScore: 85,
        popularityScore: 98,
        logoSymbol: "X",
        shortDescription: "Access X (Twitter) data and features.",
        longDescription: "Programmatically post tweets, read timelines, and access user data and analytics.",
        docsUrl: "https://developer.twitter.com/en/docs",
        providerUrl: "https://developer.twitter.com",
        providerName: "X Corp",
        confidenceScore: 92,
        rating: 4.2,
        reviewCount: 22000,
        uptimeSla: "99.5%",
        sampleEndpointUrl: "POST https://api.twitter.com/2/tweets",
        playgroundExampleResponse: {
            "data": { "id": "1234567890", "text": "Hello World!" }
        }
    },
    {
        id: "api_discord",
        slug: "discord",
        name: "Discord API",
        category: "Social Media",
        subCategory: "Chat",
        tags: ["chat", "community", "bots", "gaming"],
        pricingType: "Free",
        regionSupport: ["global"],
        dxScore: 96,
        popularityScore: 97,
        logoSymbol: "DC",
        shortDescription: "Create bots and integrate with Discord.",
        longDescription: "Build bots, manage servers, and integrate your application with Discord's chat and voice platform.",
        docsUrl: "https://discord.com/developers/docs/intro",
        providerUrl: "https://discord.com",
        providerName: "Discord",
        confidenceScore: 98,
        rating: 4.9,
        reviewCount: 15000,
        uptimeSla: "99.9%",
        sampleEndpointUrl: "GET https://discord.com/api/v10/users/@me",
        playgroundExampleResponse: {
            "id": "80351110224678912",
            "username": "Nelly",
            "discriminator": "1337"
        }
    },
    // DevTools
    {
        id: "api_vercel",
        slug: "vercel",
        name: "Vercel API",
        category: "DevTools",
        tags: ["hosting", "deployment", "serverless", "frontend"],
        pricingType: "Freemium",
        regionSupport: ["global"],
        dxScore: 98,
        popularityScore: 96,
        logoSymbol: "VC",
        shortDescription: "Manage Vercel deployments and projects.",
        longDescription: "The Vercel API allows you to manage your Vercel projects, deployments, and domains programmatically.",
        docsUrl: "https://vercel.com/docs/rest-api",
        providerUrl: "https://vercel.com",
        providerName: "Vercel",
        confidenceScore: 97,
        rating: 4.8,
        reviewCount: 4000,
        uptimeSla: "99.99%",
        sampleEndpointUrl: "GET https://api.vercel.com/v9/projects",
        playgroundExampleResponse: {
            "projects": [{ "name": "my-nextjs-app", "framework": "nextjs" }]
        }
    },
    {
        id: "api_github",
        slug: "github",
        name: "GitHub API",
        category: "DevTools",
        tags: ["git", "version-control", "code", "collaboration"],
        pricingType: "Free",
        regionSupport: ["global"],
        dxScore: 97,
        popularityScore: 99,
        logoSymbol: "GH",
        shortDescription: "Interact with GitHub repositories and users.",
        longDescription: "The GitHub REST API allows you to create and manage repositories, branches, issues, pull requests, and more.",
        docsUrl: "https://docs.github.com/en/rest",
        providerUrl: "https://github.com",
        providerName: "GitHub",
        confidenceScore: 99,
        rating: 4.9,
        reviewCount: 45000,
        uptimeSla: "99.95%",
        sampleEndpointUrl: "GET https://api.github.com/users/octocat",
        playgroundExampleResponse: {
            "login": "octocat",
            "id": 1,
            "public_repos": 8
        },
        isFeatured: true
    },
    // Media
    {
        id: "api_spotify",
        slug: "spotify",
        name: "Spotify Web API",
        category: "Media",
        tags: ["music", "audio", "streaming"],
        pricingType: "Free",
        regionSupport: ["global"],
        dxScore: 95,
        popularityScore: 98,
        logoSymbol: "SP",
        shortDescription: "Access Spotify's catalog and user data.",
        longDescription: "Get metadata about artists, albums, and tracks, and manage user libraries and playlists.",
        docsUrl: "https://developer.spotify.com/documentation/web-api",
        providerUrl: "https://developer.spotify.com",
        providerName: "Spotify",
        confidenceScore: 98,
        rating: 4.8,
        reviewCount: 12000,
        uptimeSla: "99.9%",
        sampleEndpointUrl: "GET https://api.spotify.com/v1/tracks/11dFghVXANMlKmJXsNCbNl",
        playgroundExampleResponse: {
            "name": "Cut To The Feeling",
            "artists": [{ "name": "Carly Rae Jepsen" }]
        }
    },
    {
        id: "api_youtube",
        slug: "youtube",
        name: "YouTube Data API",
        category: "Media",
        tags: ["video", "streaming", "content"],
        pricingType: "Free",
        regionSupport: ["global"],
        dxScore: 92,
        popularityScore: 99,
        logoSymbol: "YT",
        shortDescription: "Access YouTube videos and channels.",
        longDescription: "Add YouTube functionality to your application, including searching for videos, retrieving channel info, and managing playlists.",
        docsUrl: "https://developers.google.com/youtube/v3",
        providerUrl: "https://www.youtube.com",
        providerName: "Google",
        confidenceScore: 99,
        rating: 4.7,
        reviewCount: 30000,
        uptimeSla: "99.9%",
        sampleEndpointUrl: "GET https://www.googleapis.com/youtube/v3/videos?id=7lCDEYXw3mM&part=snippet",
        playgroundExampleResponse: {
            "items": [{ "snippet": { "title": "Google I/O 2013" } }]
        }
    },
    // Science
    {
        id: "api_nasa_apod",
        slug: "nasa-apod",
        name: "NASA APOD",
        category: "Science",
        tags: ["space", "astronomy", "images", "science"],
        pricingType: "Free",
        regionSupport: ["global"],
        dxScore: 88,
        popularityScore: 90,
        logoSymbol: "NA",
        shortDescription: "Astronomy Picture of the Day.",
        longDescription: "One of the most popular websites at NASA is the Astronomy Picture of the Day. This endpoint structures the APOD imagery and associated metadata.",
        docsUrl: "https://api.nasa.gov",
        providerUrl: "https://api.nasa.gov",
        providerName: "NASA",
        confidenceScore: 99,
        rating: 4.9,
        reviewCount: 3000,
        uptimeSla: "99.9%",
        sampleEndpointUrl: "GET https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY",
        playgroundExampleResponse: {
            "title": "The Crab Nebula",
            "url": "https://apod.nasa.gov/apod/image/..."
        }
    },
    // Travel
    {
        id: "api_skyscanner",
        slug: "skyscanner",
        name: "Skyscanner",
        category: "Travel",
        tags: ["flights", "travel", "booking"],
        pricingType: "Freemium",
        regionSupport: ["global"],
        dxScore: 90,
        popularityScore: 92,
        logoSymbol: "SS",
        shortDescription: "Flight search and booking API.",
        longDescription: "Search for flights, hotels, and car rentals. Compare prices from thousands of providers.",
        docsUrl: "https://developers.skyscanner.net",
        providerUrl: "https://www.skyscanner.net",
        providerName: "Skyscanner",
        confidenceScore: 95,
        rating: 4.6,
        reviewCount: 2500,
        uptimeSla: "99.5%",
        sampleEndpointUrl: "POST https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/create",
        playgroundExampleResponse: {
            "sessionToken": "abc-123-def"
        }
    },
    {
        id: "api_airbnb",
        slug: "airbnb",
        name: "Airbnb (Unofficial)",
        category: "Travel",
        tags: ["accommodation", "travel", "rentals"],
        pricingType: "Paid",
        regionSupport: ["global"],
        dxScore: 75,
        popularityScore: 99,
        logoSymbol: "AB",
        shortDescription: "Access Airbnb listings and reviews.",
        longDescription: "Search for homes, experiences, and restaurants. Note: This is often accessed via third-party scrapers as the official API is closed.",
        docsUrl: "https://rapidapi.com/collection/airbnb",
        providerUrl: "https://airbnb.com",
        providerName: "Airbnb",
        confidenceScore: 85,
        rating: 4.2,
        reviewCount: 1200,
        uptimeSla: "98.0%",
        sampleEndpointUrl: "GET https://airbnb-api.p.rapidapi.com/listings",
        playgroundExampleResponse: {
            "listings": [{ "name": "Cozy Cabin", "price": "$150" }]
        },
        planNote: "Unofficial API, use with caution."
    },
    // Productivity
    {
        id: "api_notion",
        slug: "notion",
        name: "Notion API",
        category: "Productivity",
        tags: ["notes", "collaboration", "database", "docs"],
        pricingType: "Freemium",
        regionSupport: ["global"],
        dxScore: 94,
        popularityScore: 95,
        logoSymbol: "NO",
        shortDescription: "Connect Notion pages and databases.",
        longDescription: "The Notion API allows you to connect Notion pages and databases to the tools you use every day.",
        docsUrl: "https://developers.notion.com",
        providerUrl: "https://notion.so",
        providerName: "Notion",
        confidenceScore: 96,
        rating: 4.7,
        reviewCount: 5500,
        uptimeSla: "99.9%",
        sampleEndpointUrl: "POST https://api.notion.com/v1/pages",
        playgroundExampleResponse: {
            "object": "page",
            "id": "59833787-2cf9-4fdf-8782-e53db207681c"
        }
    },
    {
        id: "api_slack",
        slug: "slack",
        name: "Slack API",
        category: "Productivity",
        tags: ["chat", "collaboration", "messaging"],
        pricingType: "Free",
        regionSupport: ["global"],
        dxScore: 96,
        popularityScore: 98,
        logoSymbol: "SL",
        shortDescription: "Build apps and bots for Slack.",
        longDescription: "The Slack Web API is an interface for querying information from and enacting change in a Slack workspace.",
        docsUrl: "https://api.slack.com/web",
        providerUrl: "https://slack.com",
        providerName: "Slack",
        confidenceScore: 98,
        rating: 4.8,
        reviewCount: 14000,
        uptimeSla: "99.99%",
        sampleEndpointUrl: "POST https://slack.com/api/chat.postMessage",
        playgroundExampleResponse: {
            "ok": true,
            "channel": "C123456",
            "ts": "1503435956.000247"
        }
    }
];
