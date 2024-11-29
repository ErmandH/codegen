import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

export async function handleDtoCreation() {
    const configPath = path.join(process.cwd(), 'configs.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    // 1. Kullanıcıdan tablo adı ve DTO adı iste
    const { tableName, dtoName } = await inquirer.prompt([
        {
            type: 'input',
            name: 'tableName',
            message: chalk.blue('Lütfen tablo adını girin:'),
        },
        {
            type: 'input',
            name: 'dtoName',
            message: chalk.blue('Lütfen DTO adını girin:'),
        },
    ]);

    // 2. Tüm alt dizinlerde tablo dosyasını ara
    const entityDir = config.entity;
    const tableFilePath = findFileRecursively(entityDir, `${tableName}.cs`);

    if (!tableFilePath) {
        console.log(chalk.red(`Hata: ${tableName}.cs dosyası ${entityDir} dizininde veya alt dizinlerinde bulunamadı.`));
        return;
    }

    const fileContent = fs.readFileSync(tableFilePath, 'utf-8');

    // 3. Dosyadan property'leri çıkart
    const propertyRegex = /public\s+([^\s]+)\s+([^\s]+)\s*\{\s*get;\s*set;\s*\}/g;
    const properties = [];
    let match;

    while ((match = propertyRegex.exec(fileContent)) !== null) {
        const [_, type, name] = match;
        properties.push({ type, name });
    }

    if (properties.length === 0) {
        console.log(chalk.red(`Hata: ${tableName}.cs dosyasından property'ler bulunamadı.`));
        return;
    }

    console.log(chalk.green(`Tablo: ${tableName}`));
    console.log(chalk.green(`Bulunan Property'ler: ${properties.map((p) => `${p.type} ${p.name}`).join(', ')}`));

    // 4. DTO dosyasını oluştur
    const dtoDir = path.join(entityDir, 'Dto', tableName);
    if (!fs.existsSync(dtoDir)) {
        fs.mkdirSync(dtoDir, { recursive: true });
    }

    const namespace = `${path.basename(entityDir)}.Dto.${tableName}`;
    const dtoFilePath = path.join(dtoDir, `${dtoName}.cs`);
    const dtoContent = generateDtoContent(dtoName, properties, namespace);

    fs.writeFileSync(dtoFilePath, dtoContent, 'utf-8');
    console.log(chalk.green(`DTO dosyası oluşturuldu: ${dtoFilePath}`));
}

// Recursive olarak dosya bulma fonksiyonu
function findFileRecursively(dir, fileName) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
            // Alt dizinlerde dosyayı ara
            const found = findFileRecursively(fullPath, fileName);
            if (found) {
                return found;
            }
        } else if (file.isFile() && file.name === fileName) {
            return fullPath;
        }
    }

    return null;
}

// DTO içeriğini oluştur
function generateDtoContent(dtoName, properties, namespace) {
    const propertyLines = properties.map(
        (p) => `\t\t[Required]\n\t\tpublic ${p.type} ${p.name} { get; set; }`
    );

    return `
using System.ComponentModel.DataAnnotations;

namespace ${namespace}
{
    public class ${dtoName}
    {
${propertyLines.join('\n')}
    }
}
    `;
}
