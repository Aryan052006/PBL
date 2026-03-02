const apiKey = 'AIzaSyBKLvsamCYUrUItWm3GQ9_zRFwMu4qGVo4';

async function dynamicTest() {
    console.log("Listing models...");
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const listRes = await fetch(listUrl);
        const listData = await listRes.json();

        if (!listData.models) {
            console.log("No models found in list:", listData);
            return;
        }

        const geminiModels = listData.models.filter(m => m.name.includes('gemini') && m.supportedGenerationMethods.includes('generateContent'));
        console.log(`Found ${geminiModels.length} candidate models.`);

        for (const model of geminiModels) {
            console.log(`\n--- Testing ${model.name} ---`);
            const testUrl = `https://generativelanguage.googleapis.com/v1beta/${model.name}:generateContent?key=${apiKey}`;

            try {
                const testRes = await fetch(testUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: "ping" }] }]
                    })
                });
                const testData = await testRes.json();

                if (testData.candidates) {
                    console.log(`SUCCESS with ${model.name}!`);
                    console.log(`Response: ${testData.candidates[0].content.parts[0].text.trim()}`);
                    return;
                } else if (testData.error) {
                    console.log(`Error with ${model.name}: ${testData.error.status} - ${testData.error.message}`);
                } else {
                    console.log(`Unknown error with ${model.name}:`, JSON.stringify(testData, null, 2));
                }
            } catch (err) {
                console.log(`Fetch error with ${model.name}: ${err.message}`);
            }
        }
    } catch (err) {
        console.error("Dynamic test failed:", err);
    }
}

dynamicTest();
