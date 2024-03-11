exports.extractZipPhotosFiles = async (req, res) => {
    const AdmZip = require('adm-zip'); // Module Gestionnaire de compression de fichier
    const fs = require('fs').promises; // Module intégré Gestionnaire de fichiers/(File System)
    const path = require('path') // Module intégré Gestionnaire de chemin d'accès au fichier
    const compressedPhotosDir = 'solusoft/ftpReceivedFiles/Photos';
    const uncompressedPhotosDir = 'solusoft/ftpReceivedFiles/Photos/UncompressedPhotos';

    try {
        // Lectures de tout les fichier dans le dossier de photos compressées
        const compressedPhotosList = await fs.readdir(compressedPhotosDir);

        // CRÉATION et ASSEMBLAGE DE LA LISTE DES PHOTOS COMPRESSÉS
        for (const compressedPhoto of compressedPhotosList) {
            const compressedPhotosPath = path.join(compressedPhotosDir, compressedPhoto);

            // VÉRIFIER QU'IL S'AGIT BIEN D'ARCHIVES ZIP
            if (path.extname(compressedPhotosPath).toLowerCase() === '.zip') {
                try {
                    const zip = new AdmZip(compressedPhotosPath);
                    await zip.extractAllTo(uncompressedPhotosDir, true); // Extract all entries to uncompressedPhotosDir
                    console.log(`Fichiers extraits: ${compressedPhotosPath}`);
                } catch (err) {
                    console.error(`Error extracting ${compressedPhotosPath}:`, err);
                }
            }
        }

        console.log("TOUS les fichiers photos compressés ont été extrait (S'il y a des fichiers zip présents).");
    } catch (err) {
        console.error('Erreur lors de la lecture du dossier source:', err);
    }
}
