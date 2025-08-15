import * as fs from 'fs';
import * as path from 'path';

// IMPORTANT: You MUST change this to the actual path of your source image directory.
const SOURCE_IMAGE_DIRECTORY = '/home/cleiton/.local/share/CipSoft GmbH/Tibia/packages/Tibia/screenshots/'; 

const projectPhotosBaseDir = path.join(__dirname, './photos');
const outputJson = path.join(__dirname, './imagelist.json');

// Ensure the base photos directory exists
if (!fs.existsSync(projectPhotosBaseDir)) {
    fs.mkdirSync(projectPhotosBaseDir);
}

// Clear existing images and category folders in the project's photos directory
fs.readdirSync(projectPhotosBaseDir).forEach(item => {
    const itemPath = path.join(projectPhotosBaseDir, item);
    if (fs.lstatSync(itemPath).isDirectory()) {
        fs.rmSync(itemPath, { recursive: true, force: true });
    } else {
        fs.unlinkSync(itemPath);
    }
});

interface ImageInfo {
    filename: string;
    timestamp: Date;
    title: string;
    category: string;
    character: string;
    path: string; // Path relative to project root (e.g., photos/LevelUp/image.png)
}

fs.readdir(SOURCE_IMAGE_DIRECTORY, (err, files) => {
    if (err) {
        console.error('Error reading source image directory:', err);
        return;
    }

    const imageInfos: ImageInfo[] = [];
    const uniqueCategories = new Set<string>();
    const uniqueCharacters = new Set<string>();

    files.forEach(file => {
        const sourceFilePath = path.join(SOURCE_IMAGE_DIRECTORY, file);
        const lowerCaseFile = file.toLowerCase();

        if (fs.statSync(sourceFilePath).isFile() && 
            (lowerCaseFile.endsWith('.jpg') || lowerCaseFile.endsWith('.jpeg') || 
             lowerCaseFile.endsWith('.png') || lowerCaseFile.endsWith('.gif'))) {
            
            try {
                // Extract date, time, character, and category from filename
                const filenameMatch = file.match(/^(\d{4}-\d{2}-\d{2})_(\d{9})_(.*?)_(.+?)\.(?:png|jpg|jpeg|gif)$/i);
                let timestamp: Date = new Date(0); // Default to epoch
                let title: string = file; // Default title is filename
                let category: string = 'Uncategorized';
                let character: string = 'Unknown';

                if (filenameMatch) {
                    const datePart = filenameMatch[1]; // e.g., 2025-08-01
                    const timePart = filenameMatch[2]; // e.g., 201152435 (HHmmssSSS)
                    character = filenameMatch[3]; // e.g., Saint Sinkzda
                    category = filenameMatch[4]; // e.g., LevelUp

                    const year = parseInt(datePart.substring(0, 4));
                    const month = parseInt(datePart.substring(5, 7)) - 1; // Month is 0-indexed
                    const day = parseInt(datePart.substring(8, 10));
                    const hours = parseInt(timePart.substring(0, 2));
                    const minutes = parseInt(timePart.substring(2, 4));
                    const seconds = parseInt(timePart.substring(4, 6));
                    const milliseconds = parseInt(timePart.substring(6, 9));

                    timestamp = new Date(year, month, day, hours, minutes, seconds, milliseconds);
                    
                    const formattedDay = String(timestamp.getDate()).padStart(2, '0');
                    const formattedMonth = String(timestamp.getMonth() + 1).padStart(2, '0');
                    const formattedYear = timestamp.getFullYear();
                    const formattedHours = String(timestamp.getHours()).padStart(2, '0');
                    const formattedMinutes = String(timestamp.getMinutes()).padStart(2, '0');

                    title = `${formattedDay}/${formattedMonth}/${formattedYear} - ${formattedHours}:${formattedMinutes}`;
                } else {
                    // Fallback: use file modification time if filename format doesn't match
                    const stats = fs.statSync(sourceFilePath);
                    timestamp = stats.mtime;
                    title = file; // Keep filename as title if no match
                }

                // Create category subdirectory if it doesn't exist
                const categoryDir = path.join(projectPhotosBaseDir, category);
                if (!fs.existsSync(categoryDir)) {
                    fs.mkdirSync(categoryDir);
                }

                const destFilePath = path.join(categoryDir, file);
                fs.copyFileSync(sourceFilePath, destFilePath);

                imageInfos.push({ 
                    filename: file, 
                    timestamp, 
                    title, 
                    category, 
                    character,
                    path: `photos/${category}/${file}` 
                });
                uniqueCategories.add(category);
                uniqueCharacters.add(character);

            } catch (copyErr) {
                console.error(`Error processing file ${file}:`, copyErr);
            }
        }
    });

    // Sort images by timestamp (newest first)
    imageInfos.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Prepare data for imagelist.json
    const outputData = {
        categories: Array.from(uniqueCategories).sort(),
        characters: Array.from(uniqueCharacters).sort(),
        images: imageInfos.map(info => ({ 
            filename: info.filename, 
            title: info.title, 
            category: info.category, 
            character: info.character,
            path: info.path 
        }))
    };

    fs.writeFile(outputJson, JSON.stringify(outputData, null, 2), err => {
        if (err) {
            console.error('Error writing imagelist.json:', err);
            return;
        }
        console.log('imagelist.json generated successfully.');
        console.log(`Copied ${imageInfos.length} images into ${uniqueCategories.size} categories for ${uniqueCharacters.size} characters.`);
    });
});
