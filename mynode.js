const fs = require('fs');
const path = require('path');
const successColor = '\x1b[32m%s\x1b[0m';
const checkSign = '\u{2705}';
const dotenv = require('dotenv');

const envFile = `export const environment = {
    DATABASE_URL: "${process.env.DATABASE_URL}",
    API_KEY: "${process.env.API_KEY}",
    DATABASE_PASSWORD: "${process.env.DATABASE_PASSWORD}",
  };
`;
const targetPath = path.join(__dirname, './src/environments/environment.ts');
fs.writeFile(targetPath, envFile, (err) => {
    if (err) {
        throw err;
    } else {
        console.log(successColor, `${checkSign} Successfully generated environment.ts`);
    }
});
