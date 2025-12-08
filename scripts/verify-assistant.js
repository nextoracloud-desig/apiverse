
const fetch = require('node-fetch');

async function testAssistant() {
    try {
        const response = await fetch('http://localhost:3000/api/recommend-stack', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: "I need a payment gateway and email service" })
        });

        if (!response.ok) {
            console.error('Failed:', response.status, response.statusText);
            process.exit(1);
        }

        const data = await response.json();
        console.log('Success! Recommendations:', JSON.stringify(data.recommendations.map(r => r.api.name), null, 2));
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

testAssistant();
