const JUDETE_ROMANIA = [
  'Alba',
  'Arad',
  'Argeș',
  'Bacău',
  'Bihor',
  'Bistrița-Năsăud',
  'Botoșani',
  'Brăila',
  'Brașov',
  'București',
  'Buzău',
  'Caraș-Severin',
  'Călărași',
  'Cluj',
  'Constanța',
  'Covasna',
  'Dâmbovița',
  'Dolj',
  'Galați',
  'Giurgiu',
  'Gorj',
  'Harghita',
  'Hunedoara',
  'Ialomița',
  'Iași',
  'Ilfov',
  'Maramureș',
  'Mehedinți',
  'Mureș',
  'Neamț',
  'Olt',
  'Prahova',
  'Satu Mare',
  'Sălaj',
  'Sibiu',
  'Suceava',
  'Teleorman',
  'Timiș',
  'Tulcea',
  'Vaslui',
  'Vâlcea',
  'Vrancea',
];

const SET_JUDETE = new Set(JUDETE_ROMANIA);

function esteJudetValid(judet) {
  return SET_JUDETE.has((judet || '').trim());
}

function formateazaLocatie(localitate, judet) {
  const loc = (localitate || '').trim();
  const jud = (judet || '').trim();
  if (loc && jud) return `${loc}, ${jud}`;
  return loc || jud;
}

function valideazaLocatieEveniment(judet, localitate) {
  const jud = (judet || '').trim();
  const loc = (localitate || '').trim();

  if (!jud) {
    return { ok: false, error: 'Selectează județul.' };
  }
  if (!esteJudetValid(jud)) {
    return { ok: false, error: 'Județul selectat nu este valid.' };
  }
  if (!loc) {
    return { ok: false, error: 'Introdu localitatea.' };
  }
  if (loc.length > 200) {
    return { ok: false, error: 'Localitatea este prea lungă (maximum 200 caractere).' };
  }

  return {
    ok: true,
    judet: jud,
    localitate: loc,
    locatie: formateazaLocatie(loc, jud),
  };
}

module.exports = {
  JUDETE_ROMANIA,
  esteJudetValid,
  formateazaLocatie,
  valideazaLocatieEveniment,
};
