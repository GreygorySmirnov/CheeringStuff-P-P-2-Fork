const fs = require('fs'); // Module Gestionnaire de fichiers/(File System)

exports.createSolusoftRootFolder = async (req, res) => {
    const solusoftFolder = 'solusoft';
    if (!fs.existsSync(solusoftFolder)) {
        // CRÉATION DU DOSSIER RACINE "Solusoft" LOCAL s'il n'existe pas déjà
        fs.mkdirSync(solusoftFolder, { recursive: true });
        console.log("Le dossier local 'solusoftFolder' a été créé.");
    } else {
        console.log("Le dossier local 'solusoftFolder' existe déjà.");
    }

}