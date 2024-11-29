import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';

// Bulunduğunuz klasörün adını alır
const currentDir = path.basename(process.cwd());
const configFilePath = path.join(process.cwd(), 'configs.json');

// Varsayılan ayarlar
const defaultConfig = {
    dal: `${currentDir}.DAL`,
    business: `${currentDir}.Business`,
    mvc: `${currentDir}.AdminPanel`,
    entity: `${currentDir}.Entity`,
};

// Config dosyasını kontrol et ve oluştur
async function ensureConfigFile() {
    if (!fs.existsSync(configFilePath)) {
        console.log(chalk.yellow('configs.json dosyası bulunamadı, varsayılan ayarlar oluşturuluyor...'));
        fs.writeFileSync(configFilePath, JSON.stringify(defaultConfig, null, 4), 'utf-8');
    }
    const configContent = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
    console.log(chalk.green('Mevcut Ayarlar:'));
    console.log(JSON.stringify(configContent, null, 4));
    return configContent;
}

// Config dosyasını güncelle
async function updateConfig() {
    const newConfig = {};

    for (const [key, value] of Object.entries(defaultConfig)) {
        const { newValue } = await inquirer.prompt([
            {
                type: 'input',
                name: 'newValue',
                message: chalk.blue(`Lütfen ${key} için dizini girin (varsayılan: ${value}):`),
                default: value,
            },
        ]);
        newConfig[key] = newValue;
    }

    fs.writeFileSync(configFilePath, JSON.stringify(newConfig, null, 4), 'utf-8');
    console.log(chalk.green('Yeni ayarlar kaydedildi!'));
    console.log(JSON.stringify(newConfig, null, 4));
    return newConfig;
}

// Ana program
async function main() {
    console.log(
        chalk.yellow(
            `Şu anda "${currentDir}" klasöründesiniz. İşlem yapmadan önce projenin kök dizininde olduğunuzdan emin olunuz.`
        )
    );

    let config = await ensureConfigFile();

    const { useDefaults } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'useDefaults',
            message: chalk.blue('Varsayılan dizin ayarlarını kullanmak ister misiniz?'),
            default: true,
        },
    ]);

    if (!useDefaults) {
        config = await updateConfig();
    }

    // Ana döngü
    while (true) {
        const { choice } = await inquirer.prompt([
            {
                type: 'list',
                name: 'choice',
                message: chalk.blue('Ne yapmak istersiniz?'),
                choices: ['Tablo', 'Script', 'Çıkış Yap'],
            },
        ]);

        if (choice === 'Tablo') {
            await handleTableCreation();
        } else if (choice === 'Script') {
            console.log(chalk.blue('Script seçildi, işlemler burada yapılacak.'));
            // Script işlemleri buraya eklenebilir
        } else if (choice === 'Çıkış Yap') {
            console.log(chalk.green('Program sonlandırılıyor...'));
            process.exit(0); // Programı sonlandır
        }
    }
}

main();
