const fs = require('fs');
const path = require('path');

const projectsDirectory = './'; // Set this to the directory containing your projects
const outputJsonFile = 'projects.json'; // The output JSON file

fs.readdir(projectsDirectory, { withFileTypes: true }, (err, entries) => {
    if (err) {
        console.error('Error reading the directory:', err);
        return;
    }

    // Filter the list of entries to include only directories
    const folders = entries.filter(entry => entry.isDirectory())
        .filter(entry => entry.isDirectory() && entry.name !== '.git')
        .map(dir => {
            // Determine the type based on the directory name
            let type;
            if (dir.name.startsWith('JS-')) {
                type = 'js';
            } else if (dir.name.startsWith('GSAP-')) {
                type = 'gsap';
            } else if (dir.name.startsWith('GPT-')) {
                type = 'gpt';
            } else {
                type = 'css';
            }

            // Return the project data
            return {
                name: dir.name,
                path: `${dir.name}/index.html`,
                type: type
            };
        });

    // Write the JSON file
    fs.writeFile(outputJsonFile, JSON.stringify(folders, null, 2), (err) => {
        if (err) {
            console.error('Error writing the JSON file:', err);
            return;
        }
        console.log('The JSON file was updated successfully.');
    });
});
