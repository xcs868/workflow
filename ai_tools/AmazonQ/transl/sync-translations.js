#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 配置
const LANG_DIR = __dirname;
const ZH_DIR = path.join(LANG_DIR, 'zh');
const LANGUAGES = ['ar', 'en', 'es', 'hi', 'ja', 'ms', 'pt', 'vi'];

// 解析PHP文件中的翻译键值对
function parsePhpTranslations(filePath) {
    if (!fs.existsSync(filePath)) {
        return {};
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const translations = {};
    const seenKeys = new Set();
    
    // 匹配 Transl::KEY => 'value' 或 "value" 的模式，包括可能的注释
    const regex = /Transl::([A-Z_0-9]+)\s*=>\s*(['"])((?:(?!\2)[^\\]|\\.)*)(\2)/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
        const key = match[1];
        const value = match[3]; // 第3个捕获组现在是值
        
        if (seenKeys.has(key)) {
            console.log(`警告: 在文件 ${filePath} 中发现重复的键: ${key}`);
        }
        seenKeys.add(key);
        translations[key] = value;
    }
    
    return translations;
}

// 添加缺失的翻译项到文件末尾（保留原文件格式）
function addMissingTranslations(filePath, missingTranslations) {
    if (Object.keys(missingTranslations).length === 0) {
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 找到最后一个 ]; 之前的位置
    const lastBracketIndex = content.lastIndexOf('];');
    if (lastBracketIndex === -1) {
        console.log(`警告: 无法找到文件结尾标记 ${filePath}`);
        return;
    }
    
    // 构建要插入的新行
    const newLines = [];
    for (const [key, zhValue] of Object.entries(missingTranslations)) {
        newLines.push(`    Transl::${key} => '', // ${zhValue}`);
    }
    
    // 在最后的 ]; 前插入新行
    const beforeBracket = content.substring(0, lastBracketIndex);
    const afterBracket = content.substring(lastBracketIndex);
    
    const updatedContent = beforeBracket + newLines.join('\n') + '\n' + afterBracket;
    
    fs.writeFileSync(filePath, updatedContent, 'utf8');
}

// 处理单个文件
function processFile(fileName, untranslatedSummary) {
    console.log(`处理文件: ${fileName}`);
    
    const zhFilePath = path.join(ZH_DIR, fileName);
    if (!fs.existsSync(zhFilePath)) {
        console.log(`警告: 中文文件不存在 ${zhFilePath}`);
        return;
    }
    
    // 读取中文翻译
    const zhTranslations = parsePhpTranslations(zhFilePath);
    console.log(`中文文件包含 ${Object.keys(zhTranslations).length} 个翻译项`);
    
    // 处理每种语言
    LANGUAGES.forEach(lang => {
        const langDir = path.join(LANG_DIR, lang);
        const langFilePath = path.join(langDir, fileName);
        
        if (!fs.existsSync(langDir)) {
            console.log(`警告: 语言目录不存在 ${langDir}`);
            return;
        }
        
        // 读取现有翻译
        const existingTranslations = parsePhpTranslations(langFilePath);
        console.log(`${lang} 文件包含 ${Object.keys(existingTranslations).length} 个翻译项`);
        
        // 查找缺失的键 (用于更新php文件)
        const missingKeysForFileUpdate = {};
        for (const [key, zhValue] of Object.entries(zhTranslations)) {
            if (!existingTranslations.hasOwnProperty(key)) {
                missingKeysForFileUpdate[key] = zhValue;
            }
        }
        
        // 查找尚未翻译的条目 (用于生成json报告)
        // 包括缺失的键和值为空字符串的键
        for (const [key, zhValue] of Object.entries(zhTranslations)) {
            if (!existingTranslations.hasOwnProperty(key) || existingTranslations[key] === '') {
                untranslatedSummary[lang][`Transl::${key}`] = {
                    source: zhValue,
                    translation: existingTranslations.hasOwnProperty(key) ? existingTranslations[key] : ''
                };
            }
        }
        
        if (Object.keys(missingKeysForFileUpdate).length > 0) {
            console.log(`${lang} 缺少 ${Object.keys(missingKeysForFileUpdate).length} 个翻译项: ${Object.keys(missingKeysForFileUpdate).join(', ')}`);
            
            // 添加缺失的翻译项（保留原文件格式）
            addMissingTranslations(langFilePath, missingKeysForFileUpdate);
            console.log(`已更新 ${langFilePath}`);
        } else {
            console.log(`${lang} 文件完整，无需更新`);
        }
    });
}

// 主函数
function main() {
    console.log('开始同步翻译文件...');
    console.log(`语言目录: ${LANG_DIR}`);
    console.log(`支持的语言: ${LANGUAGES.join(', ')}`);

    const untranslatedSummary = {};
    LANGUAGES.forEach(lang => {
        untranslatedSummary[lang] = {};
    });
    
    // 获取zh目录下的所有PHP文件
    const zhFiles = fs.readdirSync(ZH_DIR).filter(file => file.endsWith('.php'));
    console.log(`发现 ${zhFiles.length} 个中文翻译文件: ${zhFiles.join(', ')}`);
    
    if (zhFiles.length === 0) {
        console.log('没有找到中文翻译文件');
        return;
    }
    
    // 处理每个文件
    zhFiles.forEach(fileName => {
        console.log('\n' + '='.repeat(50));
        processFile(fileName, untranslatedSummary);
    });

    // 将未翻译的条目写入JSON文件
    const untranslatedPath = path.join(LANG_DIR, 'untranslated.json');
    fs.writeFileSync(untranslatedPath, JSON.stringify(untranslatedSummary, null, 2), 'utf8');
    console.log(`\n未翻译的条目已保存到: ${untranslatedPath}`);
    
    console.log('\n同步完成！');
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = { parsePhpTranslations, addMissingTranslations, processFile };