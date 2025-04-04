const fse = require('fs-extra')
const path = require('path')
const ejs = require('ejs')
const { glob } = require('glob')
const config = require('../site.config')

const srcPath = './src'
const distPath = './public'

// Clear destination folder
fse.emptyDirSync(distPath)

// Copy assets folder
fse.copySync(`${srcPath}/assets`, `${distPath}/assets`)

// Read all .ejs page templates from src/pages
glob('**/*.ejs', { cwd: `${srcPath}/pages` }).then((files) => {
  files.forEach((file) => {
    const fileData = path.parse(file)
    const destPath = path.join(distPath, fileData.dir)

    fse.mkdirsSync(destPath)

    // Render the page
    ejs.renderFile(`${srcPath}/pages/${file}`, { ...config }, (err, pageContents) => {
      if (err) return console.error(`Error rendering page ${file}:`, err)

      // Render layout with page contents
      ejs.renderFile(`${srcPath}/layout.ejs`, { ...config, body: pageContents }, (err, layoutContent) => {
        if (err) return console.error(`Error rendering layout for ${file}:`, err)

        // Save final HTML
        fse.writeFileSync(`${destPath}/${fileData.name}.html`, layoutContent)
        console.log(`✓ Built ${fileData.name}.html`)
      })
    })
  })
}).catch((err) => {
  console.error('Error during globbing:', err)
})
