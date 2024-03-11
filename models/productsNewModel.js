// Importe le module mongoose pour la modélisation des schémas MongoDB
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Définit le schéma de la collection "products" dans la base de données
const productNewShema = new Schema(
    {
        m_eIDProduit: {
            type: Number,
            required: true, // Le champ est obligatoire
        },

        m_sNoProduit: {
            type: String,
            required: true,
        },
        /*
        m_sCodeTrans: {
            type: String,
            required: true,
        },
        m_sDescFra: {
            type: String,
            required: true,
        },

        m_sDescAng: {
            type: String,
            required: true,
        },
        m_sTypeProduit: {
            type: String,
            required: true,
        },
        m_eIDProdModele: {
            type: String,
            required: true,
        },
        m_sCodeCat: {
            type: String,
            required: true,
        },
        m_sDescFraCat: {
            type: String,
            required: true,
        },
        m_sDescAngCat: {
            type: String,
            required: true,
        },
        m_sCodeSousCat: {
            type: String,
            required: true,
        },
        m_sDescSsFraCat: {
            type: String,
            required: true,
        },
        m_sDescSsAngCat: {
            type: String,
            required: true,
        },
        m_bTaxableTPS: {
            type: String,
            required: true,
        },
        m_bTaxableTVQ: {
            type: String,
            required: true,
        },
        m_mPrix: {
            type: String,
            required: true,
        },
        m_mPrixEnSolde: {
            type: String,
            required: true,
        },
        m_mQuantite: {
            type: String,
            required: true,
        },
        m_nPoids: {
            type: String,
            required: true,
        },
        m_sNoteTechFra: {
            type: String,
            required: true,
        },
        m_sNoteTechAng: {
            type: String,
            required: true,
        },
        m_tbCategories:
            [

            ],
        m_tbSpecifications:
            [

            ],
        m_tbGroupe:
            [

            ],
        m_tbCaracteristiques:
            [

            ]*/
    },
)
module.exports = mongoose.model('Product', productNewShema);



// autre version
/* 
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
  // Arrays can be left empty initially (optional):
  m_tbCategories: [String],
  m_tbSpecifications: [String],
  m_tbGroupe: [String],
  m_tbCaracteristiques: [String],
}, { timestamps: true }); // Add timestamps for automatic creation/modification tracking

module.exports = mongoose.model('Product', productSchema);
 */