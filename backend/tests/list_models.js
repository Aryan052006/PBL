const apiKey = 'AIzaSyBKLvsamCYUrUItWm3GQ9_zRFwMu4qGVo4';

async function listModels() {
    console.log("Listing Gemini Models...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`Model: ${m.name} | Methods: ${m.supportedGenerationMethods.join(', ')}`);
                }
            });
        } else {
            console.log("No models found:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("List Models Error:", error);
    }
}

listModels();
