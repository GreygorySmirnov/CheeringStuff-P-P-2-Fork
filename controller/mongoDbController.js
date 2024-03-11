


/* 
console.log('coucouuuuuuuuuuuuuuuu bitchezzzzzzzzzzzzzzzzzzzzzzzzzzz')

const productData = [
  // Paste your actual product data here in the array
  {
    "m_eIDProduit": 129,
    "m_sNoProduit": "903003                                       ",
    "m_sCodeTrans": "A",
    "m_sDescFra": "KLAXON HONK HONK JAUNE",
    "m_sDescAng": "HONK HONK HORN YELLOW",
    // ... other product details
  },
  {
    "m_eIDProduit": 130,
    "m_sNoProduit": "903004                                       ",
    "m_sCodeTrans": "A",
    "m_sDescFra": "KLAXON HONK HONK NOIRE",
    "m_sDescAng": "HONK HONK HORN BLACK",
    // ... other product details
  },
  // ... all your other product data objects
];

async function importProducts() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    // Insert all products in the collection
    await collection.insertMany(productData);

    console.log("Products successfully imported!");
  } catch (error) {
    console.error("Error importing products:", error);
  } finally {
    await client.close();
  }
}

importProducts();
 */
