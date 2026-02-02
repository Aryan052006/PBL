const pdf = require('pdf-parse');
console.log('Type:', typeof pdf);
console.log('Is Function?', typeof pdf === 'function');
console.log('Has Default?', typeof pdf.default);
if (typeof pdf === 'object') {
    console.log('Keys:', JSON.stringify(Object.keys(pdf)));
}
try {
    // Try to find if any key is a function
    const funcKeys = Object.keys(pdf).filter(k => typeof pdf[k] === 'function');
    console.log('Functional Keys:', funcKeys);
} catch (e) { }
