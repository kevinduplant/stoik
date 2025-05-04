const fs = require("fs");
const { faker } = require("@faker-js/faker");

const NUM_URLS = 1000000; // Generate 1 million random URLs
const FILE_PATH = "random-urls.csv";

const urls = [];
for (let i = 0; i < NUM_URLS; i++) {
  urls.push(faker.internet.url());
}

const csvContent = urls.map((url) => `"${url}"`).join("\n");

fs.writeFileSync(FILE_PATH, csvContent);
console.log(`Generated ${NUM_URLS} random URLs and saved to ${FILE_PATH}`);
