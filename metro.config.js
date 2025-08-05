// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');
const config = getDefaultConfig(__dirname);
// que Metro entienda también archivos .jsx
config.resolver.sourceExts.push('jsx');
module.exports = config;
