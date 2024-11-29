import inquirer from 'inquirer';
import chalk from 'chalk';

// İşleme alınan cevapları ele alan fonksiyon
function processTableData(tableName, properties) {
    console.log(chalk.green(`Tablo Adı: ${tableName}`));
    console.log(chalk.green('Property Listesi:'));
    properties.forEach((prop, index) => {
        console.log(`${index + 1}. ${prop.type} ${prop.name}`);
    });
}

export async function handleTableCreation() {
    const { tableName } = await inquirer.prompt([
        {
            type: 'input',
            name: 'tableName',
            message: chalk.blue('Lütfen Tablo Adını Girin:'),
        },
    ]);

    let properties = [];
    console.log(chalk.yellow("Her Property için 'Property Tipi' ve 'Property Adı' girin (örnek: string Name)."));
    console.log(chalk.yellow("Bitirmek için 'done' yazın."));

    while (true) {
        const { propertyInput } = await inquirer.prompt([
            {
                type: 'input',
                name: 'propertyInput',
                message: chalk.blue('Property Tipi ve Property Adı:'),
            },
        ]);

        if (propertyInput.toLowerCase() === 'done') {
            break;
        }

        const [type, name] = propertyInput.split(' ');
        if (!type || !name) {
            console.log(chalk.red('Geçersiz giriş! Örnek: string Name'));
            continue;
        }

        properties.push({ type, name });
    }

    processTableData(tableName, properties);
}