const apiKey = 'AIzaSyBKLvsamCYUrUItWm3GQ9_zRFwMu4qGVo4';

async function testModels() {
    const models = [
        'models/gemini-1.5-flash',
        'models/gemini-1.5-flash-8b',
        'models/gemini-1.5-pro',
        'models/gemini-2.0-flash',
        'models/gemini-2.0-flash-exp'
    ];

    for (const modelName of models) {
        console.log(`Testing model: ${modelName}...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Hello, just reply with 'OK' if you can hear me." }] }]
                })
            });
            const data = await response.json();
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                console.log(`Success with ${modelName}:`, data.candidates[0].content.parts[0].text.trim());
                return modelName;
            } else {
                console.log(`Failed with ${modelName}:`, JSON.stringify(data.error || data, null, 2));
            }
        } catch (error) {
            console.error(`Error with ${modelName}:`, error.message);
        }
        console.log("-------------------");
    }
    return null;
}

testModels().then(workingModel => {
    if (workingModel) {
        console.log(`\nFound working model: ${workingModel}`);
    } else {
        console.log("\nNo working model found.");
    }
});
