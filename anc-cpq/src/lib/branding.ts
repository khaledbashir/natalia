export const BRAND = {
    company: {
        name: "ANC SPORTS ENTERPRISES, LLC",
        shortName: "ANC",
        tagline: "Premium LED Display Solutions",
        website: "https://ancsports.com",
        address: "...", // TODO: Update with actual
        phone: "...",   // TODO: Update with actual
        email: "...",   // TODO: Update with actual
    },
    colors: {
        primary: "#3b82f6",       // ANC Blue
        primaryDark: "#1e3a5f",   // Dark Blue
        primaryLight: "#60a5fa",  // Light Blue
        white: "#ffffff",
        black: "#000000",
        grayDark: "#1e293b",
        grayMedium: "#6b7280",
        grayLight: "#f3f4f6",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
    },
    fonts: {
        primary: "Helvetica",
        heading: "Helvetica-Bold",
        monospace: "Courier",
    },
    logo: {
        pathSvg: "/static/anc_logo.svg",
        pathPng: "/static/anc_logo.png",
        width: 150,
        height: 50,
    },
    pdf: {
        title: "SALES QUOTATION",
        paymentTerms: "50% Deposit, 40% Shipping, 10% Completion",
        validityDays: 30,
    }
};

export const getBrandColor = (key: keyof typeof BRAND.colors) => BRAND.colors[key];
