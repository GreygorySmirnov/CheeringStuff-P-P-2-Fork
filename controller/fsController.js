const fs = require('fs'); // Module Gestionnaire de fichiers/(File System)

// CRÉATION DU DOSSIER RACINE SOLUSOFT
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

// CRÉATION DU DOSSIER SOLUSOFT/PRODUITS
exports.createProductsFolder = async (req, res) => {
    // EMPLACEMENT DU DOSSIER PRODUITS LOCAL POUR LA RÉCEPTION (produits et photos à traiter)
    const localReceivedFilesProduits = 'solusoft/ftpReceivedFiles/Produits';

    if (!fs.existsSync(localReceivedFilesProduits)) {
        // CRÉATION DU DOSSIER "PRODUITS" LOCAL s'il n'existe pas déjà
        fs.mkdirSync(localReceivedFilesProduits, { recursive: true });
        console.log("Le dossier local 'ftpReceivedFiles/Produits' a été créé.");
    } else {
        console.log("Le dossier local 'ftpReceivedFiles/Produits' existe déjà.");
    }
}

// CRÉATION DU DOSSIER SOLUSOFT/PHOTOS
exports.createPhotosFolder = async (req, res) => {
    // EMPLACEMENT DU DOSSIERS PHOTOS LOCAL POUR LA RÉCEPTION (produits et photos à traiter)
    const localReceivedFilesPhotos = 'solusoft/ftpReceivedFiles/Photos';

    if (!fs.existsSync(localReceivedFilesPhotos)) {
        // CRÉATION DU DOSSIER "PHOTOS" LOCAL s'il n'existe pas déjà
        fs.mkdirSync(localReceivedFilesPhotos, { recursive: true });
        console.log("Le dossier local 'ftpReceivedFiles/Photos' a été créé.");
    } else {
        console.log("Le dossier local 'ftpReceivedFiles/Photos' existe déjà.");
    }
}