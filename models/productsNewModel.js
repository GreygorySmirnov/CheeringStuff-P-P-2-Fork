// Importe le module mongoose pour la modélisation des schémas MongoDB
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Définit le schéma de la collection "products" dans la base de données
const productNewModel = new Schema(
    {
        m_eIDProduit: Number,
        m_sNoProduit: String,
        m_sCodeTrans: String,
        m_sDescFra: String,
        m_sDescAng: String,
        m_sTypeProduit: String,
        m_eIDProdModele: Number,
        m_sCodeCat: String,
        m_sDescFraCat: String,
        m_sDescAngCat: String,
        m_sCodeSousCat: String,
        m_sDescSsFraCat: String,
        m_sDescSsAngCat: String,
        m_bTaxableTPS: Boolean,
        m_bTaxableTVQ: Boolean,
        m_mPrix: Number,
        m_mPrixEnSolde: Number,
        m_mQuantite: Number,
        m_nPoids: Number,
        m_sNoteTechFra: String,
        m_sNoteTechAng: String,
        // Tableaux peuvent être laissé vide initialement (optionel):
        m_tbCategories: [String],
        m_tbSpecifications: [String],
        m_tbGroupe: [String],
        m_tbCaracteristiques: [String],
    }, { timestamps: true }); // Ajouter des horodatages (marqueur de temps) pour le suivi automatique des créations/modifications

module.exports = mongoose.model('Product', productNewModel);