const path = require('path');

module.exports = function (content) {
    this.cacheable();
    const defaultConfig = {
        basePath: [],
        rewritePath: undefined,
        emit: true
    };

    const config = Object.assign(defaultConfig, this.query);
    const fileName = path.basename(this.resourcePath);

    if (config.emit) {
        if (this.emitFile) {
            this.emitFile(fileName, content, false);
        } else {
            throw new Error('emitFile function is not available');
        }
    }

    this.addDependency(this.resourcePath);
    let code = '';

    if (config.rewritePath) {
        let filePath;

        if (config.rewritePath === './' || config.rewritePath === '.\\') {
            filePath = config.rewritePath + fileName;
        } else {
            filePath = path.join(config.rewritePath, fileName);
        }
        filePath = JSON.stringify(filePath.replace(/\\/g, '/'));

        code = `
        try {
            global.process.dlopen(module, ${ filePath });
        } catch(error) {
            throw new Error ('Cannot open ${ filePath }: ' + error);
        };
        `;
    } else {
        const filePathArray = config.basePath.concat(fileName);
        const filePath = JSON.stringify(filePathArray).slice(1, -1);

        code = `
        const path = require('path');
        const filePath = path.resolve(__dirname, ${filePath});
        try {
            global.process.dlopen(module, filePath);
        } catch(error) {
            throw new Error ('Cannot open ' + filePath + ': ' + error);
        }
        `
    }
    return code;
};

module.exports.raw = true;