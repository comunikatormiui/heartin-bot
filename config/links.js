const links = [
  'http://eurheartj.oxfordjournals.org/content/early/2016/05/23/eurheartj.ehw106', // CVD Prevention in clinical practice (European Guidelines on)
  'http://eurheartj.oxfordjournals.org/content/early/2016/05/19/eurheartj.ehw128', // Acute and Chronic Heart Failure
  'http://eurheartj.oxfordjournals.org/content/36/44/3075', // Infective Endocarditis (Guidelines on Prevention, Diagnosis and Treatment of)
  'http://eurheartj.oxfordjournals.org/content/36/41/2793', // Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death
  'http://eurheartj.oxfordjournals.org/content/36/42/2921', // Pericardial Diseases (Guidelines on the Diagnosis and Management of)
  'http://eurheartj.oxfordjournals.org/content/37/3/267', // Acute Coronary Syndromes (ACS) in patients presenting without persistent ST-segment elevation (Management of)
  'http://eurheartj.oxfordjournals.org/content/37/1/67', // Pulmonary Hypertension (Guidelines on Diagnosis and Treatment of)
  {
    title: 'Hypertrophic Cardiomyopathy',
    link: 'http://eurheartj.oxfordjournals.org/content/35/39/2733.full-text.pdf'
  },
  {
    title: 'Aortic Diseases',
    link: 'http://eurheartj.oxfordjournals.org/content/35/41/2873.full-text.pdf'
  },
  {
    title: 'ESC/EACTS Guidelines on Myocardial Revascularisation',
    link: 'http://eurheartj.oxfordjournals.org/content/ehj/35/37/2541.full.pdf'
  },
  'http://eurheartj.oxfordjournals.org/content/35/43/3033', // 2014 ESC Guidelines on the diagnosis and management of acute pulmonary embolism
  {
    title: 'ESC/ESA Guidelines on non-cardiac surgery: cardiovascular assessment and management',
    link: 'http://eurheartj.oxfordjournals.org/content/35/35/2383.full-text.pdf'
  },
  {
    title: 'Diabetes, Pre-Diabetes and Cardiovascular Diseases developed with the EASD',
    link: 'http://eurheartj.oxfordjournals.org/content/34/39/3035.full.pdf'
  },
  {
    title: 'Stable Coronary Artery Disease (Management of)',
    link: 'http://eurheartj.oxfordjournals.org/content/34/38/2949.full.pdf'
  },
  {
    title: 'Cardiac Pacing and Cardiac Resynchronization Therapy',
    link: 'http://eurheartj.oxfordjournals.org/content/34/29/2281.full.pdf'
  },
  {
    title: 'Arterial Hypertension (Management of)',
    link: 'http://eurheartj.oxfordjournals.org/content/34/28/2159.full.pdf'
  },
  {
    title: 'Valvular Heart Disease (Management of)',
    link: 'http://eurheartj.oxfordjournals.org/content/ehj/33/19/2451.full.pdf'
  },
  {
    title: 'Atrial Fibrillation (Management of) 2010 and Focused Update (2012)',
    link: 'http://eurheartj.oxfordjournals.org/content/33/21/2719.full.pdf'
  },
  {
    title: 'Third Universal Definition of Myocardial Infarction',
    link: 'http://eurheartj.oxfordjournals.org/content/33/20/2551.full.pdf',
    numbers: false
  },
  'http://eurheartj.oxfordjournals.org/content/33/20/2569', // ESC Guidelines for the management of acute myocardial infarction in patients presenting with ST-segment elevation
  {
    title: 'Dyslipidaemias (Management of)',
    link: 'https://www.escardio.org/static_file/Escardio/Guidelines/publications/DYSLIPguidelines-dyslipidemias-FT.pdf'
  },
  {
    title: 'Cardiovascular Diseases during Pregnancy (Management of)',
    link: 'https://www.escardio.org/static_file/Escardio/Guidelines/publications/PREGN%20Guidelines-Pregnancy-FT.pdf'
  },
  {
    title: 'Peripheral Artery Diseases (Diagnosis and Treatment of)',
    link: 'http://eurheartj.oxfordjournals.org/content/32/22/2851.full.pdf'
  },
  {
    title: 'Grown-Up Congenital Heart Disease (Management of)',
    link: 'http://eurheartj.oxfordjournals.org/content/31/23/2915.full.pdf'
  },
  {
    title: 'Device Therapy in Heart Failure (Focused Update)',
    link: 'http://eurheartj.oxfordjournals.org/content/31/21/2677.full.pdf'
  },
  {
    title: 'Syncope (Guidelines on Diagnosis and Management of)',
    link: 'http://eurheartj.oxfordjournals.org/content/30/21/2631.full.pdf'
  },
  {
    title: 'The Role of Endomyocardial Biopsy in the Management of Cardiovascular Disease',
    link: 'http://eurheartj.oxfordjournals.org/content/28/24/3076.full.pdf'
  },
  {
    title: 'B-Adrenergic Receptor Blockers (Expert Consensus Document on)',
    link: 'http://eurheartj.oxfordjournals.org/content/25/15/1341.full.pdf'
  },
  {
    title: 'Angiotensin Converting Enzyme Inhibitors in Cardiovascular Disease (Expert Consensus Document on)',
    link: 'http://eurheartj.oxfordjournals.org/content/25/16/1454.full.pdf'
  },
  {
    title: 'Antiplatelet Agents (Expert Consensus Document on the Use of)',
    link: 'http://eurheartj.oxfordjournals.org/content/25/2/166.full.pdf'
  },
  {
    title: 'Supraventricular Arrhythmias (ACC/AHA/ESC Guidelines for the Management of Patients with)',
    link: 'https://www.escardio.org/static_file/Escardio/Guidelines/publications/SVAguidelines-SVA-FT.pdf'
  },
  {
    title: 'Estimation of ten-year risk of fatal cardiovascular disease in Europe: the SCORE project',
    link: 'http://eurheartj.oxfordjournals.org/content/24/11/987.full.pdf'
  },
  {
    title: 'Medical Practice Guidelines: Separating science from economics',
    link: 'http://eurheartj.oxfordjournals.org/content/24/21/1962.full.pdf'
  },
  {
    title: 'Neonatal Electrocardiogram (Guidelines for the interpretation of the)',
    link: 'http://eurheartj.oxfordjournals.org/content/23/17/1329.full.pdf'
  },
  {
    title: 'Chest Pain (Management of)',
    link: 'http://eurheartj.oxfordjournals.org/content/23/15/1153.full.pdf'
  }
];

export default links;
