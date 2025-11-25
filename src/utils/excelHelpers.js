import * as XLSX from 'xlsx';

const getDateString = () => new Date().toISOString().split('T')[0];

// --- IZVOZ (EXPORT) ---
export const exportToExcel = (data, fileName = 'proizvodi') => {
  const cleanData = data.map((item) => {
    const row = {
      ID: item.id,
      Naziv: item.name,
      Brend: item.brand,
      Odeljenje: item.department || 'satovi',
      Kategorija: item.category,
      Pol: item.gender || 'Unisex',
      Cena: item.price,
      Slika: item.image || '',
      Opis: item.description || '',
    };

    if (item.specs && typeof item.specs === 'object') {
      Object.keys(item.specs).forEach((key) => {
        row[`Spec: ${key}`] = item.specs[key];
      });
    }

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(cleanData);

  const wscols = [
    { wch: 25 },
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 10 },
    { wch: 10 },
    { wch: 30 },
    { wch: 40 },
  ];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lager Lista');
  XLSX.writeFile(workbook, `DajaShop_${fileName}_${getDateString()}.xlsx`);
};

// --- UVOZ (IMPORT) ---
export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

// --- NAPREDNI ŠABLON ---
export const downloadTemplate = (
  existingBrands = [],
  existingCategories = []
) => {
  const templateData = [
    {
      ID: '',
      Naziv: 'Primer: Casio Edifice',
      Brend: 'Casio',
      Odeljenje: 'satovi',
      Kategorija: 'Edifice',
      Pol: 'MUŠKI',
      Cena: 15900,
      Slika: 'https://link-do-slike.com/sat.jpg',
      Opis: 'Opis proizvoda...',
      'Spec: Mehanizam': 'Kvarcni',
      'Spec: Staklo': 'Safirno',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  worksheet['!cols'] = [
    { wch: 25 },
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 10 },
    { wch: 30 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Unos Proizvoda');

  const refData = [];
  const maxRows = Math.max(existingBrands.length, existingCategories.length, 4);
  const depts = ['satovi', 'naocare', 'baterije', 'daljinski'];
  const genders = ['MUŠKI', 'ŽENSKI', 'UNISEX (ostavi prazno)'];

  for (let i = 0; i < maxRows; i++) {
    refData.push({
      'Postojeći Brendovi': existingBrands[i]?.name || '',
      'Postojeće Kategorije': existingCategories[i]?.name || '',
      'Dozvoljena Odeljenja': depts[i] || '',
      'Dozvoljeni Polovi': genders[i] || '',
    });
  }

  const refWorksheet = XLSX.utils.json_to_sheet(refData);
  refWorksheet['!cols'] = [{ wch: 25 }, { wch: 25 }, { wch: 20 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(workbook, refWorksheet, 'Šifarnik (Pomoć)');

  XLSX.writeFile(workbook, `DajaShop_Sablon_i_Sifarnik.xlsx`);
};
