export interface IslamicQuote {
  arabic: string
  translation: string
  source: string
  type: 'ayah' | 'hadith'
}

export const islamicQuotes: IslamicQuote[] = [
  {
    arabic: 'وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ',
    translation: 'And that there is not for man except that for which he strives.',
    source: 'Surah An-Najm 53:39',
    type: 'ayah',
  },
  {
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    translation: 'And whoever relies upon Allah — then He is sufficient for him.',
    source: 'Surah At-Talaq 65:3',
    type: 'ayah',
  },
  {
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'Indeed, with hardship will be ease.',
    source: 'Surah Ash-Sharh 94:6',
    type: 'ayah',
  },
  {
    arabic: 'وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ',
    translation: 'And say: Work, for Allah will see your deeds.',
    source: 'Surah At-Tawbah 9:105',
    type: 'ayah',
  },
  {
    arabic: 'فَإِذَا فَرَغْتَ فَانصَبْ',
    translation: 'So when you have finished your duties, then stand up for worship.',
    source: 'Surah Ash-Sharh 94:7',
    type: 'ayah',
  },
  {
    arabic: 'وَابْتَغِ فِيمَا آتَاكَ اللَّهُ الدَّارَ الْآخِرَةَ وَلَا تَنسَ نَصِيبَكَ مِنَ الدُّنْيَا',
    translation: 'Seek, through that which Allah has given you, the home of the Hereafter; and do not forget your share of the world.',
    source: 'Surah Al-Qasas 28:77',
    type: 'ayah',
  },
  {
    arabic: 'إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ',
    translation: 'Indeed, Allah does not allow to be lost the reward of those who do good.',
    source: 'Surah At-Tawbah 9:120',
    type: 'ayah',
  },
  {
    arabic: 'وَتَوَكَّلْ عَلَى اللَّهِ وَكَفَىٰ بِاللَّهِ وَكِيلًا',
    translation: 'And put your trust in Allah, and sufficient is Allah as a Disposer of affairs.',
    source: 'Surah Al-Ahzab 33:3',
    type: 'ayah',
  },
  {
    arabic: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ',
    translation: 'Allah will raise those who have believed among you and those who were given knowledge, by degrees.',
    source: 'Surah Al-Mujadila 58:11',
    type: 'ayah',
  },
  {
    arabic: 'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ',
    translation: 'And my success is not but through Allah.',
    source: 'Surah Hud 11:88',
    type: 'ayah',
  },
  {
    arabic: 'اطْلُبُوا الْعِلْمَ مِنَ الْمَهْدِ إِلَى اللَّحْدِ',
    translation: 'Seek knowledge from the cradle to the grave.',
    source: 'Hadith',
    type: 'hadith',
  },
  {
    arabic: 'إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ',
    translation: 'Indeed Allah loves that when one of you does a deed, he does it with excellence.',
    source: 'Al-Bayhaqi',
    type: 'hadith',
  },
  {
    arabic: 'خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ',
    translation: 'The best of people are those most beneficial to people.',
    source: "Al-Mu'jam Al-Awsat",
    type: 'hadith',
  },
  {
    arabic: 'مَا أَكَلَ أَحَدٌ طَعَامًا قَطُّ خَيْرًا مِنْ أَنْ يَأْكُلَ مِنْ عَمَلِ يَدِهِ',
    translation: 'No one has ever eaten food better than that which he earned by the work of his own hands.',
    source: 'Sahih Al-Bukhari',
    type: 'hadith',
  },
  {
    arabic: 'إِنَّ اللَّهَ كَتَبَ الإِحْسَانَ عَلَى كُلِّ شَيْءٍ',
    translation: 'Indeed Allah has prescribed excellence in all things.',
    source: 'Sahih Muslim',
    type: 'hadith',
  },
  {
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ',
    translation: 'Whoever treads a path seeking knowledge, Allah will make easy for him the path to Paradise.',
    source: 'Sahih Muslim',
    type: 'hadith',
  },
  {
    arabic: 'التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ',
    translation: 'The truthful, trustworthy merchant will be with the Prophets, the truthful, and the martyrs.',
    source: 'Sunan At-Tirmidhi',
    type: 'hadith',
  },
  {
    arabic: 'احْرِصْ عَلَى مَا يَنْفَعُكَ وَاسْتَعِنْ بِاللَّهِ وَلَا تَعْجَزْ',
    translation: 'Be keen for what benefits you, seek help from Allah, and do not be helpless.',
    source: 'Sahih Muslim',
    type: 'hadith',
  },
  {
    arabic: 'الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ',
    translation: 'The strong believer is better and more beloved to Allah than the weak believer.',
    source: 'Sahih Muslim',
    type: 'hadith',
  },
  {
    arabic: 'مَنْ كَانَتْ نِيَّتُهُ طَلَبَ الآخِرَةِ جَمَعَ اللَّهُ لَهُ شَمْلَهُ',
    translation: 'Whoever makes the Hereafter his goal, Allah gathers his affairs for him.',
    source: 'Sunan Ibn Majah',
    type: 'hadith',
  },
  {
    arabic: 'وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ',
    translation: 'But perhaps you hate a thing and it is good for you.',
    source: 'Surah Al-Baqarah 2:216',
    type: 'ayah',
  },
  {
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    translation: 'Sufficient for us is Allah, and He is the best Disposer of affairs.',
    source: 'Surah Al-Imran 3:173',
    type: 'ayah',
  },
  {
    arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    translation: 'Indeed, Allah is with the patient.',
    source: 'Surah Al-Baqarah 2:153',
    type: 'ayah',
  },
  {
    arabic: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ',
    translation: 'And your Lord is going to give you, and you will be satisfied.',
    source: 'Surah Ad-Duha 93:5',
    type: 'ayah',
  },
  {
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'For indeed, with hardship will be ease.',
    source: 'Surah Ash-Sharh 94:5',
    type: 'ayah',
  },
  {
    arabic: 'وَاللَّهُ خَيْرُ الرَّازِقِينَ',
    translation: 'And Allah is the best of providers.',
    source: "Surah Al-Jumu'ah 62:11",
    type: 'ayah',
  },
  {
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    translation: 'My Lord, increase me in knowledge.',
    source: 'Surah Ta-Ha 20:114',
    type: 'ayah',
  },
  {
    arabic: 'وَمَا النَّصْرُ إِلَّا مِنْ عِندِ اللَّهِ',
    translation: 'And victory is not except from Allah.',
    source: 'Surah Al-Anfal 8:10',
    type: 'ayah',
  },
  {
    arabic: 'إِنَّ مَعَ الصَّبْرِ النَّصْرَ وَمَعَ الْكَرْبِ الْفَرَجَ',
    translation: 'With patience comes victory, and with hardship comes relief.',
    source: 'Musnad Ahmad',
    type: 'hadith',
  },
  {
    arabic: 'الدُّنْيَا مَزْرَعَةُ الْآخِرَةِ',
    translation: 'The world is the farm of the Hereafter.',
    source: 'Kashf Al-Khafa',
    type: 'hadith',
  },
]

export function getDailyQuote(): IslamicQuote {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  return islamicQuotes[dayOfYear % islamicQuotes.length]
}
