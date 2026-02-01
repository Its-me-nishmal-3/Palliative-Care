export const normalizeWardName = (name: string): string => {
    if (!name) return name;
    // Normalize "നാട്ടുക്കൽ" to "നാട്ടുകൽ"
    if (name === 'നാട്ടുക്കൽ') return 'നാട്ടുകൽ';
    // Normalize "കാമ്പ്രം" to "തേക്കുംമുറി"
    if (name === 'കാമ്പ്രം') return 'തേക്കുംമുറി';
    return name;
};

export const transliterateWard = (name: string): string => {
    const mapping: Record<string, string> = {
        'കുണ്ടൂർകുന്ന്': 'Kundurkunnu',
        'കൂത്തുപറമ്പ്': 'Koothuparamba',
        'കിഴക്കുംപുറം': 'Kizhakumpuram',
        'ചോളോട്': 'Cholode',
        'നറുക്കോട്': 'Narukkode',
        'കൂരിമുക്ക്': 'Koorimukku',
        'മുറിയങ്കണ്ണി': 'Muriyankanni',
        'തേക്കുംമുറി': 'Thekkummuri',
        'കാമ്പ്രം': 'Thekkummuri', // Handle legacy data in PDF/Excel
        'പൂവ്വത്താണി': 'Poovathani',
        'വെള്ളക്കുന്ന്': 'Vellakkunnu',
        'കരിങ്കല്ലത്താണി': 'Karinkallathani',
        'തൊടൂകാപ്പ്': 'Thodukappu',
        'തള്ളച്ചിറ': 'Thallachira',
        'മണലുംപുറം': 'Manalumpuram',
        '53 ാം മൈൽ': '53rd Mile',
        'പാറപ്പുറം': 'Parappuram',
        'നാട്ടുകൽ': 'Nattukal',
        'അണ്ണാൻതൊടി': 'Annanthodi',
        'പുതുമനക്കുളമ്പ്': 'Puthumanakkulambu',
        'പഴഞ്ചീരി': 'Pazhanchiri',
        'പാലോട്': 'Palode',
        'പാറമ്മൽ': 'Parammal',
        'കുന്നുംപുറം': 'Kunnumpuram',
        'കൊടക്കാട്': 'Kodakkad',
        'Other': 'Other'
    };
    return mapping[name] || name;
};
