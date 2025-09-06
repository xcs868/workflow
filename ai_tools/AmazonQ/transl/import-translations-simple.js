#!/usr/bin/env node

/**
 * 翻译导入脚本
 * 将 untranslated.json 中的翻译内容导入到各语言目录的 app.php 文件中
 * 只替换值为空字符串 ('') 的翻译条目
 */

const fs = require('fs');
const path = require('path');

// 读取翻译好的内容
const translatedFile = path.join(__dirname, 'untranslated.json');

if (!fs.existsSync(translatedFile)) {
    console.error('未找到 untranslated.json 文件');
    process.exit(1);
}

const translatedData = JSON.parse(fs.readFileSync(translatedFile, 'utf8'));

// 获取支持的语言列表
const languages = Object.keys(translatedData);

console.log(`找到 ${languages.length} 种语言: ${languages.join(', ')}`);

// 遍历每种语言
languages.forEach(lang => {
    const langDir = path.join(__dirname, lang);
    
    if (!fs.existsSync(langDir)) {
        console.log(`跳过 ${lang}: 语言目录不存在`);
        return;
    }
    
    // 获取该语言目录下的所有 PHP 文件
    const phpFiles = fs.readdirSync(langDir).filter(file => file.endsWith('.php'));
    
    if (phpFiles.length === 0) {
        console.log(`跳过 ${lang}: 没有找到 PHP 文件`);
        return;
    }
    
    console.log(`处理 ${lang}: 找到 ${phpFiles.length} 个 PHP 文件: ${phpFiles.join(', ')}`);
    
    // 获取该语言的翻译数据
    const translations = translatedData[lang];
    let totalUpdatedCount = 0;
    
    // 遍历每个 PHP 文件
    phpFiles.forEach(phpFile => {
        const phpFilePath = path.join(langDir, phpFile);
        
        // 读取现有的 PHP 文件
        let phpContent = fs.readFileSync(phpFilePath, 'utf8');
        let fileUpdatedCount = 0;
        
        // 遍历每个翻译条目
        Object.keys(translations).forEach(key => {
            const translationData = translations[key];
            const translatedText = translationData.translation;
            
            // 使用更简单的字符串替换
            const searchString = `${key} => ''`;
            const replaceString = `${key} => '${translatedText.replace(/'/g, "\\'")}'`;
            
            if (phpContent.includes(searchString)) {
                phpContent = phpContent.replace(searchString, replaceString);
                fileUpdatedCount++;
                console.log(`${lang}/${phpFile}: 更新 ${key}`);
            }
        });
        
        if (fileUpdatedCount > 0) {
            // 写回文件
            fs.writeFileSync(phpFilePath, phpContent);
            console.log(`${lang}/${phpFile}: 完成更新，共更新 ${fileUpdatedCount} 个翻译条目`);
            totalUpdatedCount += fileUpdatedCount;
        } else {
            console.log(`${lang}/${phpFile}: 没有找到需要更新的空翻译条目`);
        }
    });
    
    console.log(`${lang}: 总共更新了 ${totalUpdatedCount} 个翻译条目`);
});

console.log('翻译导入完成！');