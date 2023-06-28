const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    // ...Your other config
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: "node_modules/pdfjs-dist/build/pdf.worker.entry.js",
                    to: "pdf.worker.entry.js",
                },
            ],
        }),
    ],
};
