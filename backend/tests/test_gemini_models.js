const apiKey = 'AIzaSyBKLvsamCYUrUItWm3GQ9_zRFwMu4qGVo4';

async function listModels() {
    console.log("Listing Gemini Models...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("FULL MODELS DATA:", JSON.stringify(data.models, null, 2));
    } catch (error) {
        console.error("List Models Error:", error);
    }
}

listModels();
