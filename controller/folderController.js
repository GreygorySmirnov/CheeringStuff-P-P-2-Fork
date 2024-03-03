exports.folderCreation = async (req, res) => {

    
    client.list((err, list) => {
        if (err) throw err;

        // CRÉATION DES DOSSIERS DE TÉLÉCHARGEMENTS (solusoft/compressedFiles + solusoft/uncompressedFiles)
        // Vérification SI dossier "solusoft/compressedFiles" existe déjà, sinon le créé.
        fs.access("solusoft/compressedFiles", fs.constants.F_OK, (err) => {
            if (err) {
                // Si dossier "solusoft/compressedFiles" n'existe pas, le créé
                fs.mkdir("solusoft/compressedFiles", { recursive: true }, (err) => {
                    if (err) {
                        console.error('Erreur de création du dossier "solusoft/compressedFiles":', err);
                    } else {
                        console.log('Dossier "solusoft/compressedFiles" créé avec succès"');
                    }
                });
            } else {
                console.log('Le dossier "solusoft/compressedFiles" existe déjà');
            }
        });
        // Vérification SI dossier "solusoft/uncompressedFiles" existe déjà, sinon le créé.
        fs.access("solusoft/uncompressedFiles", fs.constants.F_OK, (err) => {
            if (err) {
                // Si dossier "solusoft/uncompressedFiles" n'existe pas, le créé
                fs.mkdir("solusoft/uncompressedFiles", { recursive: true }, (err) => {
                    if (err) {
                        console.error('Erreur de création du dossier "solusoft/uncompressedFiles":', err);
                    } else {
                        console.log('Dossier "solusoft/uncompressedFiles" créé avec succès"');
                    }
                });
            } else {
                console.log('Le dossier "solusoft/uncompressedFiles" existe déjà');
            }
        });

        // Créé le chemin d'accès vers la destination du WriteStream
        const pathName = 'solusoft/compressedFiles/downloadedFile.zip';
        // FTP Sélection du fichier à télécharger sur le serveuer - produitTest.zip (temporaire)
        const remoteFilePath = '/Produits/produitTest.zip'; // Fichier sur le FTP


        //GET 1 FILE - Méthode pour télécharger un fichier (remoteFilePath)
        client.get(remoteFilePath, (err, stream) => {
            if (err) {
                console.error('Error downloading file:', err);
                return;
            }
            // FTP PIPE PROCESS - WriteStream du fichier Serveur vers Stream Local
            stream.pipe(fs.createWriteStream(pathName));
            // FTP CLOSE EVENT - Écoute de la terminaison du processus de téléchargement
            stream.once('close', () => {
                console.log('fichier "downloadedFile.zip" téléchargé avec succès');
                client.end(); // Close the FTP connection

                // ADM-ZIP - Gestionnaire de compression/décompression de fichier
                // ZIP - Chemin d'accès vers le fichier zip (produits)
                const zipFilePath = 'solusoft/compressedFiles/downloadedFile.zip';

                // Crée une instance d'AdmZip
                const zip = new AdmZip(zipFilePath);

                // Extrait le contenu du fichier compressé (produits)
                zip.extractAllTo('solusoft/uncompressedFiles', true);

            });
        });
    });


}